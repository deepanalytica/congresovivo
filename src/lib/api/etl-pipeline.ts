/**
 * ETL Pipeline - Extract, Transform, Load
 * Fetches data from Chilean Congress Open Data APIs and stores in Supabase
 */

import { getSenadores, getDiputados, getProyectosLey } from './opendata-client';
import { partyToIdeology } from '@/lib/design-tokens';
import { getServerSupabase } from '@/lib/supabase/client';

/**
 * ETL Job: Sync Parliamentarians
 * Run this every 24 hours (parliamentarians don't change often)
 */
export async function syncParlamentarians() {
    console.log('🔄 ETL: Starting parliamentarian sync...');

    try {
        // 1. EXTRACT: Fetch from official APIs
        const [senadores, diputados] = await Promise.all([
            getSenadores(),
            getDiputados(),
        ]);

        console.log(`📥 Extracted ${senadores.length} senators, ${diputados.length} deputies`);

        // 2. TRANSFORM: Normalize data
        const allParlamentarians = [
            ...senadores.map(s => ({
                external_id: `S-${s.id}`,
                nombre_completo: `${s.nombre} ${s.apellidoPaterno} ${s.apellidoMaterno}`,
                nombre: s.nombre,
                apellido_paterno: s.apellidoPaterno,
                apellido_materno: s.apellidoMaterno,
                partido: s.partido,
                ideologia: partyToIdeology[s.partido] || 'independent',
                camara: 'senado' as const,
                region: s.region,
                circunscripcion: s.circunscripcion,
                email: s.email,
                telefono: s.telefono,
                vigente: true,
                synced_at: new Date().toISOString(),
            })),
            ...diputados.map(d => ({
                external_id: `D-${d.id}`,
                nombre_completo: `${d.nombre} ${d.apellidoPaterno} ${d.apellidoMaterno}`,
                nombre: d.nombre,
                apellido_paterno: d.apellidoPaterno,
                apellido_materno: d.apellidoMaterno,
                partido: d.partido,
                ideologia: partyToIdeology[d.partido] || 'independent',
                camara: 'camara' as const,
                region: d.region,
                distrito: d.distrito,
                email: d.email,
                vigente: true,
                synced_at: new Date().toISOString(),
            })),
        ];

        // 3. LOAD: Store in Supabase
        const supabase = getServerSupabase();

        console.log(`💾 Storing ${allParlamentarians.length} parliamentarians in database...`);

        const { data, error } = await supabase
            .from('parliamentarians')
            .upsert(allParlamentarians, {
                onConflict: 'external_id',
                ignoreDuplicates: false
            })
            .select();

        if (error) {
            console.error('❌ Database error:', error);
            throw error;
        }

        console.log(`✅ Successfully synced ${data?.length || allParlamentarians.length} parliamentarians`);

        return {
            success: true,
            count: data?.length || allParlamentarians.length,
            senators: senadores.length,
            deputies: diputados.length
        };

    } catch (error) {
        console.error('❌ ETL Error (Parliamentarians):', error);
        throw error;
    }
}

/**
 * ETL Job: Sync Legislative Bills
 * Run this every 1 hour during active session, every 6 hours otherwise
 */
export async function syncBills() {
    console.log('🔄 ETL: Starting bills sync...');

    try {
        // 1. EXTRACT
        const proyectos = await getProyectosLey();
        console.log(`📥 Extracted ${proyectos.length} bills`);

        // 2. TRANSFORM
        const bills = proyectos.map(p => {
            // Map API stages to our types
            const stageMap: Record<string, string> = {
                'Ingreso': 'ingreso',
                'Primer trámite constitucional': 'comision',
                'Segundo trámite constitucional': 'segundo_tramite',
                'Tercer trámite constitucional': 'comision_mixta',
                'Tribunal Constitucional': 'tribunal_constitucional',
                'Aprobado': 'aprobado',
                'Promulgado': 'promulgado',
                'Publicado': 'promulgado',
                'Rechazado': 'rechazado',
                'Archivado': 'archivado',
            };

            const urgencyMap: Record<string, string> = {
                'Sin urgencia': 'sin',
                'Simple': 'simple',
                'Suma': 'suma',
                'Discusión inmediata': 'inmediata',
            };

            return {
                external_id: p.id,
                boletin: p.boletin,
                titulo: p.titulo,
                estado: stageMap[p.etapa] || 'ingreso',
                camara_origen: (p.camara.toLowerCase() === 'senado' ? 'senado' : 'camara') as 'senado' | 'camara',
                urgencia: urgencyMap[p.urgencia] || 'sin',
                fecha_ingreso: p.fechaIngreso,
                fecha_ultima_modificacion: p.fechaIngreso, // Will be updated from tramitacion
                etapa_actual: p.subEtapa || p.etapa,
                iniciativa: p.iniciativa.toLowerCase().includes('ejecut') ? 'ejecutivo' : 'parlamentaria',
                synced_at: new Date().toISOString(),
            };
        });

        // 3. LOAD: Store in Supabase
        const supabase = getServerSupabase();

        console.log(`💾 Storing ${bills.length} bills in database...`);

        const { data, error } = await supabase
            .from('bills')
            .upsert(bills, {
                onConflict: 'boletin',
                ignoreDuplicates: false
            })
            .select();

        if (error) {
            console.error('❌ Database error:', error);
            throw error;
        }

        console.log(`✅ Successfully synced ${data?.length || bills.length} bills`);

        return {
            success: true,
            count: data?.length || bills.length
        };

    } catch (error) {
        console.error('❌ ETL Error (Bills):', error);
        throw error;
    }
}

/**
 * Master ETL Job - Run all syncs
 */
export async function runFullSync() {
    console.log('🚀 Starting full ETL sync...');

    const results = {
        parliamentarians: 0,
        bills: 0,
        errors: [] as string[],
    };

    try {
        const parlResult = await syncParlamentarians();
        results.parliamentarians = parlResult.count;
    } catch (error) {
        results.errors.push(`Parliamentarians sync failed: ${error}`);
    }

    try {
        const billsResult = await syncBills();
        results.bills = billsResult.count;
    } catch (error) {
        results.errors.push(`Bills sync failed: ${error}`);
    }

    console.log('✅ ETL sync completed:', results);
    return results;
}
