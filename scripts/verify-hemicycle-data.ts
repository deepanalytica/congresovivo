
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing
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

async function verifyHemicycleData() {
    console.log("🔍 Verifying Hemicycle Data Fetching...");

    // 1. Get a vote ID
    const { data: vote } = await supabase.from('votes').select('id').limit(1).single();
    if (!vote) {
        console.error("❌ No votes found for testing.");
        return;
    }

    console.log(`Checking details for Vote ID: ${vote.id}`);

    // 2. Simulate API logic: Fetch vote with roll_call and parliamentarians
    const { data: detailedVote, error } = await supabase
        .from('votes')
        .select(`
            *,
            bill:bill_id (titulo, boletin),
            roll_call:vote_roll_call (
                voto,
                parliamentarian:parliamentarian_id (
                    id,
                    nombre_completo,
                    partido,
                    camara,
                    region
                )
            )
        `)
        .eq('id', vote.id)
        .single();

    if (error) {
        console.error("❌ Error fetching detailed vote:", error.message);
        return;
    }

    if (!detailedVote.roll_call || detailedVote.roll_call.length === 0) {
        console.warn("⚠️ Vote found, but no roll call data (common for mock data if not seeded yet).");
        // We might need to inject roll call mock data if it's missing for visual verification
    } else {
        console.log(`✅ Roll Call Data Found: ${detailedVote.roll_call.length} records`);
        console.log("Sample Record:", detailedVote.roll_call[0]);
    }
}

verifyHemicycleData();
