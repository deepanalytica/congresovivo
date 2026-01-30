// Final Production Sync Trigger
// Uses native fetch (Node 18+)

/**
 * Trigger Full Sync for specified years
 * This avoids browser timeouts by running as a separate process
 */
async function triggerSync() {
    const years = [2024, 2025];
    const baseUrl = 'http://localhost:3000';

    console.log('🚀 Starting Production-Level Data Synchronization...');

    for (const year of years) {
        console.log(`\n📅 Processing year: ${year}`);
        try {
            const response = await fetch(`${baseUrl}/api/sync/all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year })
            });

            if (!response.ok) {
                const error = await response.text();
                console.error(`❌ Failed to sync ${year}: ${error}`);
                continue;
            }

            const result = await response.json();
            console.log(`✅ ${year} Sync Result:`, JSON.stringify(result.results, null, 2));
        } catch (error) {
            console.error(`💥 Runtime Error for ${year}:`, error.message);
        }
    }

    console.log('\n✨ Full Sync Complete. verify database for integrity.');
}

triggerSync();
