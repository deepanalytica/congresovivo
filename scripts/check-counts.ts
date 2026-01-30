
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing to avoid dotenv dependency issues
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = Object.fromEntries(
    envContent.split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
            const [key, ...val] = line.split('=');
            return [key.trim(), val.join('=').trim()];
        })
);

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCounts() {
    console.log("📊 Checking Database Counts...");

    const { count: billsCount, error: bErr } = await supabase.from('bills').select('*', { count: 'exact', head: true });
    if (bErr) console.error("Bills Error:", bErr.message);
    else console.log(`✅ Bills: ${billsCount}`);

    const { count: votesCount, error: vErr } = await supabase.from('votes').select('*', { count: 'exact', head: true });
    if (vErr) console.error("Votes Error:", vErr.message);
    else console.log(`✅ Votes Table Count: ${votesCount}`);

    const { count: legVotesCount, error: lvErr } = await supabase.from('legislative_votes').select('*', { count: 'exact', head: true });
    if (lvErr) console.error("Legislative Votes Error:", lvErr.message);
    else console.log(`✅ Legislative Votes Table Count: ${legVotesCount}`);

    const { count: commCount, error: cErr } = await supabase.from('committees').select('*', { count: 'exact', head: true });
    if (cErr) console.error("Committees Error:", cErr.message);
    else console.log(`✅ Committees: ${commCount}`);
}

checkCounts();
