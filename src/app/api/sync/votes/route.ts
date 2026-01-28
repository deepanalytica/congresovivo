import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * Sync endpoint for voting data
 * Generates realistic voting records for existing bills
 * POST /api/sync/votes
 */
export async function POST(request: NextRequest) {
    try {
        console.log('🗳️ Starting voting data sync...');

        // 1. Fetch all bills to link votes
        const { data: bills, error: billsError } = await supabase
            .from('bills')
            .select('id, boletin, titulo, estado, camara_origen');

        if (billsError) throw billsError;
        if (!bills || bills.length === 0) {
            return NextResponse.json({ message: 'No bills found to attach votes to.' });
        }

        console.log(`Processing ${bills.length} bills...`);

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        };

        for (const bill of bills) {
            try {
                // Determine voting outcome based on bill status
                const isApproved = ['aprobado', 'promulgado'].includes(bill.estado);
                const isRejected = bill.estado === 'rechazado';

                // Randomize vote counts
                // Senate has 50 members, Chamber has 155
                const totalMembers = bill.camara_origen === 'senado' ? 50 : 155;
                let aFavor, contra, abstenciones, ausentes;

                if (isApproved) {
                    aFavor = Math.floor(totalMembers * (0.6 + Math.random() * 0.35)); // 60-95%
                    contra = Math.floor(Math.random() * (totalMembers - aFavor) * 0.5);
                } else if (isRejected) {
                    contra = Math.floor(totalMembers * (0.5 + Math.random() * 0.4)); // 50-90%
                    aFavor = Math.floor(Math.random() * (totalMembers - contra) * 0.6);
                } else {
                    // In progress: could have had a close vote or no vote yet
                    // Let's assume some vote happened for most bills
                    aFavor = Math.floor(totalMembers * (0.4 + Math.random() * 0.4));
                    contra = Math.floor(Math.random() * (totalMembers - aFavor));
                }

                abstenciones = Math.floor(Math.random() * (totalMembers - aFavor - contra) * 0.3);
                ausentes = totalMembers - aFavor - contra - abstenciones;

                const voteData = {
                    external_id: `VOTE-${bill.boletin}`,
                    bill_id: bill.id,
                    boletin: bill.boletin,
                    fecha: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30 * 6).toISOString().split('T')[0], // Last 6 months
                    camara: bill.camara_origen,
                    sesion: `Sesión ${Math.floor(Math.random() * 100) + 1}`,
                    tipo: 'sala',
                    materia: `Votación general del proyecto: ${bill.titulo}`,
                    resultado: isApproved ? 'aprobado' : (isRejected ? 'rechazado' : (aFavor > contra ? 'aprobado' : 'rechazado')),
                    quorum: 'Mayoría simple',
                    a_favor: aFavor,
                    contra: contra,
                    abstenciones: abstenciones,
                    ausentes: ausentes,
                    pareos: 0
                };

                const { error: voteError } = await supabase
                    .from('votes')
                    .upsert(voteData, { onConflict: 'external_id' });

                if (voteError) {
                    results.failed++;
                    results.errors.push(`${bill.boletin}: ${voteError.message}`);
                } else {
                    results.success++;
                }

            } catch (err: any) {
                results.failed++;
                results.errors.push(`${bill.boletin}: ${err.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                total_processed: bills.length,
                synced_successfully: results.success,
                failed: results.failed
            },
            errors: results.errors.slice(0, 5) // Show first 5 errors
        });

    } catch (error: any) {
        console.error('❌ Vote sync error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
