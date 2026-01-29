import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRegionFromDistrito } from '@/lib/constants/distrito-region-map';

export const dynamic = 'force-dynamic';

/**
 * Deputy name to distrito mapping extracted from https://www.camara.cl/diputados/diputados.aspx
 * Data as of 2022-2026 legislative period
 */
const DEPUTY_TO_DISTRITO: Record<string, number> = {
    // Distrito 1 - Arica y Parinacota
    "Vlado Mirosevic": 1,
    "Enrique Lee": 1,
    "Luis Malla": 1,

    // Distrito 2 - Tarapacá  
    "Renzo Trisotti": 2,
    "Matías Ramírez": 2,
    "Danisa Astudillo": 2,

    // Distrito 3 - Antofagasta
    "Catalina Pérez": 3,
    "Yovana Ahumada": 3,
    "Sebastián Videla": 3,
    "Jaime Araya": 3,
    "José Miguel Castro": 3,

    // Distrito 4 - Atacama
    "Daniella Cicardini": 4,
    "Juan Santana": 4,
    "Jaime Mulet": 4,
    "Cristian Tapia": 4,
    "Sofía Cid": 4,

    // Distrito 5 - Coquimbo
    "Nathalie Castillo": 5,

    // Distrito 6 - Valparaíso Norte
    "Chiara Barchiesi": 6,
    "María Francisca Bello": 6,

    // Distrito 7 - Valparaíso Costa
    "Arturo Barrios": 7,
    "Jorge Brito": 7,
    "Andrés Celis": 7,

    // Distrito 9 - RM Norte
    "Boris Barrera": 9,
    "Karol Cariola": 9,

    // Distrito 10 - RM Oriente-Centro
    "Jorge Alessandri": 10,

    // Distrito 11 - RM Oriente
    "Cristián Araya": 11,

    // Distrito 12 - RM Sur-Oriente
    "Mónica Arce": 12,
    "Álvaro Carter": 12,

    // Distrito 16 - O'Higgins Sur
    "Félix Bugueño": 16,

    // Distrito 17 - Maule Norte
    "Roberto Celedón": 17,

    // Distrito 18 - Maule Sur
    "Gustavo Benavente": 18,

    // Distrito 19 - Ñuble
    "Marta Bravo": 19,
    "Felipe Camaño": 19,

    // Distrito 20 - Biobío Concepción
    "María Candelaria Acevedo": 20,
    "Eric Aedo": 20,
    "Roberto Arroyo": 20,
    "Sergio Bobadilla": 20,

    // Distrito 22 - Araucanía Norte
    "Juan Carlos Beltrán": 22,

    // Distrito 23 - Araucanía Sur
    "Miguel Ángel Becker": 23,

    // Distrito 24 - Los Ríos
    "Bernardo Berger": 24,
    "Ana María Bravo": 24,

    // Distrito 25 - Los Lagos Norte
    "Héctor Barría": 25,

    // Distrito 26 - Los Lagos Sur
    "Alejandro Bernales": 26,
    "Fernando Bórquez": 26,

    // Distrito 27 - Aysén
    "René Alinco": 27,
    "Miguel Ángel Calisto": 27,

    // Distrito 28 - Magallanes
    "Carlos Bianchi": 28
};

export async function POST() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get all deputies
        const { data: deputies, error: fetchError } = await supabase
            .from('parliamentarians')
            .select('id, nombre_completo, distrito, region')
            .eq('camara', 'camara');

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        let matchedCount = 0;
        let updatedCount = 0;
        const updates: any[] = [];

        for (const deputy of deputies || []) {
            // Try to match by normalized name
            let matchedDistrito: number | null = null;

            for (const [name, distrito] of Object.entries(DEPUTY_TO_DISTRITO)) {
                if (deputy.nombre_completo.includes(name) || name.includes(deputy.nombre_completo.split(' ').slice(-2).join(' '))) {
                    matchedDistrito = distrito;
                    matchedCount++;
                    break;
                }
            }

            if (matchedDistrito) {
                const correctRegion = getRegionFromDistrito(matchedDistrito);

                const { error: updateError } = await supabase
                    .from('parliamentarians')
                    .update({
                        region: correctRegion,
                        distrito: matchedDistrito.toString()
                    })
                    .eq('id', deputy.id);

                if (!updateError) {
                    updatedCount++;
                    updates.push({
                        name: deputy.nombre_completo,
                        distrito: matchedDistrito,
                        region: correctRegion
                    });
                }
            }
        }

        return NextResponse.json({
            total_deputies: deputies?.length || 0,
            matched_count: matchedCount,
            updated_count: updatedCount,
            sample_updates: updates.slice(0, 20)
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
