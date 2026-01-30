
const SENADO_BASE_URL = 'https://tramitacion.senado.cl/wspublico';

async function checkStructure() {
    const boletin = '16500'; // Jan 2024
    const url = `${SENADO_BASE_URL}/tramitacion.php?boletin=${boletin}`;
    console.log(`Fetching ${url}...`);
    const res = await fetch(url);
    const text = await res.text();
    console.log(text.substring(0, 2000));
}

checkStructure();
