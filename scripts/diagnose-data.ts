
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables correctly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log("🔍 Diagnosing Database Content...");

    // 1. Check Bills
    const { data: bills, error: billsError } = await supabase.from('bills').select('*').limit(1);
    if (billsError) console.error("❌ Error fetching bills:", billsError.message);
    else if (bills?.length === 0) console.log("⚠️ No bills found in database.");
    else {
        console.log("✅ Bills found. Sample keys:", Object.keys(bills![0]).join(', '));
    }

    // 2. Check Committees
    const { data: committees, error: commError } = await supabase.from('committees').select('*').limit(1);
    if (commError) console.error("❌ Error fetching committees:", commError.message);
    else if (committees?.length === 0) console.log("⚠️ No committees found in database.");
    else {
        console.log("✅ Committees found. Sample keys:", Object.keys(committees![0]).join(', '));
    }

    // 3. Check Votes
    const { data: votes, error: votesError } = await supabase.from('legislative_votes').select('*').limit(1);
    if (votesError) console.error("❌ Error fetching votes:", votesError.message);
    else if (votes?.length === 0) console.log("⚠️ No votes found in database.");
    else {
        console.log("✅ Votes found. Sample keys:", Object.keys(votes![0]).join(', '));
    }
}

diagnose();
