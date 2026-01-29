import soap from 'soap';

const CAMARA_WSDL_URL = 'https://opendata.camara.cl/wscamaradiputados.asmx?WSDL';

/**
 * OpenData API Client for Bills (Proyectos de Ley)
 */

export interface ProyectoLey {
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
 * Get bill by bulletin number
 */
export async function retornarProyectoLey(boletin: string): Promise<ProyectoLey | null> {
    try {
        const client = await soap.createClientAsync(CAMARA_WSDL_URL);
        const [result] = await client.retornarProyectoLeyAsync({ prmBoletin: boletin });

        const proyectoXML = result.retornarProyectoLeyResult;
        const proyectos = parseProyectosXML(proyectoXML);
        return proyectos[0] || null;
    } catch (error) {
        console.error('Error fetching proyecto:', error);
        throw error;
    }
}

/**
 * Get all bills from a specific year
 */
export async function retornarProyectosLeyXAnno(year: number): Promise<ProyectoLey[]> {
    try {
        const client = await soap.createClientAsync(CAMARA_WSDL_URL);
        const [result] = await client.retornarProyectosLeyXAnnoAsync({ prmAnno: year });

        const proyectosXML = result.retornarProyectosLeyXAnnoResult;
        return parseProyectosXML(proyectosXML);
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
        const client = await soap.createClientAsync(CAMARA_WSDL_URL);
        const [result] = await client.retornarAutoresProyectoAsync({ prmBoletin: boletin });

        const autoresXML = result.retornarAutoresProyectoResult;
        return parseAutoresXML(autoresXML);
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
        const client = await soap.createClientAsync(CAMARA_WSDL_URL);
        const [result] = await client.retornarTramitacionProyectoAsync({ prmBoletin: boletin });

        const tramitacionXML = result.retornarTramitacionProyectoResult;
        return parseTramitacionXML(tramitacionXML);
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
        const client = await soap.createClientAsync(CAMARA_WSDL_URL);
        const [result] = await client.retornarMateriasAsync({});

        const materiasXML = result.retornarMateriasResult;
        return parseMateriasXML(materiasXML);
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
    const matches = xml.matchAll(/<Proyecto>(.*?)<\/Proyecto>/gs);

    for (const match of matches) {
        const proyectoXML = match[1];

        proyectos.push({
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
    const matches = xml.matchAll(/<Autor>(.*?)<\/Autor>/gs);

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
    const matches = xml.matchAll(/<Tramite>(.*?)<\/Tramite>/gs);

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
    const matches = xml.matchAll(/<Materia>(.*?)<\/Materia>/gs);

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
    const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`, 's');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
}
