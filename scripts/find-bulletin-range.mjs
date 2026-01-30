
const SENADO_BASE_URL = 'https://tramitacion.senado.cl/wspublico';

async function getBulletinDate(id) {
    const url = `${SENADO_BASE_URL}/tramitacion.php?boletin=${id}`;
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const text = await res.text();

        // Extract date. Format usually: <fecha_ingreso>dd/mm/yyyy</fecha_ingreso>
        // or check context.
        // Let's look for known date tags.
        const match = text.match(/<fecha_ingreso>(.*?)<\/fecha_ingreso>/i);
        if (match) return match[1];

        return null; // Not found or invalid XML
    } catch (e) {
        return null;
    }
}

async function findRange() {
    console.log('Probing bulletins for 2024 range...');

    // Start scanning from 16000 (Estimate: late 2023 / early 2024)
    // Bulletins are sequential.

    const start = 16000;
    const end = 17500;
    const step = 250;

    console.log(`Scanning ${start} to ${end} with step ${step}...`);

    for (let id = start; id <= end; id += step) {
        const date = await getBulletinDate(id);
        console.log(`Bulletin ${id}: ${date || 'Not Found'}`);
        // Be nice to the API
        await new Promise(r => setTimeout(r, 200));
    }
}

findRange();
