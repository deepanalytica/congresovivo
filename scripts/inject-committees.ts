
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

async function run() {
    console.log('🚀 Starting Committee Data Injection...');

    // 1. Load Environment Variables
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf-8');
            envConfig.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^['"]|['"]$/g, '');
                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                }
            });
            console.log('✅ Loaded .env.local');
        }
    } catch (e) {
        console.error('⚠️ Error loading .env.local:', e);
    }

    // 2. Import OpenData (Dynamic to ensure env vars are potentially needed by internal clients, 
    // though opendata-client usually doesn't need them, but good practice)
    const { retornarComisionesVigentes, retornarSesionesXComisionYAnno } = await import('@/lib/api/opendata');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase Credentials');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const currentYear = new Date().getFullYear();
    let committeesCount = 0;
    let sessionsCount = 0;

    try {
        console.log('🔄 Fetching active committees...');
        const comisiones = await retornarComisionesVigentes();
        console.log(`Found ${comisiones.length} committees.`);

        for (const [index, comision] of comisiones.entries()) {
            console.log(`[${index + 1}/${comisiones.length}] Processing ${comision.nombre}...`);

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
                console.error(`❌ Error upserting committee ${comision.nombre}:`, commitError.message);
                continue;
            }

            committeesCount++;

            // Fetch sessions
            try {
                // console.log(`   Fetching sessions for ${currentYear}...`);
                const sesiones = await retornarSesionesXComisionYAnno(comision.id, currentYear);

                if (sesiones && sesiones.length > 0) {
                    // console.log(`   Found ${sesiones.length} sessions.`);
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
                }
            } catch (sessionErr: any) {
                console.warn(`   ⚠️ No sessions or error for ${comision.nombre}:`, sessionErr.message);
            }
        }

        console.log('✅ Committee Injection Complete');
        console.log(`Committees: ${committeesCount}, Sessions: ${sessionsCount}`);

    } catch (e: any) {
        console.error('❌ Fatal Error:', e.message);
    }
}

run();
