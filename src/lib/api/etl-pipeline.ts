import { retornarProyectosLeyXAnno, retornarAutoresProyecto, retornarDiputados, retornarSenadoresVigentes, retornarProyectoLeySenate } from './opendata';
import { partyToIdeology } from '@/lib/design-tokens';
import { getServerSupabase } from '@/lib/supabase/client';

/**
 * Normalizes legislative status from OpenData to internal keys
 */
export function normalizeStatus(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('tramitaci')) return 'en_tramite';
    if (s.includes('aprobado') || s.includes('promulgado') || s.includes('publicado')) return 'aprobado';
    if (s.includes('rechazado')) return 'rechazado';
    if (s.includes('archivado')) return 'archivado';
    if (s.includes('retirado')) return 'retirado';
    return 'en_tramite';
}

/**
 * ETL Job: Sync Parliamentarians
 */
export async function syncParlamentarians() {
    console.log('🔄 ETL: Starting parliamentarian sync...');
    try {
        const [senadores, diputados] = await Promise.all([
            retornarSenadoresVigentes(),
            retornarDiputados(),
        ]);

        const allParlamentarians = [
            ...senadores.map(s => ({
                external_id: `SEN-${s.id}`,
                nombre_completo: s.nombre_completo,
                nombre: s.nombre,
                apellido_paterno: s.apellido_paterno,
                apellido_materno: s.apellido_materno,
                partido: s.partido,
                ideologia: partyToIdeology[s.partido] || 'independent',
                camara: 'senado' as const,
                region: s.region,
                email: s.email,
                vigente: true,
                synced_at: new Date().toISOString(),
            })),
            ...diputados.map(d => ({
                external_id: `DIP-${d.id}`,
                nombre_completo: d.nombre_completo,
                nombre: d.nombre,
                apellido_paterno: d.apellido_paterno,
                apellido_materno: d.apellido_materno,
                partido: d.partido,
                ideologia: partyToIdeology[d.partido] || 'independent',
                camara: 'camara' as const,
                region: d.region,
                distrito: d.distrito,
                email: d.email || '',
                vigente: true,
                synced_at: new Date().toISOString(),
            })),
        ];

        // Deduplicate parliamentarians by external_id
        const seenParls = new Set<string>();
        const uniqueParls = allParlamentarians.filter(p => {
            if (seenParls.has(p.external_id)) return false;
            seenParls.add(p.external_id);
            return true;
        });

        const supabase = getServerSupabase();
        const { data, error } = await supabase
            .from('parliamentarians')
            .upsert(uniqueParls, { onConflict: 'external_id' })
            .select();

        if (error) throw error;
        return { success: true, count: data?.length || allParlamentarians.length };
    } catch (error) {
        console.error('❌ ETL Error (Parliamentarians):', error);
        throw error;
    }
}

/**
 * ETL Job: Sync Legislative Bills for a specific year
 */
/**
 * ETL Job: Sync Bills by Range (Senate API Strategy)
 */
export async function syncBillsByRange(start: number, end: number) {
    console.log(`🔄 ETL: Starting Range Sync ${start}-${end}...`);
    const supabase = getServerSupabase();
    let billsCount = 0;

    const batchSize = 10;
    const total = end - start + 1;

    // Create array of bulletins to check
    const bulletins = Array.from({ length: total }, (_, i) => start + i);

    for (let i = 0; i < bulletins.length; i += batchSize) {
        const batch = bulletins.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(bulletins.length / batchSize)}...`);

        // Serial execution within batch to control rate
        for (const num of batch) {
            try {
                const bulletinId = `${num}-00`; // Senate fetcher cleans this anyway
                const p = await retornarProyectoLeySenate(bulletinId);

                if (!p) continue; // Bulletin not found or empty

                const billData = {
                    external_id: p.id,
                    boletin: p.boletin,
                    titulo: p.titulo.substring(0, 255),
                    resumen: p.resumen,
                    // bill_type: p.tipo, // Column missing
                    camara_origen: (p.camaraOrigen && p.camaraOrigen.toLowerCase().includes('diputados')) ? 'camara' : 'senado',
                    iniciativa: p.tipoIniciativa,
                    estado: normalizeStatus(p.estado),
                    // etapa_actual: p.etapa, // Column missing
                    // sub_etapa: p.subEtapa, // Column missing
                    fecha_ingreso: p.fechaIngreso,
                    // fecha_publicacion: p.fechaPublicacion, // Column missing
                    // ley_numero: p.numeroLey, // Column missing
                    urgencia: p.urgencia || 'sin',
                    fecha_ultima_modificacion: new Date().toISOString() // updated_at -> fecha_ultima_modificacion
                };

                // Upsert Bill
                const { data: upsertedBill, error: upsertError } = await supabase
                    .from('bills')
                    .upsert(billData, { onConflict: 'boletin' })
                    .select('id')
                    .single();

                if (upsertError) throw upsertError;

                if (upsertedBill) {
                    billsCount++;
                    // Sync Authors from the bill object itself
                    if (p.autores && p.autores.length > 0) {
                        for (const autor of p.autores) {
                            const { data: parl } = await supabase
                                .from('parliamentarians')
                                .select('id')
                                .ilike('nombre_completo', `%${autor.nombre}%`)
                                .limit(1)
                                .maybeSingle();

                            if (parl) {
                                await supabase
                                    .from('bill_authors')
                                    .upsert({ bill_id: upsertedBill.id, parliamentarian_id: parl.id },
                                        { onConflict: 'bill_id,parliamentarian_id' });
                            }
                        }
                    }
                }
            } catch (err: any) {
                console.error(`💥 Error processing bulletin ${num}:`, err.message);
            }
            // Minor throttle to respect Senate API
            await new Promise(r => setTimeout(r, 100));
        }
    }
    return { success: true, count: billsCount };
}

/**
 * ETL Job: Sync Legislative Bills for a specific year
 */
export async function syncBills(year: number = new Date().getFullYear()) {
    console.log(`🔄 ETL: Starting bills sync for year ${year}...`);

    if (year === 2025) return syncBillsByRange(17200, 18000);
    if (year === 2024) return syncBillsByRange(16400, 17300);
    if (year === 2023) return syncBillsByRange(15500, 16500);
    if (year === 2022) return syncBillsByRange(14500, 15500);
    if (year === 2021) return syncBillsByRange(13500, 14500);
    if (year === 2020) return syncBillsByRange(12500, 13500);
    if (year === 2019) return syncBillsByRange(11500, 12500);
    if (year === 2018) return syncBillsByRange(10500, 11500);

    return { success: false, error: "Legacy sync not supported for this year via direct call" };
}

/**
 * Master ETL Job
 */
export async function runFullSync(year: number = new Date().getFullYear()) {
    const results: any = { year };
    try {
        results.parliamentarians = await syncParlamentarians();
        results.bills = await syncBills(year);
        return { success: true, results };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
