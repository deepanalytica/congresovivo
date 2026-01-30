import { DOMParser } from 'xmldom';

const CAMARA_BASE_URL = 'https://opendata.camara.cl';
const SENADO_BASE_URL = 'https://tramitacion.senado.cl/wspublico';

/**
 * OpenData API Client for Parliamentarians (Diputados & Senadores)
 * Uses native fetch + xmldom to avoid 'soap' dependency issues
 */

export interface Deputy {
    id: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    nombre_completo: string;
    partido: string;
    region: string;
    distrito: string;
    email?: string;
}

export interface Senator {
    id: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    nombre_completo: string;
    partido: string;
    region: string;
    circunscripcion: string;
    email: string;
    telefono?: string;
}

/**
 * Fetch and parse XML from URL
 */
async function fetchXML(url: string): Promise<Document> {
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/xml, text/xml',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    return parser.parseFromString(xmlText, 'text/xml');
}

/**
 * Execute SOAP request to Cámara OpenData
 */
async function executeCamaraSoap(action: string, body: string): Promise<Document> {
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    ${body}
  </soap:Body>
</soap:Envelope>`;

    const response = await fetch(`${CAMARA_BASE_URL}/wscamaradiputados.asmx`, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': `http://tempuri.org/${action}`,
        },
        body: soapEnvelope,
    });

    if (!response.ok) {
        throw new Error(`SOAP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    return parser.parseFromString(xmlText, 'text/xml');
}

/**
 * Get current senators from Senado API
 */
export async function retornarSenadoresVigentes(): Promise<Senator[]> {
    const url = `${SENADO_BASE_URL}/senadores_vigentes.php`;
    const doc = await fetchXML(url);

    const senadoresNodes = doc.getElementsByTagName('senador');
    return Array.from(senadoresNodes).map(senador => {
        const getTag = (tag: string) => {
            const elements = senador.getElementsByTagName(tag);
            return elements.length > 0 ? elements[0].textContent || '' : '';
        };

        const nombre = getTag('PARLNOMBRE');
        const paterno = getTag('PARLAPELLIDOPATERNO');
        const materno = getTag('PARLAPELLIDOMATERNO');

        return {
            id: getTag('PARLID'),
            nombre,
            apellido_paterno: paterno,
            apellido_materno: materno,
            nombre_completo: `${nombre} ${paterno} ${materno}`.trim(),
            partido: getTag('PARTIDO'),
            region: getTag('REGION'),
            circunscripcion: getTag('CIRCUNSCRIPCION'),
            email: getTag('EMAIL'),
            telefono: getTag('FONO'),
        };
    });
}

/**
 * Get current deputies from Cámara API (SOAP)
 */
export async function retornarDiputados(): Promise<Deputy[]> {
    const doc = await executeCamaraSoap('getDiputados_Vigentes', `
        <getDiputados_Vigentes xmlns="http://tempuri.org/" />
    `);

    const diputadosNodes = doc.getElementsByTagName('Diputado');
    return Array.from(diputadosNodes).map(diputado => {
        const getTag = (tag: string) => {
            const elements = diputado.getElementsByTagName(tag);
            return elements.length > 0 ? elements[0].textContent || '' : '';
        };

        const id = getTag('Id');
        const nombre = getTag('Nombre');
        const paterno = getTag('ApellidoPaterno');
        const materno = getTag('ApellidoMaterno');

        return {
            id,
            nombre,
            apellido_paterno: paterno,
            apellido_materno: materno,
            nombre_completo: `${nombre} ${paterno} ${materno}`.trim(),
            partido: getTag('Partido'),
            region: getTag('Region'),
            distrito: getTag('Distrito'),
            email: getTag('Email')
        };
    });
}
