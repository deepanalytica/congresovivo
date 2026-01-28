import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * Sync endpoint for committee data
 * Generates realistic committees and links existing parliamentarians
 * POST /api/sync/committees
 */
export async function POST(request: NextRequest) {
    try {
        console.log('🏛️ Starting committee data sync...');

        // 1. Fetch all parliamentarians to link to committees
        const { data: parliamentarians, error: parlError } = await supabase
            .from('parliamentarians')
            .select('id, camara, nombre_completo');

        if (parlError) throw parlError;
        if (!parliamentarians || parliamentarians.length === 0) {
            return NextResponse.json({ message: 'No parliamentarians found to join committees.' });
        }

        const stats = {
            committeesCreated: 0,
            membershipsCreated: 0,
            errors: [] as string[]
        };

        // Define realistic committee names
        const committeeNames = [
            'Hacienda',
            'Relaciones Exteriores',
            'Constitución, Legislación, Justicia y Reglamento',
            'Educación',
            'Salud',
            'Defensa Nacional',
            'Obras Públicas',
            'Agricultura',
            'Medio Ambiente',
            'Minería y Energía',
            'Economía',
            'Trabajo y Previsión Social',
            'Vivienda y Urbanismo',
            'Transportes y Telecomunicaciones',
            'Seguridad Ciudadana',
            'Cultura, Artes y Comunicaciones',
            'Derechos Humanos y Pueblos Originarios',
            'Mujeres y Equidad de Género',
            'Deportes y Recreación'
        ];

        // Create committees for each chamber
        const chambers: ('camara' | 'senado')[] = ['camara', 'senado'];

        for (const camara of chambers) {
            const chamberParls = parliamentarians.filter(p => p.camara === camara);

            for (const name of committeeNames) {
                try {
                    const externalId = `COM-${camara === 'senado' ? 'S' : 'C'}-${name.substring(0, 3).toUpperCase()}`;

                    const committeeData = {
                        external_id: externalId,
                        nombre: `Comisión de ${name}`,
                        nombre_corto: name,
                        tipo: 'permanente',
                        camara: camara,
                        descripcion: `Comisión permanente de ${name} de la ${camara === 'senado' ? 'Corporación del Senado' : 'Cámara de Diputados'}.`
                    };

                    const { data: committee, error: commError } = await supabase
                        .from('committees')
                        .upsert(committeeData, { onConflict: 'external_id' })
                        .select()
                        .single();

                    if (commError) throw commError;
                    stats.committeesCreated++;

                    // Assign random members from the same chamber
                    // Typically 7-13 members per committee
                    const memberCount = Math.floor(Math.random() * 7) + 7;
                    const shuffledParls = [...chamberParls].sort(() => 0.5 - Math.random());
                    const selectedMembers = shuffledParls.slice(0, Math.min(memberCount, chamberParls.length));

                    for (let i = 0; i < selectedMembers.length; i++) {
                        const member = selectedMembers[i];
                        const membershipData = {
                            committee_id: committee.id,
                            parliamentarian_id: member.id,
                            rol: i === 0 ? 'presidente' : 'integrante'
                        };

                        const { error: memError } = await supabase
                            .from('committee_members')
                            .upsert(membershipData, { onConflict: 'committee_id,parliamentarian_id' });

                        if (!memError) stats.membershipsCreated++;
                    }

                } catch (err: any) {
                    stats.errors.push(`Error on ${name} (${camara}): ${err.message}`);
                }
            }
        }

        return NextResponse.json({
            success: true,
            summary: stats
        });

    } catch (error: any) {
        console.error('❌ Committee sync error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
