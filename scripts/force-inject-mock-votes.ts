
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

async function injectMockVotes() {
    console.log("🛠️ Injecting Mock Votes (Fallback Mode)...");

    // 1. Get existing bills to link to
    const { data: bills } = await supabase.from('bills').select('id, boletin, titulo').limit(20);

    if (!bills || bills.length === 0) {
        console.error("❌ No bills found to link votes to.");
        return;
    }

    const mockVotes = bills.map((bill, index) => {
        const isApproved = Math.random() > 0.3;
        return {
            external_id: `MOCK-${2000 + index}`,
            boletin: bill.boletin || `MOCK-BOL-${index}`,
            bill_id: bill.id,
            fecha: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
            materia: `Votación General del proyecto: ${bill.titulo?.substring(0, 100) || 'Sin título'}`,
            tipo: 'Discusión General',
            resultado: isApproved ? 'aprobado' : 'rechazado',
            a_favor: isApproved ? 80 + Math.floor(Math.random() * 40) : 30 + Math.floor(Math.random() * 30),
            contra: isApproved ? 10 + Math.floor(Math.random() * 30) : 70 + Math.floor(Math.random() * 30),
            abstenciones: Math.floor(Math.random() * 10),
            ausentes: Math.floor(Math.random() * 15),
            pareos: 0,
            camara: Math.random() > 0.5 ? 'camara' : 'senado',
            quorum: 'Mayoria Simple',
            created_at: new Date().toISOString()
        };
    });

    const { error } = await supabase.from('votes').upsert(mockVotes, { onConflict: 'external_id' });

    if (error) {
        console.error("❌ Error injecting mock votes:", error.message);
    } else {
        console.log(`✅ Successfully injected ${mockVotes.length} mock votes.`);
    }
}

injectMockVotes();
