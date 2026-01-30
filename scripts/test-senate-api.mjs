
const SENADO_BASE_URL = 'https://tramitacion.senado.cl/wspublico';

async function testSenateAPI() {
    const urls = [
        // Test date limit (older than 1 month)
        `${SENADO_BASE_URL}/tramitacion.php?fecha=01/01/2024`,
        // Test recent date
        `${SENADO_BASE_URL}/tramitacion.php?fecha=01/01/2025`,
        // Test very recent date (today is 2026-01-29) -> 01/01/2026
        `${SENADO_BASE_URL}/tramitacion.php?fecha=01/01/2026`,
        // Test potential year params
        `${SENADO_BASE_URL}/tramitacion.php?anno=2025`,
        `${SENADO_BASE_URL}/tramitacion.php?year=2025`
    ];

    for (const url of urls) {
        try {
            console.log(`Testing: ${url}`);
            const res = await fetch(url);
            console.log(`Status: ${res.status}`);
            if (res.ok) {
                const text = await res.text();
                // Check if it looks like XML and contains projects
                const preview = text.substring(0, 300).replace(/\r\n/g, ' ');
                console.log(`Preview: ${preview}`);
                if (text.includes('<proyecto>')) {
                    const count = (text.match(/<proyecto>/g) || []).length;
                    console.log(`SUCCESS! Found ${count} projects.`);
                } else {
                    console.log('No <proyecto> tags found.');
                }
            }
        } catch (e) {
            console.error(`Error fetching ${url}:`, e.message);
        }
        console.log('---');
    }
}

testSenateAPI();
