import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { getSenadores, getDiputados, getVotaciones_Boletin, getVotacionDetalle } from '@/lib/api/opendata-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();

        // 1. FRESH LOAD OF PARLIAMENTARIANS (INLINE)
        const [senData, dipData] = await Promise.all([getSenadores(), getDiputados()]);
        const parlsToInsert = [
            ...senData.map(s => ({
                external_id: `SEN-${s.id}`,
                nombre_completo: `${s.nombre} ${s.apellidoPaterno} ${s.apellidoMaterno}`.trim(),
                nombre: s.nombre,
                apellido_paterno: s.apellidoPaterno,
                apellido_materno: s.apellidoMaterno,
                partido: s.partido,
                ideologia: 'Centro',
                camara: 'senado',
                region: s.region || 'Metropolitana',
                vigente: true
            })),
            ...dipData.map(d => ({
                external_id: `DIP-${d.id}`,
                nombre_completo: `${d.nombre} ${d.apellidoPaterno} ${d.apellidoMaterno}`.trim(),
                nombre: d.nombre,
                apellido_paterno: d.apellidoPaterno,
                apellido_materno: d.apellidoMaterno,
                partido: d.partido || 'Independiente',
                ideologia: 'Centro',
                camara: 'camara',
                region: d.region || 'Metropolitana',
                vigente: true
            }))
        ];

        console.log(`[INLINE-SYNC] Upserting ${parlsToInsert.length} parliamentarians...`);
        const { data: dbParls, error: pErr } = await supabase.from('parliamentarians').upsert(parlsToInsert, { onConflict: 'external_id' }).select();
        if (pErr) throw pErr;

        const parlMap = new Map();
        dbParls.forEach(p => parlMap.set(p.external_id, p.id));
        console.log(`[INLINE-SYNC] Internal Map Size: ${parlMap.size}`);

        // 2. SYNC REAL VOTES FOR A FEW BILLS
        const billsToTest = ["16598-04", "16321-11", "16234-25"];
        let totalVotes = 0;

        for (const boletin of billsToTest) {
            const sessions = await getVotaciones_Boletin(boletin);
            for (const sess of sessions) {
                const { data: vRec } = await supabase.from('votes').upsert({
                    external_id: `VOT-REAL-${sess.id}`,
                    boletin: boletin,
                    fecha: sess.fecha,
                    camara: 'camara',
                    materia: 'Proyecto Real',
                    resultado: 'aprobado',
                    tipo: 'sala'
                }, { onConflict: 'external_id' }).select().single();

                if (vRec) {
                    const roll = await getVotacionDetalle(sess.id);
                    const inserts = roll.map(ind => {
                        const pid = parlMap.get(`DIP-${ind.parliamentarianId}`);
                        if (!pid) return null;
                        return {
                            vote_id: vRec.id,
                            parliamentarian_id: pid,
                            voto: ind.opcion.toLowerCase().includes('favor') ? 'a_favor' : 'contra'
                        };
                    }).filter(Boolean);

                    if (inserts.length > 0) {
                        await supabase.from('vote_roll_call').upsert(inserts, { onConflict: 'vote_id,parliamentarian_id' });
                        totalVotes += inserts.length;
                    }
                }
            }
        }

        return NextResponse.json({ success: true, parls: dbParls.length, votes: totalVotes });

    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
