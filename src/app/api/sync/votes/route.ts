import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { retornarVotacionesXAnno, retornarVotacionDetalle } from '@/lib/api/opendata';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for heavy roll-call processing

/**
 * Real Sync endpoint for legislative votes and roll-call records
 * POST /api/sync/votes
 */
export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { year, limit = 20 } = body;
        const currentYear = year || new Date().getFullYear();

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log(`🔄 Syncing REAL votes for year ${currentYear}...`);

        // 1. Fetch all parliamentarians for mapping (external_id -> UUID)
        const { data: parls } = await supabase
            .from('parliamentarians')
            .select('id, external_id');

        const parlMap = new Map();
        parls?.forEach(p => parlMap.set(p.external_id, p.id));

        // 2. Fetch votes from OpenData API
        const votaciones = await retornarVotacionesXAnno(currentYear);
        console.log(`📥 Found ${votaciones.length} votes in OpenData`);

        // Process a subset to avoid timeouts (roll-calls require 1 API call per vote)
        const votesToProcess = votaciones.slice(0, limit);
        let votesSynced = 0;
        let recordsSynced = 0;
        const errors: string[] = [];

        for (const vot of votesToProcess) {
            try {
                // Find bill_id if bulletin exists in our database
                let bill_id = null;
                if (vot.boletin) {
                    const { data: bill } = await supabase
                        .from('bills')
                        .select('id')
                        .eq('bulletin_number', vot.boletin)
                        .maybeSingle();
                    bill_id = bill?.id;
                }

                // Upsert vote into legislative_votes
                const { data: voteEntry, error: voteError } = await supabase
                    .from('legislative_votes')
                    .upsert({
                        external_id: vot.id,
                        bill_id: bill_id,
                        vote_date: vot.fecha,
                        description: vot.descripcion,
                        result: vot.resultado.toLowerCase().includes('aprob') ? 'aprobado' :
                            vot.resultado.toLowerCase().includes('rechaz') ? 'rechazado' : 'otros',
                        quorum_type: vot.quorum,
                        vote_type: vot.tipo,
                        yes_count: vot.afirmativos,
                        no_count: vot.negativos,
                        abstention_count: vot.abstenciones,
                        absent_count: vot.dispensados,
                        paired_count: vot.pareos,
                        vote_context: 'sala'
                    }, { onConflict: 'external_id' })
                    .select()
                    .single();

                if (voteError) throw voteError;
                votesSynced++;

                // 3. Fetch Roll Call Detail (Nominal Vote)
                // This is the heavy part: call API for each vote's details
                const detalles = await retornarVotacionDetalle(vot.id);
                if (detalles.length > 0) {
                    const records = detalles.map(det => {
                        // Map DIP-ID to UUID
                        const extId = `DIP-${det.parlamentarioId}`;
                        const parlId = parlMap.get(extId);

                        if (!parlId) return null;

                        // Normalize Choice
                        let option = 'ausente';
                        const opt = det.opcion.toLowerCase();
                        if (opt.includes('afirmativo') || opt === 'si') option = 'si';
                        else if (opt.includes('negativo') || opt === 'no') option = 'no';
                        else if (opt.includes('abstencion')) option = 'abstencion';
                        else if (opt.includes('pareo')) option = 'pareo';

                        return {
                            vote_id: voteEntry.id,
                            parliamentarian_id: parlId,
                            vote_option: option
                        };
                    }).filter(r => r !== null);

                    if (records.length > 0) {
                        const { error: recError } = await supabase
                            .from('legislative_vote_records')
                            .upsert(records, { onConflict: 'vote_id, parliamentarian_id' });

                        if (recError) {
                            console.error(`Error saving records for vote ${vot.id}:`, recError);
                        } else {
                            recordsSynced += records.length;
                        }
                    }
                }
            } catch (err: any) {
                console.error(`❌ Error syncing vote ${vot.id}:`, err);
                errors.push(`${vot.id}: ${err.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                votes_synced: votesSynced,
                records_synced: recordsSynced,
                total_in_opendata: votaciones.length,
                processed_limit: limit
            },
            errors: errors.slice(0, 10)
        });

    } catch (error: any) {
        console.error('❌ Vote Sync Critical Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
