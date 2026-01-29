import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { retornarProyectosLeyXAnno, retornarAutoresProyecto } from '@/lib/api/opendata';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for batch processing

/**
 * Sync bills from OpenData API
 * Supports batch processing by year
 */
export async function POST(request: Request) {
    try {
        const { year } = await request.json();
        const currentYear = year || new Date().getFullYear();

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        let billsCount = 0;
        let authorsCount = 0;
        const errors: string[] = [];

        // Fetch bills for the year
        console.log(`Fetching bills for year ${currentYear}...`);
        const proyectos = await retornarProyectosLeyXAnno(currentYear);
        console.log(`Found ${proyectos.length} bills`);

        // Process in batches of 10
        const batchSize = 10;
        for (let i = 0; i < proyectos.length; i += batchSize) {
            const batch = proyectos.slice(i, i + batchSize);

            await Promise.all(batch.map(async (proyecto) => {
                try {
                    // Upsert bill
                    const { data: bill, error: billError } = await supabase
                        .from('bills')
                        .upsert({
                            bulletin_number: proyecto.boletin,
                            title: proyecto.titulo,
                            summary: proyecto.resumen,
                            bill_type: proyecto.tipo,
                            chamber_origin: proyecto.camaraOrigen,
                            initiative_type: proyecto.tipoIniciativa,
                            status: proyecto.estado,
                            current_stage: proyecto.etapa,
                            current_sub_stage: proyecto.subEtapa,
                            entry_date: proyecto.fechaIngreso,
                            publication_date: proyecto.fechaPublicacion,
                            law_number: proyecto.numeroLey,
                            urgency: proyecto.urgencia,
                            updated_at: new Date().toISOString()
                        }, {
                            onConflict: 'bulletin_number'
                        })
                        .select()
                        .single();

                    if (billError) {
                        errors.push(`Bill ${proyecto.boletin}: ${billError.message}`);
                        return;
                    }

                    billsCount++;

                    // Fetch and sync authors
                    try {
                        const autores = await retornarAutoresProyecto(proyecto.boletin);

                        for (const autor of autores) {
                            // Try to match author name with parliamentarian
                            const { data: parl } = await supabase
                                .from('parliamentarians')
                                .select('id')
                                .ilike('nombre_completo', `%${autor.nombre}%`)
                                .limit(1)
                                .single();

                            if (parl) {
                                await supabase
                                    .from('bill_authors')
                                    .upsert({
                                        bill_id: bill.id,
                                        parliamentarian_id: parl.id
                                    }, {
                                        onConflict: 'bill_id,parliamentarian_id',
                                        ignoreDuplicates: true
                                    });
                                authorsCount++;
                            }
                        }
                    } catch (authorErr) {
                        // Authors are optional, don't fail the whole bill
                        console.log(`Could not fetch authors for ${proyecto.boletin}`);
                    }

                } catch (err: any) {
                    errors.push(`Bill ${proyecto.boletin}: ${err.message}`);
                }
            }));

            // Brief pause between batches to avoid overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Update sync status
        await supabase
            .from('sync_status')
            .upsert({
                sync_type: 'bills',
                last_sync_at: new Date().toISOString(),
                status: errors.length > 0 ? 'completed_with_errors' : 'completed',
                records_synced: billsCount,
                error_message: errors.length > 0 ? errors.slice(0, 10).join('; ') : null,
                metadata: {
                    bills_count: billsCount,
                    authors_count: authorsCount,
                    year: currentYear,
                    total_errors: errors.length
                }
            }, {
                onConflict: 'sync_type'
            });

        return NextResponse.json({
            success: errors.length === 0,
            bills_synced: billsCount,
            authors_synced: authorsCount,
            year: currentYear,
            errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
            total_errors: errors.length
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}

/**
 * Get sync status for bills
 */
export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: status } = await supabase
            .from('sync_status')
            .select('*')
            .eq('sync_type', 'bills')
            .single();

        const { count: billsCount } = await supabase
            .from('bills')
            .select('*', { count: 'exact', head: true });

        const { count: authorsCount } = await supabase
            .from('bill_authors')
            .select('*', { count: 'exact', head: true });

        return NextResponse.json({
            last_sync: status?.last_sync_at,
            status: status?.status,
            bills_count: billsCount,
            authors_count: authorsCount,
            metadata: status?.metadata
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
