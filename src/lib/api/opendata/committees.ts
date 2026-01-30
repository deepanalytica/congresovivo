import { DOMParser } from 'xmldom';

const CAMARA_BASE_URL = 'https://opendata.camara.cl';

/**
 * OpenData API Client for Committees (Comisiones)
 * Uses native fetch + xmldom to avoid 'soap' package issues
 */

export interface Comision {
    id: string;
    nombre: string;
    nombreCorto?: string;
    tipo: string;
    camara: string;
    descripcion?: string;
    activa: boolean;
}

export interface SesionComision {
    id: string;
    comisionId: string;
    numero: number;
    fecha: string;
    tipo: string;
    estado: string;
    descripcion?: string;
    ubicacion?: string;
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
 * Get all active committees
 */
export async function retornarComisionesVigentes(): Promise<Comision[]> {
    try {
        const doc = await executeCamaraSoap('retornarComisionesVigentes', `
            <retornarComisionesVigentes xmlns="http://tempuri.org/" />
        `);

        const resultNode = doc.getElementsByTagName('retornarComisionesVigentesResult')[0];
        const xmlContent = resultNode?.textContent || '';
        return parseComisionesXML(xmlContent);
    } catch (error) {
        console.error('Error fetching comisiones vigentes:', error);
        throw error;
    }
}

/**
 * Get committee detail
 */
export async function retornarComision(comisionId: string): Promise<Comision | null> {
    try {
        const doc = await executeCamaraSoap('retornarComision', `
            <retornarComision xmlns="http://tempuri.org/">
                <prmComisionId>${comisionId}</prmComisionId>
            </retornarComision>
        `);

        const resultNode = doc.getElementsByTagName('retornarComisionResult')[0];
        const xmlContent = resultNode?.textContent || '';
        const comisiones = parseComisionesXML(xmlContent);
        return comisiones[0] || null;
    } catch (error) {
        console.error('Error fetching comision:', error);
        throw error;
    }
}

/**
 * Get sessions for a committee in a specific year
 */
export async function retornarSesionesXComisionYAnno(
    comisionId: string,
    year: number
): Promise<SesionComision[]> {
    try {
        const doc = await executeCamaraSoap('retornarSesionesXComisionYAnno', `
            <retornarSesionesXComisionYAnno xmlns="http://tempuri.org/">
                <prmComisionId>${comisionId}</prmComisionId>
                <prmAnno>${year}</prmAnno>
            </retornarSesionesXComisionYAnno>
        `);

        const resultNode = doc.getElementsByTagName('retornarSesionesXComisionYAnnoResult')[0];
        const xmlContent = resultNode?.textContent || '';
        return parseSesionesXML(xmlContent, comisionId);
    } catch (error) {
        console.error('Error fetching sesiones:', error);
        throw error;
    }
}

/**
 * Get committees by legislative period
 */
export async function retornarComisionesXPeriodo(periodoId: string): Promise<Comision[]> {
    try {
        const doc = await executeCamaraSoap('retornarComisionesXPeriodo', `
            <retornarComisionesXPeriodo xmlns="http://tempuri.org/">
                <prmPeriodoId>${periodoId}</prmPeriodoId>
            </retornarComisionesXPeriodo>
        `);

        const resultNode = doc.getElementsByTagName('retornarComisionesXPeriodoResult')[0];
        const xmlContent = resultNode?.textContent || '';
        return parseComisionesXML(xmlContent);
    } catch (error) {
        console.error('Error fetching comisiones por periodo:', error);
        throw error;
    }
}

// =====================================================
// XML PARSERS
// =====================================================

function parseComisionesXML(xml: string): Comision[] {
    const comisiones: Comision[] = [];
    const matches = xml.matchAll(/<Comision>([\s\S]*?)<\/Comision>/g);

    for (const match of matches) {
        const comisionXML = match[1];
        const id = extractXMLValue(comisionXML, 'Id');
        const nombre = extractXMLValue(comisionXML, 'Nombre');
        const nombreCorto = extractXMLValue(comisionXML, 'NombreCorto');
        const tipo = extractXMLValue(comisionXML, 'Tipo');
        const camara = extractXMLValue(comisionXML, 'Camara') || 'camara';
        const descripcion = extractXMLValue(comisionXML, 'Descripcion');
        const activa = extractXMLValue(comisionXML, 'Activa')?.toLowerCase() === 'true';

        comisiones.push({
            id,
            nombre,
            nombreCorto,
            tipo,
            camara: camara.toLowerCase(),
            descripcion,
            activa
        });
    }

    return comisiones;
}

function parseSesionesXML(xml: string, comisionId: string): SesionComision[] {
    const sesiones: SesionComision[] = [];
    const matches = xml.matchAll(/<Sesion>([\s\S]*?)<\/Sesion>/g);

    for (const match of matches) {
        const sesionXML = match[1];
        const id = extractXMLValue(sesionXML, 'Id');
        const numero = parseInt(extractXMLValue(sesionXML, 'Numero') || '0');
        const fecha = extractXMLValue(sesionXML, 'Fecha');
        const tipo = extractXMLValue(sesionXML, 'Tipo');
        const estado = extractXMLValue(sesionXML, 'Estado');
        const descripcion = extractXMLValue(sesionXML, 'Descripcion');
        const ubicacion = extractXMLValue(sesionXML, 'Ubicacion');

        sesiones.push({
            id,
            comisionId,
            numero,
            fecha,
            tipo,
            estado,
            descripcion,
            ubicacion
        });
    }

    return sesiones;
}

function extractXMLValue(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
}
