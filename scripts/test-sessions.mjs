
import { DOMParser } from 'xmldom';

const CAMARA_BASE_URL = 'https://opendata.camara.cl';
const SENADO_BASE_URL = 'https://tramitacion.senado.cl/wspublico';

async function executeSoap(action, body) {
    const envelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    ${body}
  </soap:Body>
</soap:Envelope>`;

    try {
        const res = await fetch(`${CAMARA_BASE_URL}/wscamaradiputados.asmx`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': `http://tempuri.org/${action}`
            },
            body: envelope
        });
        if (!res.ok) return null;
        const text = await res.text();
        return new DOMParser().parseFromString(text, 'text/xml');
    } catch (e) {
        return null;
    }
}

async function testSenateBulletin(boletin) {
    const url = `${SENADO_BASE_URL}/tramitacion.php?boletin=${boletin}`;
    try {
        const res = await fetch(url);
        const text = await res.text();
        if (text.includes('<proyecto>')) {
            console.log(`[Senate] Found bulletin ${boletin}!`);
            return true;
        }
        console.log(`[Senate] Bulletin ${boletin} not found/invalid response.`);
        return false;
    } catch (e) {
        console.log(`[Senate] Error: ${e.message}`);
        return false;
    }
}

async function testSessions() {
    console.log('1. Fetching Session Detail...');
    // Hardcode a session ID from previous run (4743) or fetch fresh
    const docLegParams = await executeSoap('getLegislaturaActual', '<getLegislaturaActual xmlns="http://tempuri.org/" />');
    const legislaturaId = docLegParams?.getElementsByTagName('ID')[0]?.textContent;
    if (!legislaturaId) {
        console.log('Failed to get Legislatura');
        return;
    }

    const docSes = await executeSoap('getSesiones', `
        <getSesiones xmlns="http://tempuri.org/">
            <prmLegislaturaID>${legislaturaId}</prmLegislaturaID>
        </getSesiones>
    `);
    const sesiones = Array.from(docSes.getElementsByTagName('Sesion'));
    const recentSession = sesiones[sesiones.length - 2]; // Try penultimate
    const sesionId = recentSession.getElementsByTagName('ID')[0]?.textContent;

    console.log(`   -> Checking Session ${sesionId}...`);
    const docDetalle = await executeSoap('getSesionDetalle', `
         <getSesionDetalle xmlns="http://tempuri.org/">
            <prmSesionID>${sesionId}</prmSesionID>
        </getSesionDetalle>
    `);

    // Look for text content in the detail that matches patterns like "Boletín N° 12345-00"
    // The SOAP response structure for SesionDetalle is complex, usually has huge text fields?
    // Let's dump a snippet.
    const fullText = docDetalle.documentElement.textContent;
    // naive check
    console.log(`   -> Text length: ${fullText.length}`);

    const matches = fullText.match(/Boletín N°\s*(\d{4,5}-\d{2})/g);
    if (matches) {
        console.log(`   -> Found ${matches.length} bulletin references!`);
        console.log(`   -> Example: ${matches[0]}`);

        // Extract the number (e.g. 16500)
        const rawBol = matches[0].split('°')[1].trim(); // 16500-01
        const cleanBol = rawBol.split('-')[0]; // 16500

        console.log(`2. Testing Senate API with extracted bulletin ${cleanBol}...`);
        await testSenateBulletin(cleanBol);
    } else {
        console.log('   -> No bulletin references found in session text.');
    }

    // Also test a known bulletin just in case
    console.log('3. Testing known bulletin 8575...');
    await testSenateBulletin('8575');
}

testSessions();
