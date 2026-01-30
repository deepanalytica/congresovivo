import { DOMParser } from 'xmldom';

const CAMARA_BASE_URL = 'https://opendata.camara.cl';

/**
 * OpenData API Client for Bills (Proyectos de Ley)
 * Uses native fetch + xmldom to avoid 'soap' package issues
 */

export interface ProyectoLey {
    id: string;
    boletin: string;
    titulo: string;
    resumen?: string;
    tipo: string;
    camaraOrigen: string;
    tipoIniciativa: string;
    estado: string;
    etapa?: string;
    subEtapa?: string;
    fechaIngreso: string;
    fechaPublicacion?: string;
    numeroLey?: string;
    urgencia?: string;
    materias?: string[];
    autores?: AutorProyecto[];
}

export interface AutorProyecto {
    id: string;
    nombre: string;
    partido?: string;
}

export interface TramitacionEvento {
    fecha: string;
    descripcion: string;
    etapa: string;
    camara: string;
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

    const response = await fetch(`${CAMARA_BASE_URL}/WSLegislativo.asmx`, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': `http://tempuri.org/${action}`,
        },
        body: soapEnvelope,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ SOAP Error (${action}): status ${response.status}`, errorText);
        throw new Error(`SOAP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    return parser.parseFromString(xmlText, 'text/xml');
}

/**
 * Get bill by bulletin number
 */
export async function retornarProyectoLey(boletin: string): Promise<ProyectoLey | null> {
    try {
        const doc = await executeCamaraSoap('retornarProyectoLey', `
            <retornarProyectoLey xmlns="http://tempuri.org/">
                <prmBoletin>${boletin}</prmBoletin>
            </retornarProyectoLey>
        `);

        const resultNode = doc.getElementsByTagName('retornarProyectoLeyResult')[0];
        const xmlContent = resultNode?.textContent || '';
        const proyectos = parseProyectosXML(xmlContent);
        return proyectos[0] || null;
    } catch (error) {
        console.error('Error fetching proyecto:', error);
        throw error;
    }
}


const SENADO_BASE_URL = 'https://tramitacion.senado.cl/wspublico';

/**
 * Get bill by bulletin number from Senate API (Fallback)
 */
export async function retornarProyectoLeySenate(boletin: string): Promise<ProyectoLey | null> {
    try {
        // Clean bulletin (remove check digit if present)
        const cleanBol = boletin.split('-')[0];
        const url = `${SENADO_BASE_URL}/tramitacion.php?boletin=${cleanBol}`;

        const response = await fetch(url);
        if (!response.ok) return null;

        const xmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, 'text/xml');

        const proyectoNode = doc.getElementsByTagName('proyecto')[0];
        if (!proyectoNode) return null;

        const getTag = (parent: Element, tag: string) => {
            const elements = parent.getElementsByTagName(tag);
            return elements.length > 0 ? elements[0].textContent || '' : '';
        };

        const descripcion = proyectoNode.getElementsByTagName('descripcion')[0];
        if (!descripcion) return null;

        const rawDate = getTag(descripcion, 'fecha_ingreso');

        // Parse authors
        const autores: AutorProyecto[] = [];
        const autoresNode = proyectoNode.getElementsByTagName('autores')[0];
        if (autoresNode) {
            const autorElements = autoresNode.getElementsByTagName('autor');
            Array.from(autorElements).forEach(el => {
                const nombre = (getTag(el, 'NOMBRE') + ' ' + getTag(el, 'APELLIDO')).trim();
                // If explicit tags parse failed, try generic text
                const finalName = nombre.length > 1 ? nombre : (el.textContent || '').trim();
                if (finalName) {
                    autores.push({ id: '', nombre: finalName });
                }
            });
            // Try explicit 'parlamentario' tag if 'autor' element list was empty or parsed no names
            if (autores.length === 0) {
                const parlElements = autoresNode.getElementsByTagName('parlamentario');
                Array.from(parlElements).forEach(el => {
                    const nombre = (getTag(el, 'NOMBRE') + ' ' + getTag(el, 'APELLIDO')).trim();
                    const finalName = nombre.length > 1 ? nombre : (el.textContent || '').trim();
                    if (finalName) {
                        autores.push({ id: '', nombre: finalName });
                    }
                });
            }
        }

        // Map Senate XML to internal format
        const proyecto: ProyectoLey = {
            id: cleanBol, // Senate uses bulletin as ID
            boletin: getTag(descripcion, 'boletin'),
            titulo: getTag(descripcion, 'titulo'),
            fechaIngreso: formatSenateDate(rawDate),
            tipo: getTag(descripcion, 'tipo_iniciativa'), // Senate naming
            camaraOrigen: getTag(descripcion, 'camara_origen'),
            tipoIniciativa: getTag(descripcion, 'tipo_iniciativa'),
            estado: getTag(descripcion, 'estado'),
            etapa: getTag(descripcion, 'etapa'),
            urgencia: getTag(descripcion, 'urgencia_actual'),
            subEtapa: getTag(descripcion, 'subetapa'),
            autores: autores
        };

        return proyecto;
    } catch (error) {
        console.error('Error fetching senate proyecto:', error);
        return null;
    }
}

