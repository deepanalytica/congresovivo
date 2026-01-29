import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { getProyectosLey } from '@/lib/api/opendata-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();

        console.log("Fetching raw projects...");
        const proyectos = await getProyectosLey();
        const sample = proyectos.slice(0, 2);

        console.log("Sample project:", JSON.stringify(sample[0], null, 2));

        const bills = sample.map(p => ({
            external_id: p.id,
            boletin: p.boletin,
            titulo: p.titulo.substring(0, 255), // Truncate title if needed?
            estado: 'ingreso',
            camara_origen: (p.camara.toLowerCase().includes('senado') ? 'senado' : 'camara'),
            urgencia: 'sin',
            fecha_ingreso: p.fechaIngreso, // Check format YYYY-MM-DD
            iniciativa: 'parlamentaria', // Simplify for test
            fecha_ultima_modificacion: new Date().toISOString()
        }));

        console.log("Upserting 2 bills...");
        const { data, error } = await supabase.from('bills').upsert(bills, { onConflict: 'boletin' }).select();

        if (error) {
            return NextResponse.json({ error: error.message, details: error }, { status: 400 });
        }

        return NextResponse.json({ success: true, count: data.length, sample: data[0] });
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
