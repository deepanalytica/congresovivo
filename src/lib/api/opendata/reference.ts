import { DOMParser } from 'xmldom';

const CAMARA_BASE_URL = 'https://opendata.camara.cl';

/**
 * OpenData API Client for Chilean Chamber of Deputies
 * Based on https://www.camara.cl/transparencia/datosAbiertos.aspx
 * Uses native fetch + xmldom to avoid 'soap' dependency issues
 */

// =====================================================
// REFERENCE DATA (Datos Comunes)
// =====================================================

export interface Distrito {
    codigo: string;
    nombre: string;
    diputados: number;
}

export interface Region {
    codigo: string;
    nombre: string;
}

export interface Comuna {
    codigo: string;
    nombre: string;
    provincia: string;
    region: string;
}

export interface Provincia {
    codigo: string;
    nombre: string;
    region: string;
}

export interface Ministerio {
    codigo: string;
    nombre: string;
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
 * Get all electoral districts (28 total)
 */
export async function retornarDistritos(): Promise<Distrito[]> {
    try {
        const doc = await executeCamaraSoap('retornarDistritos', `
            <retornarDistritos xmlns="http://tempuri.org/" />
        `);
        const resultNode = doc.getElementsByTagName('retornarDistritosResult')[0];
        const xmlContent = resultNode?.textContent || '';
        return parseDistritosXML(xmlContent);
    } catch (error) {
        console.error('Error fetching distritos:', error);
        throw error;
    }
}

/**
 * Get all regions (16 total)
 */
export async function retornarRegiones(): Promise<Region[]> {
    try {
        const doc = await executeCamaraSoap('retornarRegiones', `
            <retornarRegiones xmlns="http://tempuri.org/" />
        `);
        const resultNode = doc.getElementsByTagName('retornarRegionesResult')[0];
        const xmlContent = resultNode?.textContent || '';
        return parseRegionesXML(xmlContent);
    } catch (error) {
        console.error('Error fetching regiones:', error);
        throw error;
    }
}

/**
 * Get all comunas
 */
export async function retornarComunas(): Promise<Comuna[]> {
    try {
        const doc = await executeCamaraSoap('retornarComunas', `
            <retornarComunas xmlns="http://tempuri.org/" />
        `);
        const resultNode = doc.getElementsByTagName('retornarComunasResult')[0];
        const xmlContent = resultNode?.textContent || '';
        return parseComunasXML(xmlContent);
    } catch (error) {
        console.error('Error fetching comunas:', error);
        throw error;
    }
}

/**
 * Get all provincias
 */
export async function retornarProvincias(): Promise<Provincia[]> {
    try {
        const doc = await executeCamaraSoap('retornarProvincias', `
            <retornarProvincias xmlns="http://tempuri.org/" />
        `);
        const resultNode = doc.getElementsByTagName('retornarProvinciasResult')[0];
        const xmlContent = resultNode?.textContent || '';
        return parseProvinciasXML(xmlContent);
    } catch (error) {
        console.error('Error fetching provincias:', error);
        throw error;
    }
}

/**
 * Get all ministerios
 */
export async function retornarMinisterios(): Promise<Ministerio[]> {
    try {
        const doc = await executeCamaraSoap('retornarMinisterios', `
            <retornarMinisterios xmlns="http://tempuri.org/" />
        `);
        const resultNode = doc.getElementsByTagName('retornarMinisteriosResult')[0];
        const xmlContent = resultNode?.textContent || '';
        return parseMinisteriosXML(xmlContent);
    } catch (error) {
        console.error('Error fetching ministerios:', error);
        throw error;
    }
}

// =====================================================
// XML PARSERS
// =====================================================

function parseDistritosXML(xml: string): Distrito[] {
    const distritos: Distrito[] = [];
    const matches = xml.matchAll(/<Distrito>([\s\S]*?)<\/Distrito>/g);

    for (const match of matches) {
        const distritoXML = match[1];
        distritos.push({
            codigo: extractXMLValue(distritoXML, 'Codigo'),
            nombre: extractXMLValue(distritoXML, 'Nombre'),
            diputados: parseInt(extractXMLValue(distritoXML, 'NumeroDiputados') || '0')
        });
    }

    return distritos;
}

function parseRegionesXML(xml: string): Region[] {
    const regiones: Region[] = [];
    const matches = xml.matchAll(/<Region>([\s\S]*?)<\/Region>/g);

    for (const match of matches) {
        const regionXML = match[1];
        regiones.push({
            codigo: extractXMLValue(regionXML, 'Codigo'),
            nombre: extractXMLValue(regionXML, 'Nombre')
        });
    }

    return regiones;
}

function parseComunasXML(xml: string): Comuna[] {
    const comunas: Comuna[] = [];
    const matches = xml.matchAll(/<Comuna>([\s\S]*?)<\/Comuna>/g);

    for (const match of matches) {
        const comunaXML = match[1];
        comunas.push({
            codigo: extractXMLValue(comunaXML, 'Codigo'),
            nombre: extractXMLValue(comunaXML, 'Nombre'),
            provincia: extractXMLValue(comunaXML, 'Provincia'),
            region: extractXMLValue(comunaXML, 'Region')
        });
    }

    return comunas;
}

function parseProvinciasXML(xml: string): Provincia[] {
    const provincias: Provincia[] = [];
    const matches = xml.matchAll(/<Provincia>([\s\S]*?)<\/Provincia>/g);

    for (const match of matches) {
        const provinciaXML = match[1];
        provincias.push({
            codigo: extractXMLValue(provinciaXML, 'Codigo'),
            nombre: extractXMLValue(provinciaXML, 'Nombre'),
            region: extractXMLValue(provinciaXML, 'Region')
        });
    }

    return provincias;
}

function parseMinisteriosXML(xml: string): Ministerio[] {
    const ministerios: Ministerio[] = [];
    const matches = xml.matchAll(/<Ministerio>([\s\S]*?)<\/Ministerio>/g);

    for (const match of matches) {
        const ministerioXML = match[1];
        ministerios.push({
            codigo: extractXMLValue(ministerioXML, 'Codigo'),
            nombre: extractXMLValue(ministerioXML, 'Nombre')
        });
    }

    return ministerios;
}

/**
 * Extract value from XML tag
 */
function extractXMLValue(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
}
