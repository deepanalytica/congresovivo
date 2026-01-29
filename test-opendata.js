const CAMARA_BASE_URL = 'https://opendata.camara.cl';

async function testApi(method) {
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${method} xmlns="http://opendata.camara.cl/" />
  </soap:Body>
</soap:Envelope>`;

    console.log(`Testing method: ${method}...`);
    try {
        const response = await fetch(`${CAMARA_BASE_URL}/wscamaradiputados.asmx`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': `http://opendata.camara.cl/${method}`,
            },
            body: soapEnvelope,
        });

        console.log('Status:', response.status);
        if (response.status === 200) {
            const text = await response.text();
            console.log('Response length:', text.length);
            console.log('Preview:', text.substring(0, 200));
        } else {
            const text = await response.text();
            console.log('Error Preview:', text.substring(0, 500));
        }
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

async function runTests() {
    await testApi('getDiputados_Vigentes');
    console.log('-------------------');
    await testApi('getVotaciones_Vigentes');
}

runTests();
