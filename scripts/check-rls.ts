
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

async function run() {
    // Load env
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

    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

    console.log('Testing Anon Client...');
    const supabase = createClient(url!, anonKey!);

    const { data, error } = await supabase.from('bills').select('id').limit(1);
    if (error) {
        console.error('❌ Anon Client Error (RLS Block?):', error);
    } else {
        console.log('✅ Anon Client Success. Found:', data.length);
    }
}
run();
