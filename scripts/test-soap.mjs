
import { retornarProyectosLeyXAnno } from './src/lib/api/opendata/bills.js';

async function test() {
    try {
        console.log('Testing retornarProyectosLeyXAnno(2024)...');
        const projects = await retornarProyectosLeyXAnno(2024);
        console.log(`Success! Found ${projects.length} projects.`);
    } catch (e) {
        console.error('FAILED:', e.message);
        if (e.stack) console.error(e.stack);
    }
}

test();
