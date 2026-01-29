import { NextRequest, NextResponse } from 'next/server';
import { parseXML } from '@/lib/api/opendata-client';

export const dynamic = 'force-dynamic';

async function callSoap(action: string, body: string) {
    const response = await fetch('https://opendata.camara.cl/wscamaradiputados.asmx', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': `http://tempuri.org/${action}`,
        },
        body: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    ${body}
  </soap:Body>
</soap:Envelope>`,
    });
    return response.text();
}

export async function GET(request: NextRequest) {
    try {
        const results: any = {};

        // 1. Get Actual Period ID
        const periodXml = await callSoap('getPeriodoLegislativoActual', '<getPeriodoLegislativoActual xmlns="http://tempuri.org/" />');
        const periodId = periodXml.match(/<ID>(\d+)<\/ID>/)?.[1] || '55'; // Default guess if fail
        results.periodId = periodId;

        // 2. Try getDiputados_Periodo (ID 55 for current)
        const dipXml = await callSoap('getDiputados_Periodo', '<getDiputados_Periodo xmlns="http://tempuri.org/"><prmPeriodoID>55</prmPeriodoID></getDiputados_Periodo>');
        results.getDiputados_Snippet = dipXml.split('<Diputado>')[1]?.substring(0, 2000);
        results.getDiputados_HasDistrito = dipXml.includes('Distrito');
        results.getDiputados_HasRegion = dipXml.includes('Region');

        return NextResponse.json(results);

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
