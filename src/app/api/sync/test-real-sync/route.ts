import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { getVotaciones_Boletin, getVotacionDetalle } from '@/lib/api/opendata-client';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();

        // 1. Ensure Bill exists (DIP-16598-04)
        const boletin = "16598-04";
        const { data: bill } = await supabase.from('bills').upsert({
            external_id: "REAL-16598-04",
            boletin: boletin,
            titulo: "Proyecto de Ley sobre Reajuste de Sector Público", // Example
            estado: "sala",
            camara_origen: "camara",
            urgencia: "inmediata",
            fecha_ingreso: "2024-01-01",
            iniciativa: "ejecutivo"
        }, { onConflict: 'boletin' }).select().single();

        if (!bill) throw new Error("Could not create/find bill");

        // 2. Load Parliamentarians
        const { data: parls } = await supabase.from('parliamentarians').select('id, external_id');
        const parlMap = new Map();
        parls?.forEach(p => {
            if (p.external_id) parlMap.set(p.external_id.trim().toUpperCase(), p.id);
        });

        const sessions = await getVotaciones_Boletin(boletin);
        let countSaved = 0;

        for (const sess of sessions) {
            const { data: vote } = await supabase.from('votes').upsert({
                external_id: `VOT-DIP-${sess.id}`,
                bill_id: bill.id,
                fecha: sess.fecha,
                camara: 'camara',
                tipo: 'sala',
                materia: bill.titulo,
                boletin: sess.boletin,
                a_favor: parseInt(sess.aFavor) || 0,
                contra: parseInt(sess.enContra) || 0,
                abstenciones: parseInt(sess.abstencion) || 0,
                resultado: parseInt(sess.aFavor) >= parseInt(sess.enContra) ? 'aprobado' : 'rechazado'
            }, { onConflict: 'external_id' }).select().single();

            if (vote) {
                const roll = await getVotacionDetalle(sess.id);
                const inserts = roll.map(ind => {
                    const pid = parlMap.get(`DIP-${ind.parliamentarianId.trim()}`.toUpperCase());
                    if (!pid) return null;
                    return {
                        vote_id: vote.id,
                        parliamentarian_id: pid,
                        voto: ind.opcion.toLowerCase().includes('favor') ? 'a_favor' :
                            ind.opcion.toLowerCase().includes('contra') ? 'contra' :
                                ind.opcion.toLowerCase().includes('abstencion') ? 'abstencion' : 'ausente'
                    };
                }).filter(Boolean);

                if (inserts.length > 0) {
                    await supabase.from('vote_roll_call').upsert(inserts, { onConflict: 'vote_id,parliamentarian_id' });
                    countSaved += inserts.length;
                }
            }
        }

        return NextResponse.json({ success: true, billId: bill.id, sessions: sessions.length, countSaved });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
