/**
 * Server-side data fetching utilities for Chilean Congress Open Data
 * Fetches real data from Supabase database
 */

import { supabase } from '@/lib/supabase/client';

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

        // Get bills by status and chamber
        const { data: bills } = await supabase
            .from('bills')
            .select('estado, camara_origen');

        const proyectosEnTramite = bills?.filter(b =>
            ['ingreso', 'comision', 'segundo_tramite', 'comision_mixta'].includes(b.estado)
        ).length || 0;

        const proyectosAprobados = bills?.filter(b =>
            ['aprobado', 'promulgado'].includes(b.estado)
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
            senadores: senadoresCount || 0,
            diputados: diputadosCount || 0,
            comisionesActivas: 38, // Static for now
            camaraStats: [
                { camara: 'camara', proyectos: camaraProjects },
                { camara: 'senado', proyectos: senadoProjects }
            ]
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        // Return zeros if error
        return {
            totalParlamentarios: 0,
            totalProyectos: 0,
            proyectosActivos: 0,
            proyectosEnTramite: 0,
            proyectosAprobados: 0,
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
            .select('*')
            .order('fecha_ultima_modificacion', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching bills:', error);
            return [];
        }

        // Transform to match expected format
        return (bills || []).map(bill => ({
            id: bill.external_id,
            boletin: bill.boletin,
            titulo: bill.titulo,
            estado: bill.estado,
            camaraOrigen: bill.camara_origen === 'senado' ? 'Senado' : 'Cámara de Diputados',
            urgencia: bill.urgencia,
            fechaIngreso: new Date(bill.fecha_ingreso),
            fechaUltimaModificacion: new Date(bill.fecha_ultima_modificacion),
            etapaActual: bill.etapa_actual,
            iniciativa: bill.iniciativa === 'ejecutivo' ? 'Ejecutivo' : 'Parlamentaria',
        }));
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
            .eq('vigente', true)
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
