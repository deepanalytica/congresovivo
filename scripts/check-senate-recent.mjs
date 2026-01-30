
const SENADO_BASE_URL = 'https://tramitacion.senado.cl/wspublico';

async function checkRecent() {
    // 28 days ago from today (assuming today is Jan 29, 2026)
    // 01/01/2026 is safe.
    const url = `${SENADO_BASE_URL}/tramitacion.php?fecha=01/01/2026`;
    console.log(`Fetching ${url}...`);

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(res.statusText);
        const text = await res.text();

        console.log(`Length: ${text.length}`);

        // Extract bulletins
        const matches = text.match(/<boletin>(.*?)<\/boletin>/g);
        if (matches) {
            console.log(`Found ${matches.length} projects.`);
            const first = matches[0].replace(/<\/?boletin>/g, '');
            const last = matches[matches.length - 1].replace(/<\/?boletin>/g, '');
            console.log(`Range: ${last} ... ${first}`); // Order might be desc

            // Also print raw format of one entry
            console.log('Sample Entry:', text.substring(text.indexOf('<proyecto>'), text.indexOf('</proyecto>') + 11));
        } else {
            console.log('No bulletins found in recent list.');
            console.log('Preview:', text.substring(0, 500));
        }

    } catch (e) {
        console.error(e);
    }
}

checkRecent();
