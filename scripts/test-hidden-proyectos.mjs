
import { DOMParser } from 'xmldom';

const CAMARA_BASE_URL = 'https://opendata.camara.cl';

async function testHiddenMethod() {
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getProyectos_Ley xmlns="http://tempuri.org/">
      <fechaInicio>2024-01-01</fechaInicio>
      <fechaTermino>2024-12-31</fechaTermino>
    </getProyectos_Ley>
  </soap:Body>
</soap:Envelope>`;

    try {
        console.log('Testing getProyectos_Ley on wscamaradiputados.asmx...');
        const response = await fetch(`${CAMARA_BASE_URL}/wscamaradiputados.asmx`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': 'http://tempuri.org/getProyectos_Ley',
            },
            body: soapEnvelope,
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response (first 500 chars):', text.substring(0, 500));

        if (text.includes('Proyecto')) {
            console.log('SUCCESS! Found project data.');
        } else {
            console.log('FAILED! No project data found in response.');
        }
    } catch (e) {
        console.error('CRASH:', e.message);
    }
}

testHiddenMethod();
