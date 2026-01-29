import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { getVotaciones_Boletin } from '@/lib/api/opendata-client';
import { SEED_BILLS } from '@/lib/constants/seed-bills';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();
        console.log(`Starting Sync for ${SEED_BILLS.length} Seed Bills...`);

        let processedBills = 0;
        let processedVotes = 0;
        let errors = [];

        for (const seed of SEED_BILLS) {
            try {
                // 1. Upsert Bill
                const billData = {
                    external_id: seed.boletin, // Use boletin as external_id since we don't have ID
                    boletin: seed.boletin,
                    titulo: seed.titulo,
                    estado: 'En Tramitación', // Default for seed
                    camara_origen: 'camara',
                    urgencia: 'Sin urgencia',
                    fecha_ingreso: seed.fecha_ingreso,
                    iniciativa: seed.iniciativa,
                    fecha_ultima_modificacion: new Date().toISOString()
                };

                const { error: billError } = await supabase
                    .from('bills')
                    .upsert(billData, { onConflict: 'boletin' });

                if (billError) {
                    console.error("Supabase Error Details:", JSON.stringify(billError));
                    // Don't throw, just push to errors and continue
                    errors.push({ boletin: seed.boletin, error: billError.message, details: billError });
                    continue;
                }
                processedBills++;

                // 2. Fetch Votes
                console.log(`Fetching votes for ${seed.boletin}...`);
                const votaciones = await getVotaciones_Boletin(seed.boletin);

                if (votaciones && votaciones.length > 0) {
                    // 3. Upsert Votes (if table exists)
                    // Map XML structure to DB schema
                    // Expected schema: id (uuid), external_id (text), boletin (text), fecha (timestamp), resultado (text), total_si, total_no, total_abst

                    const votesData = votaciones.map(v => ({
                        external_id: v.id,
                        boletin: v.boletin,
                        fecha: v.fecha,
                        resultado: v.resultado,
                        total_si: parseInt(v.aFavor) || 0,
                        total_no: parseInt(v.enContra) || 0,
                        total_abstencion: parseInt(v.abstencion) || 0,
                        tipo: 'Sala' // Default
                    }));

                    // Try to insert first vote to check schema/table
                    const { error: voteError } = await supabase
                        .from('votes')
                        .upsert(votesData, { onConflict: 'external_id' }); // Assuming unique external_id constraint

                    if (voteError) {
                        console.warn(`Vote Table Error (skipping votes for ${seed.boletin}):`, voteError.message);
                        if (voteError.message.includes('does not exist')) {
                            // Stop trying to insert votes if table missing
                        }
                    } else {
                        processedVotes += votesData.length;
                    }
                }
            } catch (e: any) {
                console.error(`Error processing ${seed.boletin}:`, e.message);
                errors.push({ boletin: seed.boletin, error: e.message });
            }
        }

        return NextResponse.json({
            success: true,
            bills: processedBills,
            votes: processedVotes,
            errors
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
