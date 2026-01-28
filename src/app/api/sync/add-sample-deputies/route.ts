/**
 * API Route: Add Sample Deputies
 * Add sample deputies data based on known real deputies
 */

import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

export async function POST() {
    try {
        console.log('🔄 Adding sample deputies data...');

        // Sample deputies based on real data (2022-2026 period)
        const sampleDeputies = [
            {
                external_id: 'D-1001',
                nombre_completo: 'Karol Cariola Oliva',
                nombre: 'Karol',
                apellido_paterno: 'Cariola',
                apellido_materno: 'Oliva',
                partido: 'P.C',
                ideologia: 'left',
                camara: 'camara' as const,
                region: 'Región Metropolitana de Santiago',
                distrito: '10',
                email: 'kcariola@camara.cl',
                vigente: true,
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'D-1002',
                nombre_completo: 'Giorgio Jackson Drago',
                nombre: 'Giorgio',
                apellido_paterno: 'Jackson',
                apellido_materno: 'Drago',
                partido: 'Revolución Democrática',
                ideologia: 'left',
                camara: 'camara' as const,
                region: 'Región Metropolitana de Santiago',
                distrito: '11',
                email: 'gjackson@camara.cl',
                vigente: true,
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'D-1003',
                nombre_completo: 'Gonzalo Winter Etcheberry',
                nombre: 'Gonzalo',
                apellido_paterno: 'Winter',
                apellido_materno: 'Etcheberry',
                partido: 'Convergencia Social',
                ideologia: 'left',
                camara: 'camara' as const,
                region: 'Región Metropolitana de Santiago',
                distrito: '12',
                email: 'gwinter@camara.cl',
                vigente: true,
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'D-1004',
                nombre_completo: 'Maite Orsini Pascal',
                nombre: 'Maite',
                apellido_paterno: 'Orsini',
                apellido_materno: 'Pascal',
                partido: 'Revolución Democrática',
                ideologia: 'left',
                camara: 'camara' as const,
                region: 'Región Metropolitana de Santiago',
                distrito: '13',
                email: 'morsini@camara.cl',
                vigente: true,
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'D-1005',
                nombre_completo: 'Diego Schalper Sepúlveda',
                nombre: 'Diego',
                apellido_paterno: 'Schalper',
                apellido_materno: 'Sepúlveda',
                partido: 'R.N.',
                ideologia: 'right',
                camara: 'camara' as const,
                region: 'Región Metropolitana de Santiago',
                distrito: '21',
                email: 'dschalper@camara.cl',
                vigente: true,
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'D-1006',
                nombre_completo: 'Catalina Pérez Salinas',
                nombre: 'Catalina',
                apellido_paterno: 'Pérez',
                apellido_materno: 'Salinas',
                partido: 'Revolución Democrática',
                ideologia: 'left',
                camara: 'camara' as const,
                region: 'Región de Antofagasta',
                distrito: '3',
                email: 'cperez@camara.cl',
                vigente: true,
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'D-1007',
                nombre_completo: 'Vlado Mirosevic Verdugo',
                nombre: 'Vlado',
                apellido_paterno: 'Mirosevic',
                apellido_materno: 'Verdugo',
                partido: 'P.L.',
                ideologia: 'center',
                camara: 'camara' as const,
                region: 'Región de Tarapacá',
                distrito: '2',
                email: 'vmirosevic@camara.cl',
                vigente: true,
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'D-1008',
                nombre_completo: 'Pamela Jiles Moreno',
                nombre: 'Pamela',
                apellido_paterno: 'Jiles',
                apellido_materno: 'Moreno',
                partido: 'Partido Humanista',
                ideologia: 'left',
                camara: 'camara' as const,
                region: 'Región Metropolitana de Santiago',
                distrito: '12',
                email: 'pjiles@camara.cl',
                vigente: true,
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'D-1009',
                nombre_completo: 'Jaime Naranjo Ortiz',
                nombre: 'Jaime',
                apellido_paterno: 'Naranjo',
                apellido_materno: 'Ortiz',
                partido: 'P.S.',
                ideologia: 'left',
                camara: 'camara' as const,
                region: 'Región del Maule',
                distrito: '17',
                email: 'jnaranjo@camara.cl',
                vigente: true,
                synced_at: new Date().toISOString(),
            },
            {
                external_id: 'D-1010',
                nombre_completo: 'Marcela Sabat Fernández',
                nombre: 'Marcela',
                apellido_paterno: 'Sabat',
                apellido_materno: 'Fernández',
                partido: 'R.N.',
                ideologia: 'right',
                camara: 'camara' as const,
                region: 'Región Metropolitana de Santiago',
                distrito: '11',
                email: 'msabat@camara.cl',
                vigente: true,
                synced_at: new Date().toISOString(),
            },
        ];

        const supabase = getServerSupabase();

        console.log(`💾 Storing ${sampleDeputies.length} sample deputies in database...`);

        const { data, error } = await supabase
            .from('parliamentarians')
            .upsert(sampleDeputies, {
                onConflict: 'external_id',
                ignoreDuplicates: false
            })
            .select();

        if (error) {
            console.error('❌ Database error:', error);
            throw error;
        }

        console.log(`✅ Successfully added ${data?.length || sampleDeputies.length} sample deputies`);

        return NextResponse.json({
            success: true,
            message: 'Sample deputies added successfully',
            data: {
                deputies: data?.length || sampleDeputies.length
            }
        });

    } catch (error) {
        console.error('❌ Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to add sample deputies',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Use POST to add sample deputies data',
        endpoint: '/api/sync/add-sample-deputies'
    });
}
