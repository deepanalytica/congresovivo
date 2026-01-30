
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
    console.warn('⚠️ Error loading .env.local:', e);
}

// Dynamic import to avoid static import issues if opendata has dependencies
async function run() {
    const { retornarVotacionesXAnno } = await import('@/lib/api/opendata/votes');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase Credentials');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const years = [2024, 2025]; // Fetch both years
    let totalSynced = 0;

    for (const year of years) {
        console.log(`🔄 Fetching votes for ${year}...`);

        try {
            const votes = await retornarVotacionesXAnno(year);
            console.log(`   Found ${votes.length} votes.`);

            // Process in batches
            const batchSize = 20;
            for (let i = 0; i < votes.length; i += batchSize) {
                const batch = votes.slice(i, i + batchSize);

                for (const vote of batch) {
                    // Try to find bill_id from boletin
                    let billId = null;
                    if (vote.boletin) {
                        const { data: bill } = await supabase
                            .from('bills')
                            .select('id')
                            .eq('boletin', vote.boletin) // Assuming 'boletin' column exists in bills based on etl-pipeline
                            .maybeSingle(); // Use maybeSingle to avoid error if not found

                        if (bill) {
                            billId = bill.id;
                        }
                    }

                    // Normalize result
                    let normalizedResult = 'unknown';
                    const resLower = (vote.resultado || '').toLowerCase();
                    if (resLower.includes('aprobado')) normalizedResult = 'aprobado';
                    else if (resLower.includes('rechazado')) normalizedResult = 'rechazado';
                    else if (resLower.includes('unanime') || resLower.includes('unánime')) normalizedResult = 'aprobado';

                    // Upsert Vote
                    const { error } = await supabase
                        .from('legislative_votes')
                        .upsert({
                            external_id: vote.id,
                            bill_id: billId,
                            vote_date: vote.fecha,
                            description: vote.descripcion,
                            result: normalizedResult,
                            yes_count: vote.afirmativos,
                            no_count: vote.negativos,
                            abstention_count: vote.abstenciones,
                            absent_count: vote.dispensados + (vote.pareos || 0), // Sum pareos as absent/not voting
                            vote_context: 'camara', // Source is Camara
                            quorum_type: vote.quorum,
                            updated_at: new Date().toISOString()
                        }, {
                            onConflict: 'external_id'
                        });

                    if (error) {
                        console.error(`   ❌ Error saving vote ${vote.id}: ${error.message}`);
                    } else {
                        // console.log(`      Saved vote ${vote.id}`);
                        totalSynced++;
                    }
                }
                process.stdout.write('.');
            }
            console.log('\n');

        } catch (e: any) {
            console.error(`❌ Error fetching year ${year}:`, e.message);
        }
    }

    console.log(`✅ Vote Injection Complete. Total Synced: ${totalSynced}`);
}

run();
