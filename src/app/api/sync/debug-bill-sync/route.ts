import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { retornarProyectoLeySenate } from '@/lib/api/opendata/bills'; // Direct import to be safe

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();

        console.log("Fetching projects via Senate API Fallback...");

        // Define a range of recent bulletins to test
        // 16500 is roughly Jan 2024. Let's try 5 bulletins.
        const startBulletin = 16500;
        const count = 5;
        const bills = [];

        for (let i = 0; i < count; i++) {
            const bulletinNumber = `${startBulletin + i}-00`;
            const project = await retornarProyectoLeySenate(bulletinNumber);
            if (project) {
                bills.push(project);
            }
        }

        console.log(`Fetched ${bills.length} bills from Senate API`);
        if (bills.length > 0) {
            console.log("Sample project:", JSON.stringify(bills[0], null, 2));
        }

        const formattedBills = bills.map(p => ({
            external_id: p.id,
            boletin: p.boletin,
            titulo: p.titulo.substring(0, 255),
            estado: p.estado,
            camara_origen: (p.camaraOrigen && p.camaraOrigen.toLowerCase().includes('diputados')) ? 'camara' : 'senado',
            urgencia: p.urgencia || 'sin',
            fecha_ingreso: p.fechaIngreso,
            iniciativa: p.tipoIniciativa || 'parlamentaria',
            fecha_ultima_modificacion: new Date().toISOString()
        }));

        if (formattedBills.length > 0) {
            console.log(`Upserting ${formattedBills.length} bills...`);
            const { data, error } = await supabase.from('bills').upsert(formattedBills, { onConflict: 'boletin' }).select();

            if (error) {
                return NextResponse.json({ error: error.message, details: error }, { status: 400 });
            }
            return NextResponse.json({ success: true, count: data.length, sample: data[0] });
        }

        return NextResponse.json({ success: true, count: 0, message: "No bills found in tested range" });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
