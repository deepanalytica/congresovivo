/**
 * Server-side data fetching utilities for Chilean Congress Open Data
 * Fetches real data from Supabase database
 */

import { getServerSupabase } from '@/lib/supabase/client';

const supabase = getServerSupabase();

/**
 * Fetch real legislative statistics from Supabase
 */
export async function fetchStats() {
    try {
        // Get total counts
        const [
            { count: totalParlamentarios },
            { count: totalProyectos },
            { count: senadoresCount },
            { count: diputadosCount }
        ] = await Promise.all([
            supabase.from('parliamentarians').select('*', { count: 'exact', head: true }),
            supabase.from('bills').select('*', { count: 'exact', head: true }),
            supabase.from('parliamentarians').select('*', { count: 'exact', head: true }).eq('camara', 'senado'),
            supabase.from('parliamentarians').select('*', { count: 'exact', head: true }).eq('camara', 'camara')
        ]);

        // Get bills stats from the new table
        const { data: bills, error: billsError } = await supabase
            .from('bills')
            .select('estado, camara_origen');

        if (billsError) {
            console.error('Error fetching bills for stats:', billsError);
        }

        const proyectosEnTramite = bills?.filter(b =>
            ['en_tramite', 'primer_tramite', 'segundo_tramite', 'tercer_tramite'].includes(b.estado || '')
        ).length || 0;

        const proyectosAprobados = bills?.filter(b =>
            ['aprobado', 'promulgado'].includes(b.estado || '')
        ).length || 0;

        const proyectosRechazados = bills?.filter(b =>
            ['rechazado', 'archivado'].includes(b.estado || '')
        ).length || 0;

        // Calculate chamber stats
        const camaraProjects = bills?.filter(b => b.camara_origen === 'camara').length || 0;
        const senadoProjects = bills?.filter(b => b.camara_origen === 'senado').length || 0;

        return {
            totalParlamentarios: totalParlamentarios || 0,
            totalProyectos: totalProyectos || 0,
            proyectosActivos: proyectosEnTramite,
            proyectosEnTramite,
            proyectosAprobados,
            proyectosRechazados,
            senadores: senadoresCount || 0,
            diputados: diputadosCount || 0,
            comisionesActivas: 38,
            camaraStats: [
                { camara: 'camara', proyectos: camaraProjects },
                { camara: 'senado', proyectos: senadoProjects }
            ]
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        return {
            totalParlamentarios: 0,
            totalProyectos: 0,
            proyectosActivos: 0,
            proyectosEnTramite: 0,
            proyectosAprobados: 0,
            proyectosRechazados: 0,
            senadores: 0,
            diputados: 0,
            comisionesActivas: 38,
            camaraStats: [
                { camara: 'camara', proyectos: 0 },
                { camara: 'senado', proyectos: 0 }
            ]
        };
    }
}

/**
 * Fetch real legislative bills from Supabase
 */
export async function fetchBills() {
    try {
        const { data: bills, error } = await supabase
            .from('bills')
            .select(`
                *,
                bill_authors (
                    parliamentarian_id
                )
            `)
            .order('entry_date', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching bills:', error);
            return [];
        }

        return (bills || []).map(bill => {
            // Normalize status from raw DB values
            let normalizedStatus = bill.estado;
            const statusLower = (bill.estado || '').toLowerCase();

            if (statusLower.includes('tramit') || statusLower.includes('ingreso')) normalizedStatus = 'en_tramite';
            else if (statusLower.includes('aprob') || statusLower.includes('promulga')) normalizedStatus = 'aprobado';
            else if (statusLower.includes('archiv') || statusLower.includes('retira') || statusLower.includes('rechaza')) normalizedStatus = 'rechazado';

            return {
                id: bill.id,
                bulletin_number: bill.bulletin_number,
                title: bill.title,
                status: normalizedStatus, // Use normalized status
                current_stage: bill.current_stage || 'Ingreso',
                urgency: bill.urgency,
                entry_date: bill.entry_date,
                chamber_origin: bill.camara_origen === 'senado' ? 'Senado' : 'Cámara',
                initiative_type: bill.initiative_type || 'Parlamentaria',
                bill_authors: bill.bill_authors || []
            };
        });
    } catch (error) {
        console.error('Error fetching bills:', error);
        return [];
    }
}

/**
 * Fetch parliamentarians from Supabase
 */
export async function fetchParlamentarios() {
    try {
        const { data: parlamentarios, error } = await supabase
            .from('parliamentarians')
            .select('*')
            .order('nombre_completo', { ascending: true });

        if (error) {
            console.error('Error fetching parliamentarians:', error);
            return [];
        }

        return parlamentarios || [];
    } catch (error) {
        console.error('Error fetching parliamentarians:', error);
        return [];
    }
}

/**
 * Fetch legislative votes from Supabase
 */
export async function fetchVotes(year?: number) {
    try {
        let query = supabase
            .from('legislative_votes')
            .select(`
                *,
                bills (
                    title,
                    boletin
                )
            `);

        if (year) {
            const startDate = `${year}-01-01`;
            const endDate = `${year}-12-31`;
            query = query.gte('vote_date', startDate).lte('vote_date', endDate);
        }

        const { data: votes, error } = await query
            .order('vote_date', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching votes:', error);
            return [];
        }

        return (votes || []).map(v => ({
            id: v.id,
            external_id: v.external_id,
            date: v.vote_date,
            description: v.description,
            result: v.result,
            yes_count: v.yes_count,
            no_count: v.no_count,
            abstention_count: v.abstention_count,
            absent_count: v.absent_count,
            quorum: v.quorum_type,
            bill_title: v.bills?.title,
            boletin: v.bills?.boletin
        }));
    } catch (error) {
        console.error('Error fetching votes:', error);
        return [];
    }
}
