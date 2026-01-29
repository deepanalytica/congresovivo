import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { getSenadores, getDiputados } from '@/lib/api/opendata-client';

const mapPartyToIdeology = (party: string): string => {
    const p = party.toLowerCase();
    if (p.includes('comunista') || p.includes('frente amplio') || p.includes('socialista') || p.includes('revolucion')) return 'Izquierda';
    if (p.includes('democrata cristiano') || p.includes('radical') || p.includes('p d c')) return 'Centro';
    if (p.includes('renovacion') || p.includes('udí') || p.includes('republicano') || p.includes('evopoli')) return 'Derecha';
    return 'Independiente';
};

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();

        console.log('Fetching Senators...');
        const sData = await getSenadores();

        console.log('Fetching Deputies...');
        const dData = await getDiputados();

        const stats = { senators: 0, deputies: 0, errors: [] as string[] };

        for (const s of sData) {
            const partido = s.partido || 'Independiente';
            const { error } = await supabase.from('parliamentarians').upsert({
                external_id: `SEN-${s.id}`,
                nombre_completo: `${s.nombre || ''} ${s.apellidoPaterno || ''} ${s.apellidoMaterno || ''}`.trim(),
                nombre: s.nombre || '',
                apellido_paterno: s.apellidoPaterno || '',
                apellido_materno: s.apellidoMaterno || '',
                partido: partido,
                ideologia: mapPartyToIdeology(partido),
                camara: 'senado',
                region: s.region || 'Metropolitana',
                vigente: true
            }, { onConflict: 'external_id' });
            if (!error) stats.senators++;
            else stats.errors.push(error.message);
        }

        for (const d of dData) {
            const partido = d.partido || 'Independiente';
            const { error } = await supabase.from('parliamentarians').upsert({
                external_id: `DIP-${d.id}`,
                nombre_completo: `${d.nombre || ''} ${d.apellidoPaterno || ''} ${d.apellidoMaterno || ''}`.trim(),
                nombre: d.nombre || '',
                apellido_paterno: d.apellidoPaterno || '',
                apellido_materno: d.apellidoMaterno || '',
                partido: partido,
                ideologia: mapPartyToIdeology(partido),
                camara: 'camara',
                region: d.region || 'Metropolitana',
                vigente: true
            }, { onConflict: 'external_id' });
            if (!error) stats.deputies++;
            else stats.errors.push(error.message);
        }

        return NextResponse.json({ success: true, stats });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
