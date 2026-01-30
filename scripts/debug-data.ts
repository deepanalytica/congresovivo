
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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
    }
} catch (e) { }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase Credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('🔍 Checking Data Status...');

    // 1. Parliamentarians
    const { count: parls, error: err1 } = await supabase.from('parliamentarians').select('*', { count: 'exact', head: true });
    console.log(`👤 Parliamentarians: ${parls} ${err1 ? `(Error: ${err1.message})` : ''}`);

    // 2. Committees
    const { count: comms, error: err2 } = await supabase.from('committees').select('*', { count: 'exact', head: true });
    console.log(`🏛️  Committees:      ${comms} ${err2 ? `(Error: ${err2.message})` : ''}`);

    const { count: members, error: errMembers } = await supabase.from('committee_members').select('*', { count: 'exact', head: true });
    console.log(`👥 Committee Members: ${members} ${errMembers ? `(Error: ${errMembers.message})` : ''}`);

    const { data: commSample } = await supabase.from('committees').select('*').limit(1);
    console.log('Sample Committee Keys:', Object.keys(commSample?.[0] || {}));


    // 3. Bills Statuses
    const { data: bills, error: err3 } = await supabase.from('bills').select('estado').limit(50);
    if (err3) {
        console.log(`❌ Error fetching bills: ${err3.message}`);
    } else {
        const statuses = [...new Set(bills?.map(b => b.estado))];
        console.log(`📜 Bill Statuses (Sample):`, statuses);
    }
}

run();
