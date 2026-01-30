
import fs from 'fs';
import path from 'path';

async function run() {
    console.log('🚀 Starting Massive Data Injection Script...');

    // 1. Load Environment Variables
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf-8');
            envConfig.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^['"]|['"]$/g, '');
                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                }
            });
            console.log('✅ Loaded .env.local');
        } else {
            console.warn('⚠️ .env.local not found at', envPath);
        }
    } catch (e) {
        console.error('⚠️ Error loading .env.local:', e);
    }

    // 2. Dynamic Import of Application Code
    // This MUST happen after env vars are set
    console.log('🔄 Importing ETL Pipeline...');
    const { runFullSync, syncBills } = await import('@/lib/api/etl-pipeline');

    const year = 2025; // Target current legislative year
    console.log(`📅 Target Year: ${year}`);

    // 3. Run Sync
    try {
        console.log('--- Syncing 2025 (and implicit 2024 range) ---');
        const result2025 = await runFullSync(2025);
        console.log('2025 Result:', JSON.stringify(result2025, null, 2));

        console.log('--- Syncing 2024 explicitly ---');
        const result2024 = await syncBills(2024);
        console.log('2024 Result:', JSON.stringify(result2024, null, 2));

        console.log('✅ Injection Process Complete');
    } catch (err: any) {
        console.error('❌ Data Injection Failed:', err.message);
        console.error(err.stack);
    }
}

run();
