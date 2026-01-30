

import fs from 'fs';
import path from 'path';

// Load env
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
    }
} catch (e) { }


async function test() {
    console.log('Testing fetchStats()...');
    const { fetchStats } = await import('@/lib/api/legislative-data');

    // Also inspect raw bills
    const { getServerSupabase } = await import('@/lib/supabase/client');
    const supabase = getServerSupabase();
    const { data: bills } = await supabase.from('bills').select('status, chamber_origin').limit(20);
    console.log('Sample Bills:', bills);

    const stats = await fetchStats();
    console.log(JSON.stringify(stats, null, 2));
}

test();
