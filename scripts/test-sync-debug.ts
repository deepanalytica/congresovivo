import { NextRequest } from 'next/server';
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
                const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Simple cleanup
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
        console.log('✅ Loaded .env.local');
    } else {
        console.log('⚠️ .env.local not found');
    }
} catch (e) {
    console.error('⚠️ Error loading .env.local:', e);
}
// --------------------------------

// Mock request
const req = new NextRequest('http://localhost:3000/api/sync/debug-bill-sync');

async function run() {
    console.log('--- Starting Verification Script ---');
    try {
        // Dynamic import to ensure env vars are loaded first
        const { GET } = await import('@/app/api/sync/debug-bill-sync/route');

        const response = await GET(req);
        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (response.status === 200 && data.success) {
            console.log('✅ SUCCESS: Sync logic executed without error.');
        } else {
            console.error('❌ FAILURE: Sync returned error or partial success.');
        }
    } catch (err) {
        console.error('❌ CRITICAL ERROR:', err);
    }
}

run();
