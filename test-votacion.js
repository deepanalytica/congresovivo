const CAMARA_BASE_URL = 'https://opendata.camara.cl';

async function testVotacionDetalle(id) {
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getVotacion_Detalle xmlns="http://tempuri.org/">
      <prmVotacionID>${id}</prmVotacionID>
    </getVotacion_Detalle>
  </soap:Body>
</soap:Envelope>`;

    console.log(`Testing getVotacion_Detalle for ID: ${id}...`);
    try {
        const response = await fetch(`${CAMARA_BASE_URL}/wscamaradiputados.asmx`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': `http://tempuri.org/getVotacion_Detalle`,
            },
            body: soapEnvelope,
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response length:', text.length);
        console.log('Preview (IDs section):');
        // Look for <Diputado> or <DIPID> or <Id>
        const match = text.match(/<Diputado>[\s\S]*?<\/Diputado>/g);
        if (match) {
            console.log(match.slice(0, 3).join('\n'));
        } else {
            console.log('No <Diputado> tags found. Previewing first 1000 chars:');
            console.log(text.substring(0, 1000));
        }
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

testVotacionDetalle(27528);
