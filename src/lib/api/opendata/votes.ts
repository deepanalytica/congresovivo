import { DOMParser } from 'xmldom';

const CAMARA_BASE_URL = 'https://opendata.camara.cl';

/**
 * OpenData API Client for Votes (Votaciones)
 * Uses native fetch + xmldom to avoid 'soap' package issues
 */

export interface VotacionLegislativa {
    id: string;
    boletin?: string;
    fecha: string;
    descripcion: string;
    resultado: string;
    quorum?: string;
    tipo?: string;
    afirmativos: number;
    negativos: number;
    abstenciones: number;
    dispensados: number;
    pareos?: number;
}

export interface DetalleVoto {
    parlamentarioId: string;
    opcion: string;
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
 * Get all votes from a specific year
 */
export async function retornarVotacionesXAnno(year: number): Promise<VotacionLegislativa[]> {
    try {
        const doc = await executeCamaraSoap('retornarVotacionesXAnno', `
            <retornarVotacionesXAnno xmlns="http://tempuri.org/">
                <prmAnno>${year}</prmAnno>
            </retornarVotacionesXAnno>
        `);

        const resultNode = doc.getElementsByTagName('retornarVotacionesXAnnoResult')[0];
        const xmlContent = resultNode?.textContent || '';
        return parseVotacionesXML(xmlContent);
    } catch (error) {
        console.error('Error fetching votaciones by year:', error);
        return [];
    }
}

/**
 * Get votes for a specific bill (boletin)
 */
export async function retornarVotacionesXProyectoLey(boletin: string): Promise<VotacionLegislativa[]> {
    try {
        const doc = await executeCamaraSoap('retornarVotacionesXProyectoLey', `
            <retornarVotacionesXProyectoLey xmlns="http://tempuri.org/">
                <prmBoletin>${boletin}</prmBoletin>
            </retornarVotacionesXProyectoLey>
        `);

        const resultNode = doc.getElementsByTagName('retornarVotacionesXProyectoLeyResult')[0];
        const xmlContent = resultNode?.textContent || '';
        return parseVotacionesXML(xmlContent);
    } catch (error) {
        console.error('Error fetching votaciones for bill:', error);
        return [];
    }
}

/**
 * Get detailed roll-call records for a specific vote ID
 */
export async function retornarVotacionDetalle(voteId: string): Promise<DetalleVoto[]> {
    try {
        const doc = await executeCamaraSoap('retornarVotacionDetalle', `
            <retornarVotacionDetalle xmlns="http://tempuri.org/">
                <prmVotacionId>${voteId}</prmVotacionId>
            </retornarVotacionDetalle>
        `);

        const resultNode = doc.getElementsByTagName('retornarVotacionDetalleResult')[0];
        const xmlContent = resultNode?.textContent || '';
        return parseDetalleVotoXML(xmlContent);
    } catch (error) {
        console.error('Error fetching vote detail:', error);
        return [];
    }
}

// =====================================================
// XML PARSERS (Using stable string matching)
// =====================================================

function parseVotacionesXML(xml: string): VotacionLegislativa[] {
    if (!xml) return [];
    const votaciones: VotacionLegislativa[] = [];
    const matches = xml.matchAll(/<Votacion>([\s\S]*?)<\/Votacion>/g);

    for (const match of matches) {
        const vXML = match[1];
        votaciones.push({
            id: extractXMLValue(vXML, 'Id'),
            boletin: extractXMLValue(vXML, 'Boletin'),
            fecha: extractXMLValue(vXML, 'Fecha'),
            descripcion: extractXMLValue(vXML, 'Descripcion'),
            resultado: extractXMLValue(vXML, 'Resultado'),
            quorum: extractXMLValue(vXML, 'Quorum'),
            tipo: extractXMLValue(vXML, 'Tipo'),
            afirmativos: parseInt(extractXMLValue(vXML, 'TotalAfirmativos') || '0'),
            negativos: parseInt(extractXMLValue(vXML, 'TotalNegativos') || '0'),
            abstenciones: parseInt(extractXMLValue(vXML, 'TotalAbstenciones') || '0'),
            dispensados: parseInt(extractXMLValue(vXML, 'TotalDispensados') || '0'),
            pareos: parseInt(extractXMLValue(vXML, 'TotalPareos') || '0')
        });
    }

    return votaciones;
}

function parseDetalleVotoXML(xml: string): DetalleVoto[] {
    if (!xml) return [];
    const detalles: DetalleVoto[] = [];
    const matches = xml.matchAll(/<Voto>([\s\S]*?)<\/Voto>/g);

    for (const match of matches) {
        const vXML = match[1];
        detalles.push({
            parlamentarioId: extractXMLValue(vXML, 'DiputadoId') || extractXMLValue(vXML, 'Id'), // Handle variations
            opcion: extractXMLValue(vXML, 'Opcion')
        });
    }

    return detalles;
}

function extractXMLValue(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
}
