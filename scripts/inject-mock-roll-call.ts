
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

async function injectMockRollCall() {
    console.log("🛠️ Injecting Mock Roll Call Data...");

    // 1. Fetch Parliamentarians
    const { data: parliamentarians, error: pErr } = await supabase
        .from('parliamentarians')
        .select('id')
        .limit(200);

    if (pErr || !parliamentarians || parliamentarians.length === 0) {
        console.error("❌ No parliamentarians found. Need to inject them first? Error:", pErr?.message);
        return;
    }
    console.log(`✅ Found ${parliamentarians.length} parliamentarians.`);

    // 2. Fetch Votes
    const { data: votes, error: vErr } = await supabase
        .from('votes')
        .select('*');

    if (vErr || !votes || votes.length === 0) {
        console.error("❌ No votes found. Error:", vErr?.message);
        return;
    }
    console.log(`✅ Found ${votes.length} votes.`);

    let totalRecords = 0;

    // 3. Generate Roll Call for each vote
    for (const vote of votes) {
        const voteId = vote.id;

        // Target counts
        let remainingYes = vote.a_favor || 0;
        let remainingNo = vote.contra || 0;
        let remainingAbst = vote.abstenciones || 0;

        // Shuffle parliamentarians to randomize who voted what
        const shuffled = [...parliamentarians].sort(() => 0.5 - Math.random());

        const rollCallRecords = [];

        for (const parl of shuffled) {
            let userVote = 'ausente'; // Default

            if (remainingYes > 0) {
                userVote = 'si';
                remainingYes--;
            } else if (remainingNo > 0) {
                userVote = 'no';
                remainingNo--;
            } else if (remainingAbst > 0) {
                userVote = 'abstencion';
                remainingAbst--;
            } else {
                // If we have satisfied counts but still have politicians, mark remaining as absent
                userVote = 'ausente';
            }

            rollCallRecords.push({
                vote_id: voteId,
                parliamentarian_id: parl.id,
                voto: userVote,
                created_at: new Date().toISOString()
            });
        }

        // Batch insert (Supabase has limit, but 155 is fine)
        const { error: insErr } = await supabase
            .from('vote_roll_call')
            .upsert(rollCallRecords, { onConflict: undefined, ignoreDuplicates: false }); // No explicit conflict key usually for join table unless ID

        if (insErr) {
            console.error(`❌ Error inserting for vote ${voteId}:`, insErr.message);
        } else {
            totalRecords += rollCallRecords.length;
            process.stdout.write('.');
        }
    }

    console.log(`\n✅ Injection Complete. Inserted ~${totalRecords} roll call records.`);
}

injectMockRollCall();
