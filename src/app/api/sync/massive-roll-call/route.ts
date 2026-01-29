import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { getSenadores, getDiputados, getVotaciones_Boletin, getVotacionDetalle } from '@/lib/api/opendata-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();

        // 1. Get standardized Map
        const { data: dbParls } = await supabase.from('parliamentarians').select('id, external_id');
        const parlMap = new Map();
        dbParls?.forEach(p => parlMap.set(p.external_id, p.id));

        // 2. Sync votes for LAST 30 bills found in DB
        const { data: bills } = await supabase.from('bills').select('id, boletin, titulo').not('boletin', 'is', null).limit(30);

        let totalVotes = 0;
        let sessionsCount = 0;

        for (const bill of bills || []) {
            const sessions = await getVotaciones_Boletin(bill.boletin);
            for (const sess of sessions) {
                sessionsCount++;
                const { data: vRec } = await supabase.from('votes').upsert({
                    external_id: `VOT-REAL-${sess.id}`,
                    bill_id: bill.id,
                    fecha: sess.fecha,
                    camara: 'camara',
                    materia: bill.titulo,
                    resultado: parseInt(sess.aFavor) >= parseInt(sess.enContra) ? 'aprobado' : 'rechazado',
                    tipo: 'sala',
                    boletin: sess.boletin,
                    a_favor: parseInt(sess.aFavor) || 0,
                    contra: parseInt(sess.enContra) || 0,
                    abstenciones: parseInt(sess.abstencion) || 0
                }, { onConflict: 'external_id' }).select().single();

                if (vRec) {
                    const roll = await getVotacionDetalle(sess.id);
                    const inserts = roll.map(ind => {
                        const lookup = `DIP-${ind.parliamentarianId}`;
                        const pid = parlMap.get(lookup) || parlMap.get(lookup.toUpperCase()) || parlMap.get(ind.parliamentarianId);
                        if (!pid) return null;
                        return {
                            vote_id: vRec.id,
                            parliamentarian_id: pid,
                            voto: ind.opcion.toLowerCase().includes('favor') ? 'a_favor' :
                                ind.opcion.toLowerCase().includes('contra') ? 'contra' :
                                    ind.opcion.toLowerCase().includes('abstencion') ? 'abstencion' : 'ausente'
                        };
                    }).filter(Boolean);

                    if (inserts.length > 0) {
                        await supabase.from('vote_roll_call').upsert(inserts, { onConflict: 'vote_id,parliamentarian_id' });
                        totalVotes += inserts.length;
                    }
                }
            }
        }

        return NextResponse.json({ success: true, sessions: sessionsCount, totalVotes });

    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