function formatSenateDate(dateStr: string): string {
    // dd/mm/yyyy -> yyyy-mm-dd (ISO)
    if (!dateStr) return new Date().toISOString();
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00Z`;
    }
    return new Date().toISOString();
}

/**
 * Get all bills from a specific year
 */
export async function retornarProyectosLeyXAnno(year: number): Promise<ProyectoLey[]> {
    try {
        const doc = await executeCamaraSoap('retornarProyectosLeyXAnno', `
            <retornarProyectosLeyXAnno xmlns="http://tempuri.org/">
                <prmAnno>${year}</prmAnno>
            </retornarProyectosLeyXAnno>
        `);

        const resultNode = doc.getElementsByTagName('retornarProyectosLeyXAnnoResult')[0];
        const xmlContent = resultNode?.textContent || '';
        return parseProyectosXML(xmlContent);
    } catch (error) {
        console.error('Error fetching proyectos by year:', error);
        throw error;
    }
}

/**
 * Get bill authors
 */
export async function retornarAutoresProyecto(boletin: string): Promise<AutorProyecto[]> {
    try {
        const doc = await executeCamaraSoap('retornarAutoresProyecto', `
            <retornarAutoresProyecto xmlns="http://tempuri.org/">
                <prmBoletin>${boletin}</prmBoletin>
            </retornarAutoresProyecto>
        `);

        const resultNode = doc.getElementsByTagName('retornarAutoresProyectoResult')[0];
        const xmlContent = resultNode?.textContent || '';
        return parseAutoresXML(xmlContent);
    } catch (error) {
        console.error('Error fetching autores:', error);
        return [];
    }
}

/**
 * Get bill tramitación (legislative process timeline)
 */
export async function retornarTramitacionProyecto(boletin: string): Promise<TramitacionEvento[]> {
    try {
        const doc = await executeCamaraSoap('retornarTramitacionProyecto', `
            <retornarTramitacionProyecto xmlns="http://tempuri.org/">
                <prmBoletin>${boletin}</prmBoletin>
            </retornarTramitacionProyecto>
        `);

        const resultNode = doc.getElementsByTagName('retornarTramitacionProyectoResult')[0];
        const xmlContent = resultNode?.textContent || '';
        return parseTramitacionXML(xmlContent);
    } catch (error) {
        console.error('Error fetching tramitacion:', error);
        return [];
    }
}

/**
 * Get legislative matters (materias)
 */
export async function retornarMaterias(): Promise<{ codigo: string; nombre: string }[]> {
    try {
        const doc = await executeCamaraSoap('retornarMaterias', `
            <retornarMaterias xmlns="http://tempuri.org/" />
        `);

        const resultNode = doc.getElementsByTagName('retornarMateriasResult')[0];
        const xmlContent = resultNode?.textContent || '';
        return parseMateriasXML(xmlContent);
    } catch (error) {
        console.error('Error fetching materias:', error);
        return [];
    }
}

// =====================================================
// XML PARSERS
// =====================================================

function parseProyectosXML(xml: string): ProyectoLey[] {
    const proyectos: ProyectoLey[] = [];
    const matches = xml.matchAll(/<Proyecto>([\s\S]*?)<\/Proyecto>/g);

    for (const match of matches) {
        const proyectoXML = match[1];

        proyectos.push({
            id: extractXMLValue(proyectoXML, 'Id'),
            boletin: extractXMLValue(proyectoXML, 'Boletin'),
            titulo: extractXMLValue(proyectoXML, 'Titulo'),
            resumen: extractXMLValue(proyectoXML, 'Resumen'),
            tipo: extractXMLValue(proyectoXML, 'Tipo'),
            camaraOrigen: extractXMLValue(proyectoXML, 'CamaraOrigen'),
            tipoIniciativa: extractXMLValue(proyectoXML, 'TipoIniciativa'),
            estado: extractXMLValue(proyectoXML, 'Estado'),
            etapa: extractXMLValue(proyectoXML, 'Etapa'),
            subEtapa: extractXMLValue(proyectoXML, 'SubEtapa'),
            fechaIngreso: extractXMLValue(proyectoXML, 'FechaIngreso'),
            fechaPublicacion: extractXMLValue(proyectoXML, 'FechaPublicacion'),
            numeroLey: extractXMLValue(proyectoXML, 'NumeroLey'),
            urgencia: extractXMLValue(proyectoXML, 'Urgencia')
        });
    }

    return proyectos;
}

function parseAutoresXML(xml: string): AutorProyecto[] {
    const autores: AutorProyecto[] = [];
    const matches = xml.matchAll(/<Autor>([\s\S]*?)<\/Autor>/g);

    for (const match of matches) {
        const autorXML = match[1];
        autores.push({
            id: extractXMLValue(autorXML, 'Id'),
            nombre: extractXMLValue(autorXML, 'Nombre'),
            partido: extractXMLValue(autorXML, 'Partido')
        });
    }

    return autores;
}

function parseTramitacionXML(xml: string): TramitacionEvento[] {
    const eventos: TramitacionEvento[] = [];
    const matches = xml.matchAll(/<Tramite>([\s\S]*?)<\/Tramite>/g);

    for (const match of matches) {
        const tramiteXML = match[1];
        eventos.push({
            fecha: extractXMLValue(tramiteXML, 'Fecha'),
            descripcion: extractXMLValue(tramiteXML, 'Descripcion'),
            etapa: extractXMLValue(tramiteXML, 'Etapa'),
            camara: extractXMLValue(tramiteXML, 'Camara')
        });
    }

    return eventos;
}

function parseMateriasXML(xml: string): { codigo: string; nombre: string }[] {
    const materias: { codigo: string; nombre: string }[] = [];
    const matches = xml.matchAll(/<Materia>([\s\S]*?)<\/Materia>/g);

    for (const match of matches) {
        const materiaXML = match[1];
        materias.push({
            codigo: extractXMLValue(materiaXML, 'Codigo'),
            nombre: extractXMLValue(materiaXML, 'Nombre')
        });
    }

    return materias;
}

function extractXMLValue(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
}
