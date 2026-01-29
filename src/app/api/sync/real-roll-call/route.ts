import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { getVotaciones_Boletin, getVotacionDetalle } from '@/lib/api/opendata-client';
import fs from 'fs';

export async function GET(request: NextRequest) {
    const logFile = 'c:\\Users\\Ale\\Desktop\\Dashboard Congreso Nacional\\sync-debug.log';
    const log = (msg: string) => { console.log(msg); fs.appendFileSync(logFile, msg + '\n'); };

    try {
        fs.writeFileSync(logFile, '--- Start Sync Log ---\n');
        const supabase = getServerSupabase();

        // Load EVERYTHING
        const { data: parls, error: pErr } = await supabase.from('parliamentarians').select('id, external_id');
        if (pErr) throw pErr;

        log(`Parliamentarians in DB: ${parls.length}`);

        const parlMap = new Map();
        parls.forEach(p => {
            if (p.external_id) {
                const clean = p.external_id.trim().toUpperCase();
                parlMap.set(clean, p.id);
            }
        });

        const allKeys = Array.from(parlMap.keys());
        log(`Unique keys in map: ${allKeys.length}`);

        // Find 1096 specifically
        const matches1096 = allKeys.filter(k => k.includes('1096'));
        log(`Keys containing "1096": ${matches1096.join(', ')}`);

        // Perform re-sync
        const { data: bills } = await supabase.from('bills').select('id, boletin, titulo').not('boletin', 'is', null).limit(10);
        let votesSynced = 0;

        for (const bill of bills!) {
            const sessions = await getVotaciones_Boletin(bill.boletin);
            for (const sess of sessions) {
                const { data: voteRec } = await supabase.from('votes').upsert({
                    external_id: `VOT-DIP-${sess.id}`,
                    bill_id: bill.id,
                    fecha: sess.fecha,
                    camara: 'camara',
                    tipo: 'sala',
                    materia: bill.titulo,
                    boletin: sess.boletin,
                    a_favor: parseInt(sess.aFavor) || 0,
                    contra: parseInt(sess.enContra) || 0,
                    abstenciones: parseInt(sess.abstencion) || 0,
                    ausentes: parseInt(sess.ausente) || 0,
                    resultado: parseInt(sess.aFavor) >= parseInt(sess.enContra) ? 'aprobado' : 'rechazado'
                }, { onConflict: 'external_id' }).select().single();

                if (voteRec) {
                    const roll = await getVotacionDetalle(sess.id);
                    for (const ind of roll) {
                        const lookup = `DIP-${ind.parliamentarianId}`;
                        const localId = parlMap.get(lookup) || parlMap.get(ind.parliamentarianId);
                        if (localId) {
                            await supabase.from('vote_roll_call').upsert({
                                vote_id: voteRec.id,
                                parliamentarian_id: localId,
                                voto: ind.opcion.toLowerCase().includes('favor') ? 'a_favor' :
                                    ind.opcion.toLowerCase().includes('contra') ? 'contra' :
                                        ind.opcion.toLowerCase().includes('abstencion') ? 'abstencion' : 'ausente'
                            }, { onConflict: 'vote_id,parliamentarian_id' });
                            votesSynced++;
                        }
                    }
                }
            }
        }

        return NextResponse.json({ success: true, votesSynced });
    } catch (e: any) {
        log(`ERROR: ${e.message}`);
        return NextResponse.json({ error: e.message });
    }
}
