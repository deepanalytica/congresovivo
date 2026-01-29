import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { getSenadores, getDiputados } from '@/lib/api/opendata-client';

/**
 * Sync endpoint for REAL Parliamentarian names from OpenData APIs
 * GET /api/sync/real-parliamentarians
 */
export async function GET(request: NextRequest) {
    try {
        console.log('🏛️ Starting real parliamentarian sync...');
        const supabase = getServerSupabase();

        const stats = {
            senatorsSynced: 0,
            deputiesSynced: 0,
            errors: [] as string[]
        };

        // 1. Sync Senators (Senado API usually reliable)
        try {
            console.log('Updating senators list...');
            const senadores = await getSenadores();
            for (const s of senadores) {
                const fullName = `${s.nombre} ${s.apellidoPaterno} ${s.apellidoMaterno}`.trim();
                const externalId = `S-${s.id}`;
                const { error } = await supabase
                    .from('parliamentarians')
                    .upsert({
                        external_id: externalId,
                        nombre: s.nombre,
                        apellido_paterno: s.apellidoPaterno,
                        apellido_materno: s.apellidoMaterno,
                        nombre_completo: fullName,
                        camara: 'senado',
                        partido: s.partido,
                        ideologia: mapPartyToIdeology(s.partido)
                    }, { onConflict: 'external_id' });

                if (error) {
                    console.error(`Error saving senator ${externalId}:`, error);
                } else {
                    stats.senatorsSynced++;
                }
            }
        } catch (err: any) {
            console.error('Senators Sync Error:', err);
            stats.errors.push(`Senators: ${err.message}`);
        }

        // 2. Sync Deputies (Cámara SOAP API)
        try {
            console.log('Updating deputies list...');
            const diputados = await getDiputados();
            for (const d of diputados) {
                const fullName = `${d.nombre} ${d.apellidoPaterno} ${d.apellidoMaterno}`.trim();
                const externalId = `DIP-${d.id}`;

                // If ID is null (XML issue), skip
                if (!d.id) continue;

                const { error } = await supabase
                    .from('parliamentarians')
                    .upsert({
                        external_id: externalId,
                        nombre: d.nombre,
                        apellido_paterno: d.apellidoPaterno,
                        apellido_materno: d.apellidoMaterno,
                        nombre_completo: fullName,
                        camara: 'camara',
                        partido: d.partido,
                        region: d.region,
                        distrito: d.distrito,
                        email: d.email,
                        ideologia: mapPartyToIdeology(d.partido)
                    }, { onConflict: 'external_id' });

                if (error) {
                    console.error(`Error saving deputy ${externalId}:`, error);
                } else {
                    stats.deputiesSynced++;
                }
            }
        } catch (err: any) {
            console.error('Deputies Sync Error:', err);
            stats.errors.push(`Deputies: ${err.message}`);
        }

        return NextResponse.json({
            success: true,
            summary: stats
        });

    } catch (error: any) {
        console.error('❌ Real parliamentarian sync error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function mapPartyToIdeology(party: string): string {
    const p = (party || 'independiente').toLowerCase();
    if (p.includes('comunista') || p.includes('frente amplio') || p.includes('revolución democrática') || p.includes('convergencia')) return 'izquierda';
    if (p.includes('socialista') || p.includes('ppd') || p.includes('radical') || p.includes('liberal')) return 'centro-izquierda';
    if (p.includes('demócrata cristiano') || p.includes('dc') || p.includes('amarillos') || p.includes('demócratas')) return 'centro';
    if (p.includes('rn') || p.includes('renovación nacional') || p.includes('evópoli')) return 'centro-derecha';
    if (p.includes('udi') || p.includes('republicano')) return 'derecha';
    return 'independiente';
}
