
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

async function run() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf-8');
            envConfig.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
            });
        }
    } catch (e) { }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { count, error } = await supabase.from('bills').select('*', { count: 'exact', head: true });
    console.log(`📜 Total Bills in DB: ${count}`);
    if (error) console.error(error);
}
run();
