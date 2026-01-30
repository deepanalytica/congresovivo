
import { DOMParser } from 'xmldom';

const BASE = 'https://tramitacion.senado.cl/wspublico';

async function probe(endpoint: string) {
    const url = `${BASE}/${endpoint}`;
    try {
        const res = await fetch(url);
        if (res.ok) {
            const text = await res.text();
            console.log(`✅ FOUND: ${endpoint} (Status: ${res.status})`);
            console.log('   Preview:', text.substring(0, 200).replace(/\n/g, ' '));
        } else {
            console.log(`❌ 404/Error: ${endpoint} (Status: ${res.status})`);
        }
    } catch (e: any) {
        console.log(`❌ ERROR: ${endpoint} - ${e.message}`);
    }
}

async function run() {
    console.log('🔍 Probing Senate API Endpoints...');
    const candidates = [
        'votaciones.php',
        'votacion.php',
        'comisiones.php',
        'integrantes.php',
        'co_misiones.php', // sometimes erratic naming
        'comision.php',
        'sala.php',
        'senadores_vigentes.php' // known working
    ];

    for (const c of candidates) {
        await probe(c);
        await new Promise(r => setTimeout(r, 500));
    }
}

run();
