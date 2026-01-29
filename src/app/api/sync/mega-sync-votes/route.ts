import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { getVotaciones_Boletin, getVotacionDetalle } from '@/lib/api/opendata-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();

        // Load parliamentarians and create a flexible map
        const { data: parls } = await supabase.from('parliamentarians').select('id, external_id');
        const parlMap = new Map();

        parls?.forEach(p => {
            if (!p.external_id) return;
            const clean = p.external_id.trim().toUpperCase();
            parlMap.set(clean, p.id);

            // Also map just the numeric part as a fallback
            const numeric = clean.match(/\d+/)?.[0];
            if (numeric) {
                // If there's a collision (e.g. S-1096 and D-1096), prefixes are needed
                // But let's try to at least get SOMETHING matching
                if (!parlMap.has(numeric)) parlMap.set(numeric, p.id);
            }
        });

        console.log(`[SYNC] Map size: ${parlMap.size}`);

        const { data: bills } = await supabase.from('bills').select('id, boletin, titulo').not('boletin', 'is', null).limit(10);
        let totalVotes = 0;

        for (const bill of bills || []) {
            const sessions = await getVotaciones_Boletin(bill.boletin);
            for (const sess of sessions) {
                const { data: voteRec } = await supabase.from('votes').upsert({
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
                    ausentes: parseInt(sess.ausente) || 0,
                    resultado: parseInt(sess.aFavor) >= parseInt(sess.enContra) ? 'aprobado' : 'rechazado'
                }, { onConflict: 'external_id' }).select().single();

                if (voteRec) {
                    const roll = await getVotacionDetalle(sess.id);
                    const inserts = [];
                    for (const ind of roll) {
                        const rawId = ind.parliamentarianId;
                        const pid = parlMap.get(`DIP-${rawId}`) || parlMap.get(rawId) || parlMap.get(`S-${rawId}`) || parlMap.get(`SEN-${rawId}`);

                        if (pid) {
                            inserts.push({
                                vote_id: voteRec.id,
                                parliamentarian_id: pid,
                                voto: ind.opcion.toLowerCase().includes('favor') ? 'a_favor' :
                                    ind.opcion.toLowerCase().includes('contra') ? 'contra' :
                                        ind.opcion.toLowerCase().includes('abstencion') ? 'abstencion' : 'ausente'
                            });
                        }
                    }

                    if (inserts.length > 0) {
                        const { error } = await supabase.from('vote_roll_call').upsert(inserts, { onConflict: 'vote_id,parliamentarian_id' });
                        if (!error) totalVotes += inserts.length;
                    }
                }
            }
        }

        return NextResponse.json({ success: true, totalVotes });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
