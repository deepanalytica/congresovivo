
const URLS = [
    'https://tramitacion.senado.cl/wspublico/votaciones.php?boletin=12345', // Try simple number
    'https://tramitacion.senado.cl/wspublico/votaciones.php?fecha=22/01/2024', // Try a date from last year
    'https://tramitacion.senado.cl/wspublico/votaciones.php?boletin=16500-07', // Retry with full
    'https://tramitacion.senado.cl/wspublico/votaciones.php?boletin=16500' // Try cleaned
];

async function run() {
    for (const url of URLS) {
        console.log(`Fetching ${url}...`);
        try {
            const res = await fetch(url);
            const text = await res.text();
            console.log('--- RAW RESPONSE START ---');
            console.log(text.substring(0, 500));
            console.log('--- RAW RESPONSE END ---');
        } catch (e) { console.log('Error', e); }
    }
}

run();
