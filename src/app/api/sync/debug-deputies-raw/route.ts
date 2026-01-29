import { NextRequest, NextResponse } from 'next/server';
import { getDiputados } from '@/lib/api/opendata-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // We'll modify getDiputados temporarily or just fetch raw here to verify tags
        // Let's implement a raw fetch similar to opendata-client but return the raw keys found

        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getDiputados_Vigentes xmlns="http://tempuri.org/" />
  </soap:Body>
</soap:Envelope>`;

        const response = await fetch('https://opendata.camara.cl/wscamaradiputados.asmx', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': 'http://tempuri.org/getDiputados_Vigentes',
            },
            body: soapEnvelope,
        });

        const xmlText = await response.text();

        // Simple regex to find region tags to see case sensitivity
        const regionTags = xmlText.match(/<[^>]*Region[^>]*>/g);
        const regionValues = xmlText.match(/<Region>(.*?)<\/Region>/g);

        // Dump the first 2000 chars of a Diputado element to see structure
        const firstDiputado = xmlText.split('<Diputado>')[1]?.substring(0, 2000);

        return NextResponse.json({
            has_region_tag: xmlText.includes('<Region>'),
            has_metropolitana: xmlText.includes('Metropolitana'),
            first_diputado_snippet: firstDiputado
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
