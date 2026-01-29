import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();

        const seed = {
            boletin: '17203-15',
            titulo: 'Modifica el Código Aeronáutico (TEST DEBUG)',
            fecha_ingreso: '2024-12-09',
            iniciativa: 'Parlamentaria'
        };

        const billData = {
            external_id: seed.boletin,
            boletin: seed.boletin,
            titulo: seed.titulo,
            estado: 'En Tramitación',
            camara_origen: 'camara',
            urgencia: 'Sin urgencia',
            fecha_ingreso: seed.fecha_ingreso,
            iniciativa: seed.iniciativa,
            fecha_ultima_modificacion: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('bills')
            .upsert(billData, { onConflict: 'boletin' })
            .select();

        return NextResponse.json({
            data: data,
            error: error
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
