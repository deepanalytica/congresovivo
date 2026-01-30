
import fs from 'fs';
import path from 'path';

async function run() {
    console.log('🚀 Starting Historical Data Injection (2018-2023)...');

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
        }
    } catch (e) {
        console.error('⚠️ Error loading .env.local:', e);
    }

    // 2. Dynamic Import of Application Code
    console.log('🔄 Importing ETL Pipeline...');
    const { syncBills } = await import('@/lib/api/etl-pipeline');

    // 3. Run Sync for Range
    const years = [2023, 2022, 2021, 2020, 2019, 2018];

    for (const year of years) {
        try {
            console.log(`\n📅 Syncing Year: ${year}...`);
            const result = await syncBills(year);
            console.log(`✅ ${year} Result:`, JSON.stringify(result, null, 2));

            // Small pause to be nice to the API
            await new Promise(r => setTimeout(r, 2000));
        } catch (err: any) {
            console.error(`❌ Failed to sync ${year}:`, err.message);
        }
    }

    console.log('\n🏁 Historical Injection Complete');
}

run();
