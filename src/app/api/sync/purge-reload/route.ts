import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { getSenadores, getDiputados } from '@/lib/api/opendata-client';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();

        console.log('--- PURGE ATTEMPT ---');
        // Delete by matching ANY external_id starts with S or D
        await supabase.from('parliamentarians').delete().ilike('external_id', 'S%');
        await supabase.from('parliamentarians').delete().ilike('external_id', 'D%');
        await supabase.from('parliamentarians').delete().ilike('external_id', 'SEN%');
        await supabase.from('parliamentarians').delete().ilike('external_id', 'DIP%');

        const sData = await getSenadores();
        const dData = await getDiputados();

        const parls = [];
        for (const s of sData) {
            parls.push({
                external_id: `SEN-${s.id}`,
                nombre_completo: `${s.nombre} ${s.apellidoPaterno} ${s.apellidoMaterno}`.trim(),
                nombre: s.nombre,
                apellido_paterno: s.apellidoPaterno,
                apellido_materno: s.apellidoMaterno,
                partido: s.partido,
                ideologia: 'Centro', // Placeholder for now
                camara: 'senado',
                region: s.region || 'Metropolitana',
                vigente: true
            });
        }
        for (const d of dData) {
            parls.push({
                external_id: `DIP-${d.id}`,
                nombre_completo: `${d.nombre} ${d.apellidoPaterno} ${d.apellidoMaterno}`.trim(),
                nombre: d.nombre,
                apellido_paterno: d.apellidoPaterno,
                apellido_materno: d.apellidoMaterno,
                partido: d.partido || 'Independiente',
                ideologia: 'Centro',
                camara: 'camara',
                region: d.region || 'Metropolitana',
                vigente: true
            });
        }

        const { data, error } = await supabase.from('parliamentarians').insert(parls).select();
        if (error) throw error;

        return NextResponse.json({ success: true, count: data.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
