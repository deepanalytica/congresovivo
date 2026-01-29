import soap from 'soap';

const CAMARA_WSDL_URL = 'https://opendata.camara.cl/wscamaradiputados.asmx?WSDL';

/**
 * OpenData API Client for Committees (Comisiones)
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
 * Get all active committees
 */
export async function retornarComisionesVigentes(): Promise<Comision[]> {
    try {
        const client = await soap.createClientAsync(CAMARA_WSDL_URL);
        const [result] = await client.retornarComisionesVigentesAsync({});

        const comisionesXML = result.retornarComisionesVigentesResult;
        const comisiones = parseComisionesXML(comisionesXML);
        return comisiones;
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
        const client = await soap.createClientAsync(CAMARA_WSDL_URL);
        const [result] = await client.retornarComisionAsync({ prmComisionId: comisionId });

        const comisionXML = result.retornarComisionResult;
        const comisiones = parseComisionesXML(comisionXML);
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
        const client = await soap.createClientAsync(CAMARA_WSDL_URL);
        const [result] = await client.retornarSesionesXComisionYAnnoAsync({
            prmComisionId: comisionId,
            prmAnno: year
        });

        const sesionesXML = result.retornarSesionesXComisionYAnnoResult;
        const sesiones = parseSesionesXML(sesionesXML, comisionId);
        return sesiones;
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
        const client = await soap.createClientAsync(CAMARA_WSDL_URL);
        const [result] = await client.retornarComisionesXPeriodoAsync({ prmPeriodoId: periodoId });

        const comisionesXML = result.retornarComisionesXPeriodoResult;
        const comisiones = parseComisionesXML(comisionesXML);
        return comisiones;
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
    const matches = xml.matchAll(/<Comision>(.*?)<\/Comision>/gs);

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
    const matches = xml.matchAll(/<Sesion>(.*?)<\/Sesion>/gs);

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
    const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`, 's');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
}
