
const URL = 'http://localhost:3001/api/bills';

async function run() {
    console.log(`Fetching ${URL}...`);
    try {
        const res = await fetch(URL);
        const ct = res.headers.get('content-type');
        console.log(`Status: ${res.status}`);

        const text = await res.text();
        console.log('--- BODY START ---');
        console.log(text);
        console.log('--- BODY END ---');

    } catch (e: any) {
        console.error('Fetch Failed:', e.message);
    }
}
run();
