/**
 * API Route: Add Sample Bills
 * Add sample bills/projects data based on known real bills
 */

import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

export async function POST() {
    try {
        console.log('🔄 Adding sample bills data...');

        // Sample bills based on real legislative projects
        const sampleBills = [
            {
                external_id: 'B-001',
                boletin: '16077-07',
                titulo: 'Proyecto de ley que establece el derecho a la desconexión digital',
                estado: 'aprobado',
                camara_origen: 'camara' as const,
                urgencia: 'sin',
                fecha_ingreso: '2023-03-15',
                fecha_ultima_modificacion: '2024-01-20',
                etapa_actual: 'Promulgado',
                iniciativa: 'parlamentaria',
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'B-002',
                boletin: '15883-11',
                titulo: 'Proyecto de ley sobre protección de datos personales',
                estado: 'comision',
                camara_origen: 'senado' as const,
                urgencia: 'suma',
                fecha_ingreso: '2023-01-10',
                fecha_ultima_modificacion: '2024-01-25',
                etapa_actual: 'Primer trámite constitucional',
                iniciativa: 'ejecutivo',
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'B-003',
                boletin: '16234-25',
                titulo: 'Proyecto de ley que modifica el Código del Trabajo en materia de teletrabajo',
                estado: 'segundo_tramite',
                camara_origen: 'camara' as const,
                urgencia: 'simple',
                fecha_ingreso: '2023-05-20',
                fecha_ultima_modificacion: '2024-01-22',
                etapa_actual: 'Segundo trámite constitucional',
                iniciativa: 'parlamentaria',
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'B-004',
                boletin: '15991-04',
                titulo: 'Proyecto de ley que establece medidas para la protección del medio ambiente',
                estado: 'comision',
                camara_origen: 'senado' as const,
                urgencia: 'suma',
                fecha_ingreso: '2023-02-28',
                fecha_ultima_modificacion: '2024-01-18',
                etapa_actual: 'Comisión de Medio Ambiente',
                iniciativa: 'ejecutivo',
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'B-005',
                boletin: '16445-07',
                titulo: 'Proyecto de ley sobre igualdad salarial entre hombres y mujeres',
                estado: 'ingreso',
                camara_origen: 'camara' as const,
                urgencia: 'sin',
                fecha_ingreso: '2023-08-15',
                fecha_ultima_modificacion: '2023-12-10',
                etapa_actual: 'Ingreso',
                iniciativa: 'parlamentaria',
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'B-006',
                boletin: '16102-06',
                titulo: 'Proyecto de ley que reforma el sistema de pensiones',
                estado: 'comision_mixta',
                camara_origen: 'senado' as const,
                urgencia: 'inmediata',
                fecha_ingreso: '2023-04-05',
                fecha_ultima_modificacion: '2024-01-28',
                etapa_actual: 'Comisión Mixta',
                iniciativa: 'ejecutivo',
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'B-007',
                boletin: '16321-11',
                titulo: 'Proyecto de ley que regula el uso de inteligencia artificial',
                estado: 'comision',
                camara_origen: 'camara' as const,
                urgencia: 'suma',
                fecha_ingreso: '2023-06-12',
                fecha_ultima_modificacion: '2024-01-15',
                etapa_actual: 'Comisión de Ciencia y Tecnología',
                iniciativa: 'parlamentaria',
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'B-008',
                boletin: '15756-07',
                titulo: 'Proyecto de ley sobre salud mental en el trabajo',
                estado: 'segundo_tramite',
                camara_origen: 'senado' as const,
                urgencia: 'simple',
                fecha_ingreso: '2022-11-20',
                fecha_ultima_modificacion: '2024-01-12',
                etapa_actual: 'Segundo trámite constitucional',
                iniciativa: 'parlamentaria',
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'B-009',
                boletin: '16598-04',
                titulo: 'Proyecto de ley que establece incentivos para energías renovables',
                estado: 'ingreso',
                camara_origen: 'camara' as const,
                urgencia: 'sin',
                fecha_ingreso: '2023-10-08',
                fecha_ultima_modificacion: '2023-12-28',
                etapa_actual: 'Ingreso',
                iniciativa: 'ejecutivo',
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'B-010',
                boletin: '16012-25',
                titulo: 'Proyecto de ley sobre modernización del Estado',
                estado: 'comision',
                camara_origen: 'senado' as const,
                urgencia: 'suma',
                fecha_ingreso: '2023-03-22',
                fecha_ultima_modificacion: '2024-01-20',
                etapa_actual: 'Comisión de Gobierno',
                iniciativa: 'ejecutivo',
                synced_at: new Date().toISOString(),
            },
        ];

        const supabase = getServerSupabase();

        console.log(`💾 Storing ${sampleBills.length} sample bills in database...`);

        const { data, error } = await supabase
            .from('bills')
            .upsert(sampleBills, {
                onConflict: 'boletin',
                ignoreDuplicates: false
            })
            .select();

        if (error) {
            console.error('❌ Database error:', error);
            throw error;
        }

        console.log(`✅ Successfully added ${data?.length || sampleBills.length} sample bills`);

        return NextResponse.json({
            success: true,
            message: 'Sample bills added successfully',
            data: {
                bills: data?.length || sampleBills.length
            }
        });

    } catch (error) {
        console.error('❌ Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to add sample bills',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Use POST to add sample bills data',
        endpoint: '/api/sync/add-sample-bills'
    });
}
