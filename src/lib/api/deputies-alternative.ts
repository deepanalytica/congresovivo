/**
 * Alternative API client for deputies using different SOAP endpoint
 */

import { DOMParser } from 'xmldom';

const DIPUTADOS_WS_URL = 'https://opendata.camara.cl/camaradiputados/WServices/WSDiputado.asmx';

/**
 * Parse XML string to Document
 */
function parseXML(xmlString: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(xmlString, 'text/xml');
}

/**
 * Get current deputies using alternative SOAP endpoint
 */
export async function getDiputadosAlternative() {
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <retornarDiputadosPeriodoActual xmlns="http://tempuri.org/" />
  </soap:Body>
</soap:Envelope>`;

    const response = await fetch(DIPUTADOS_WS_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://tempuri.org/retornarDiputadosPeriodoActual',
        },
        body: soapEnvelope,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const doc = parseXML(xmlText);

    // Parse SOAP response
    const diputadosNodes = doc.getElementsByTagName('Diputado');
    const diputados = Array.from(diputadosNodes).map(diputado => {
        const getTag = (tag: string) => {
            const elements = diputado.getElementsByTagName(tag);
            return elements.length > 0 ? elements[0].textContent || '' : '';
        };

        return {
            id: getTag('id') || getTag('Id'),
            nombre: getTag('nombre') || getTag('Nombre'),
            apellidoPaterno: getTag('apellidoPaterno') || getTag('ApellidoPaterno'),
            apellidoMaterno: getTag('apellidoMaterno') || getTag('ApellidoMaterno'),
            partido: getTag('partido') || getTag('Partido'),
            region: getTag('region') || getTag('Region'),
            distrito: getTag('distrito') || getTag('Distrito'),
            email: getTag('email') || getTag('Email') || getTag('correo'),
        };
    });

    return diputados;
}
