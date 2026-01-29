import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { retornarComisionesVigentes, retornarSesionesXComisionYAnno } from '@/lib/api/opendata';

export const dynamic = 'force-dynamic';

/**
 * Sync committees and their recent sessions from OpenData API
 */
export async function POST() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const currentYear = new Date().getFullYear();
        let committeesCount = 0;
        let sessionsCount = 0;
        const errors: string[] = [];

        // Fetch active committees
        const comisiones = await retornarComisionesVigentes();

        for (const comision of comisiones) {
            try {
                // Upsert committee
                const { data: committee, error: commitError } = await supabase
                    .from('committees')
                    .upsert({
                        external_id: comision.id,
                        name: comision.nombre,
                        short_name: comision.nombreCorto,
                        description: comision.descripcion,
                        chamber: comision.camara,
                        committee_type: comision.tipo,
                        is_active: comision.activa,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'external_id'
                    })
                    .select()
                    .single();

                if (commitError) {
                    errors.push(`Committee ${comision.nombre}: ${commitError.message}`);
                    continue;
                }

                committeesCount++;

                // Fetch sessions for current year
                try {
                    const sesiones = await retornarSesionesXComisionYAnno(comision.id, currentYear);

                    for (const sesion of sesiones) {
                        const { error: sessionError } = await supabase
                            .from('committee_sessions')
                            .upsert({
                                committee_id: committee.id,
                                external_id: sesion.id,
                                session_number: sesion.numero,
                                session_date: sesion.fecha,
                                session_type: sesion.tipo,
                                status: sesion.estado,
                                description: sesion.descripcion,
                                location: sesion.ubicacion,
                                updated_at: new Date().toISOString()
                            }, {
                                onConflict: 'external_id'
                            });

                        if (!sessionError) {
                            sessionsCount++;
                        }
                    }
                } catch (sessionErr: any) {
                    // Sessions might not be available for all committees
                    console.log(`No sessions for ${comision.nombre}:`, sessionErr.message);
                }

            } catch (err: any) {
                errors.push(`Committee ${comision.nombre}: ${err.message}`);
            }
        }

        // Update sync status
        await supabase
            .from('sync_status')
            .upsert({
                sync_type: 'committees',
                last_sync_at: new Date().toISOString(),
                status: errors.length > 0 ? 'completed_with_errors' : 'completed',
                records_synced: committeesCount,
                error_message: errors.length > 0 ? errors.join('; ') : null,
                metadata: {
                    committees_count: committeesCount,
                    sessions_count: sessionsCount,
                    year: currentYear
                }
            }, {
                onConflict: 'sync_type'
            });

        return NextResponse.json({
            success: errors.length === 0,
            committees_synced: committeesCount,
            sessions_synced: sessionsCount,
            year: currentYear,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}

/**
 * Get sync status for committees
 */
export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: status } = await supabase
            .from('sync_status')
            .select('*')
            .eq('sync_type', 'committees')
            .single();

        const { count: committeesCount } = await supabase
            .from('committees')
            .select('*', { count: 'exact', head: true });

        const { count: sessionsCount } = await supabase
            .from('committee_sessions')
            .select('*', { count: 'exact', head: true });

        return NextResponse.json({
            last_sync: status?.last_sync_at,
            status: status?.status,
            committees_count: committeesCount,
            sessions_count: sessionsCount,
            metadata: status?.metadata
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
