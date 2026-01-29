import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { getVotaciones_Boletin, getVotacionDetalle } from '@/lib/api/opendata-client';

/**
 * Targeted sync for specific bills to ensure full roll call data.
 * GET /api/sync/full-roll-call
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        // 1. Map parliamentarians by external_id
        const { data: parls } = await supabase.from('parliamentarians').select('id, external_id');
        const parlMap = new Map();
        parls?.forEach(p => {
            if (p.external_id) {
                const cleanId = p.external_id.trim().toUpperCase();
                parlMap.set(cleanId, p.id);
                const numeric = cleanId.match(/\d+/)?.[0];
                if (numeric) parlMap.set(numeric, p.id);
            }
        });

        // 2. Get bills with bulletin numbers
        const { data: bills } = await supabase.from('bills').select('id, boletin, titulo').not('boletin', 'is', null).limit(limit);

        const summary = [];

        for (const bill of bills!) {
            const sessions = await getVotaciones_Boletin(bill.boletin);
            for (const session of sessions) {
                // Upsert vote header
                const { data: voteRecord, error: vErr } = await supabase.from('votes').upsert({
                    external_id: `VOT-DIP-${session.id}`,
                    bill_id: bill.id,
                    fecha: session.fecha,
                    camara: 'camara',
                    tipo: 'sala',
                    materia: bill.titulo,
                    boletin: session.boletin,
                    a_favor: parseInt(session.aFavor) || 0,
                    contra: parseInt(session.enContra) || 0,
                    abstenciones: parseInt(session.abstenciones) || 0,
                    ausentes: parseInt(session.pareos) || 0,
                    resultado: (parseInt(session.aFavor) > parseInt(session.enContra)) ? 'aprobado' : 'rechazado'
                }, { onConflict: 'external_id' }).select().single();

                if (vErr || !voteRecord) continue;

                // Fetch and sync detail
                const rollCall = await getVotacionDetalle(session.id);
                let syncedCount = 0;

                for (const individual of rollCall) {
                    const lookupId = (individual.parliamentarianId || '').trim();
                    const localParlId = parlMap.get(`DIP-${lookupId}`) || parlMap.get(lookupId);

                    if (localParlId) {
                        let votoValue: 'a_favor' | 'contra' | 'abstencion' | 'ausente' = 'ausente';
                        const opcion = (individual.opcion || '').toLowerCase();
                        if (opcion.includes('favor')) votoValue = 'a_favor';
                        else if (opcion.includes('contra')) votoValue = 'contra';
                        else if (opcion.includes('abstencion')) votoValue = 'abstencion';

                        const { error: rcError } = await supabase.from('vote_roll_call').upsert({
                            vote_id: voteRecord.id,
                            parliamentarian_id: localParlId,
                            voto: votoValue
                        }, { onConflict: 'vote_id,parliamentarian_id' });

                        if (!rcError) syncedCount++;
                    }
                }
                summary.push({ session: session.id, synced: syncedCount, total: rollCall.length });
            }
        }

        return NextResponse.json({ success: true, summary });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
