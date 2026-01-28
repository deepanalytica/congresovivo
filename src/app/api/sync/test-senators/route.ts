/**
 * API Route: Test Sync - Senators Only
 * Test sync with just senators to verify database works
 */

import { NextResponse } from 'next/server';
import { getSenadores } from '@/lib/api/opendata-client';
import { getServerSupabase } from '@/lib/supabase/client';
import { partyToIdeology } from '@/lib/design-tokens';

export async function POST() {
    try {
        console.log('🔄 Test sync: Senators only');

        // 1. EXTRACT
        const senadores = await getSenadores();
        console.log(`📥 Extracted ${senadores.length} senators`);

        // 2. TRANSFORM
        const senadoresData = senadores.map(s => ({
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
        }));

        // 3. LOAD
        const supabase = getServerSupabase();

        console.log(`💾 Storing ${senadoresData.length} senators in database...`);

        const { data, error } = await supabase
            .from('parliamentarians')
            .upsert(senadoresData, {
                onConflict: 'external_id',
                ignoreDuplicates: false
            })
            .select();

        if (error) {
            console.error('❌ Database error:', error);
            throw error;
        }

        console.log(`✅ Successfully synced ${data?.length || senadoresData.length} senators`);

        return NextResponse.json({
            success: true,
            message: 'Senators synced successfully',
            data: {
                senators: data?.length || senadoresData.length
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
        message: 'Use POST to trigger senators test sync',
        endpoint: '/api/sync/test-senators'
    });
}
