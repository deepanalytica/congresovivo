/**
 * API Route: Test Sync - Deputies Alternative
 * Test sync with deputies using alternative SOAP endpoint
 */

import { NextResponse } from 'next/server';
import { getDiputadosAlternative } from '@/lib/api/deputies-alternative';
import { getServerSupabase } from '@/lib/supabase/client';
import { partyToIdeology } from '@/lib/design-tokens';

export async function POST() {
    try {
        console.log('🔄 Test sync: Deputies (alternative endpoint)');

        // 1. EXTRACT
        const diputados = await getDiputadosAlternative();
        console.log(`📥 Extracted ${diputados.length} deputies`);

        // 2. TRANSFORM
        const diputadosData = diputados.map(d => ({
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
        }));

        // 3. LOAD
        const supabase = getServerSupabase();

        console.log(`💾 Storing ${diputadosData.length} deputies in database...`);

        const { data, error } = await supabase
            .from('parliamentarians')
            .upsert(diputadosData, {
                onConflict: 'external_id',
                ignoreDuplicates: false
            })
            .select();

        if (error) {
            console.error('❌ Database error:', error);
            throw error;
        }

        console.log(`✅ Successfully synced ${data?.length || diputadosData.length} deputies`);

        return NextResponse.json({
            success: true,
            message: 'Deputies synced successfully',
            data: {
                deputies: data?.length || diputadosData.length
            }
        });

    } catch (error) {
        console.error('❌ Sync error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Sync failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                details: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Use POST to trigger deputies test sync (alternative endpoint)',
        endpoint: '/api/sync/test-deputies'
    });
}
