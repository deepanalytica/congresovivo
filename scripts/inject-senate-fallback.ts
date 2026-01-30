
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { retornarVotacionesSenate } from '@/lib/api/opendata/senate';

async function run() {
    console.log('🚀 Starting Senate Fallback Injection...');

    // 1. Load Env
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf-8');
            envConfig.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
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

    // 2. Fetch Senate Votes
    try {
        console.log('🔄 Fetching Senate Votes...');
        const votes = await retornarVotacionesSenate();
        console.log(`📊 Found ${votes.length} votes.`);

        if (votes.length === 0) {
            console.log('⚠️ No votes returned. Check API or network.');
            return;
        }

        // 3. Transform and Upsert
        let inserted = 0;
        let errors = 0;

        for (const v of votes) {
            // Determine result based on totals if not explicit
            let result = v.resultado || 'pendiente';
            if (v.total_si > v.total_no) result = 'aprobado';
            else if (v.total_no > v.total_si) result = 'rechazado';
            else if (v.total_si > 0) result = 'aprobado'; // fallback

            const voteData = {
                vote_id: v.id,
                bill_id: null, // We'd need to lookup bill by bulletin, skipping for now or try fuzzy match
                vote_date: v.fecha,
                description: v.descripcion,
                result: result.toLowerCase(),
                quorum: null,
                vote_context: 'senado',
                yes_count: v.total_si,
                no_count: v.total_no,
                abstention_count: v.total_abst,
                pair_count: v.total_pareo,
                synced_at: new Date().toISOString()
            };

            // Try to link to bill if bulletin exists
            if (v.boletin) {
                const cleanBol = v.boletin.trim();
                const { data: bill } = await supabase
                    .from('bills')
                    .select('id')
                    .ilike('bulletin_number', `${cleanBol}%`) // fuzzy match 1234-05
                    .limit(1)
                    .maybeSingle();

                if (bill) {
                    voteData.bill_id = bill.id;
                }
            }

            const { error } = await supabase
                .from('legislative_votes')
                .upsert(voteData, { onConflict: 'vote_id' });

            if (error) {
                console.error(`❌ Error upserting vote ${v.id}:`, error.message);
                errors++;
            } else {
                inserted++;
            }
        }

        console.log(`✅ Senate Injection Complete: ${inserted} inserted, ${errors} errors.`);

    } catch (e: any) {
        console.error('❌ Fatal Error:', e.message);
    }
}

run();
