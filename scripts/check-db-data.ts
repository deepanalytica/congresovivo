
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// --- Load .env.local manually ---
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
// --------------------------------

async function check() {
    console.log('🔍 Checking Database Content...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Missing credentials');
        return;
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);

    // Check Bills with Admin Client
    const { count: billsCount, error: billsError } = await adminClient
        .from('bills')
        .select('*', { count: 'exact', head: true });

    if (billsError) console.error('❌ Admin Bills Error:', billsError.message);
    else console.log(`✅ Bills in DB (Admin): ${billsCount}`);

    // Check Bills with Anon Client (Public)
    const { count: billsCountAnon, error: billsErrorAnon } = await anonClient
        .from('bills')
        .select('*', { count: 'exact', head: true });

    if (billsErrorAnon) console.error('❌ Anon Bills Error:', billsErrorAnon.message);
    else console.log(`⚠️ Bills visible to Public (Anon): ${billsCountAnon}`);

    if (billsCount > 0 && billsCountAnon === 0) {
        console.error('🚨 RLS ISSUE DETECTED: Data exists but is hidden from public!');
    } else {
        console.log('✅ RLS seems okay (or table is empty)');
    }
}

check();
