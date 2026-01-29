import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
    retornarDistritos,
    retornarRegiones,
    retornarComunas,
    retornarProvincias,
    retornarMinisterios
} from '@/lib/api/opendata';

export const dynamic = 'force-dynamic';

/**
 * Sync all reference data from OpenData API to database
 * - Distritos (electoral districts)
 * - Regiones (regions)
 * - Comunas (municipalities)
 * - Provincias (provinces)
 * - Ministerios (government ministries)
 */
export async function POST() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const results = {
            distritos: 0,
            regiones: 0,
            comunas: 0,
            provincias: 0,
            ministerios: 0,
            errors: [] as string[]
        };

        // Sync Distritos
        try {
            const distritos = await retornarDistritos();
            for (const distrito of distritos) {
                await supabase
                    .from('reference_data')
                    .upsert({
                        category: 'distrito',
                        code: distrito.codigo,
                        name: distrito.nombre,
                        metadata: { diputados: distrito.diputados }
                    }, {
                        onConflict: 'category,code'
                    });
                results.distritos++;
            }
        } catch (e: any) {
            results.errors.push(`Distritos: ${e.message}`);
        }

        // Sync Regiones
        try {
            const regiones = await retornarRegiones();
            for (const region of regiones) {
                await supabase
                    .from('reference_data')
                    .upsert({
                        category: 'region',
                        code: region.codigo,
                        name: region.nombre
                    }, {
                        onConflict: 'category,code'
                    });
                results.regiones++;
            }
        } catch (e: any) {
            results.errors.push(`Regiones: ${e.message}`);
        }

        // Sync Comunas
        try {
            const comunas = await retornarComunas();
            for (const comuna of comunas) {
                await supabase
                    .from('reference_data')
                    .upsert({
                        category: 'comuna',
                        code: comuna.codigo,
                        name: comuna.nombre,
                        parent_code: comuna.provincia,
                        metadata: { region: comuna.region }
                    }, {
                        onConflict: 'category,code'
                    });
                results.comunas++;
            }
        } catch (e: any) {
            results.errors.push(`Comunas: ${e.message}`);
        }

        // Sync Provincias
        try {
            const provincias = await retornarProvincias();
            for (const provincia of provincias) {
                await supabase
                    .from('reference_data')
                    .upsert({
                        category: 'provincia',
                        code: provincia.codigo,
                        name: provincia.nombre,
                        parent_code: provincia.region
                    }, {
                        onConflict: 'category,code'
                    });
                results.provincias++;
            }
        } catch (e: any) {
            results.errors.push(`Provincias: ${e.message}`);
        }

        // Sync Ministerios
        try {
            const ministerios = await retornarMinisterios();
            for (const ministerio of ministerios) {
                await supabase
                    .from('reference_data')
                    .upsert({
                        category: 'ministerio',
                        code: ministerio.codigo,
                        name: ministerio.nombre
                    }, {
                        onConflict: 'category,code'
                    });
                results.ministerios++;
            }
        } catch (e: any) {
            results.errors.push(`Ministerios: ${e.message}`);
        }

        // Update sync status
        await supabase
            .from('sync_status')
            .upsert({
                sync_type: 'reference_data',
                last_sync_at: new Date().toISOString(),
                status: results.errors.length > 0 ? 'completed_with_errors' : 'completed',
                records_synced: results.distritos + results.regiones + results.comunas + results.provincias + results.ministerios,
                error_message: results.errors.length > 0 ? results.errors.join('; ') : null,
                metadata: results
            }, {
                onConflict: 'sync_type'
            });

        return NextResponse.json({
            success: results.errors.length === 0,
            results,
            total_synced: results.distritos + results.regiones + results.comunas + results.provincias + results.ministerios
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}

/**
 * Get sync status for reference data
 */
export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: status } = await supabase
            .from('sync_status')
            .select('*')
            .eq('sync_type', 'reference_data')
            .single();

        const { data: counts } = await supabase
            .from('reference_data')
            .select('category')
            .then(({ data }) => {
                const categoryCounts: Record<string, number> = {};
                data?.forEach(item => {
                    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
                });
                return { data: categoryCounts };
            });

        return NextResponse.json({
            last_sync: status?.last_sync_at,
            status: status?.status,
            counts
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
