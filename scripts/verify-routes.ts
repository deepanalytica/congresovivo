
const BASE_URL = 'http://localhost:3001';

async function check(path: string) {
    try {
        const res = await fetch(`${BASE_URL}${path}`);
        console.log(`✅ ${path}: Status ${res.status} (Type: ${res.headers.get('content-type')})`);
        if (!res.ok) {
            console.error(`Status text: ${res.statusText}`);
        }
    } catch (e: any) {
        console.error(`❌ ${path}: Failed - ${e.message}`);
    }
}

async function run() {
    console.log(`Checking app at ${BASE_URL}...`);
    await new Promise(r => setTimeout(r, 3000)); // Wait for server to be fully ready

    await check('/');
    await check('/proyectos');
    await check('/comisiones');
    await check('/parlamentarios');
    await check('/api/bills'); // Check API connectivity
}

run();
