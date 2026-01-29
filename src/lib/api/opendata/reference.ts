import soap from 'soap';

const CAMARA_WSDL_URL = 'https://opendata.camara.cl/wscamaradiputados.asmx?WSDL';

/**
 * OpenData API Client for Chilean Chamber of Deputies
 * Based on https://www.camara.cl/transparencia/datosAbiertos.aspx
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
 * Get all electoral districts (28 total)
 */
export async function retornarDistritos(): Promise<Distrito[]> {
    try {
        const client = await soap.createClientAsync(CAMARA_WSDL_URL);
        const [result] = await client.retornarDistritosAsync({});

        const distritosXML = result.retornarDistritosResult;
        // Parse XML to extract distrito data
        const distritos = parseDistritosXML(distritosXML);
        return distritos;
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
        const client = await soap.createClientAsync(CAMARA_WSDL_URL);
        const [result] = await client.retornarRegionesAsync({});

        const regionesXML = result.retornarRegionesResult;
        const regiones = parseRegionesXML(regionesXML);
        return regiones;
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
        const client = await soap.createClientAsync(CAMARA_WSDL_URL);
        const [result] = await client.retornarComunasAsync({});

        const comunasXML = result.retornarComunasResult;
        const comunas = parseComunasXML(comunasXML);
        return comunas;
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
        const client = await soap.createClientAsync(CAMARA_WSDL_URL);
        const [result] = await client.retornarProvinciasAsync({});

        const provinciasXML = result.retornarProvinciasResult;
        const provincias = parseProvinciasXML(provinciasXML);
        return provincias;
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
        const client = await soap.createClientAsync(CAMARA_WSDL_URL);
        const [result] = await client.retornarMinisteriosAsync({});

        const ministeriosXML = result.retornarMinisteriosResult;
        const ministerios = parseMinisteriosXML(ministeriosXML);
        return ministerios;
    } catch (error) {
        console.error('Error fetching ministerios:', error);
        throw error;
    }
}

// =====================================================
// XML PARSERS
// =====================================================

function parseDistritosXML(xml: string): Distrito[] {
    // Simple XML parsing - adjust based on actual structure
    const distritos: Distrito[] = [];
    const matches = xml.matchAll(/<Distrito>(.*?)<\/Distrito>/gs);

    for (const match of matches) {
        const distritoXML = match[1];
        const codigo = extractXMLValue(distritoXML, 'Codigo');
        const nombre = extractXMLValue(distritoXML, 'Nombre');
        const diputados = parseInt(extractXMLValue(distritoXML, 'NumeroDiputados') || '0');

        distritos.push({ codigo, nombre, diputados });
    }

    return distritos;
}

function parseRegionesXML(xml: string): Region[] {
    const regiones: Region[] = [];
    const matches = xml.matchAll(/<Region>(.*?)<\/Region>/gs);

    for (const match of matches) {
        const regionXML = match[1];
        const codigo = extractXMLValue(regionXML, 'Codigo');
        const nombre = extractXMLValue(regionXML, 'Nombre');

        regiones.push({ codigo, nombre });
    }

    return regiones;
}

function parseComunasXML(xml: string): Comuna[] {
    const comunas: Comuna[] = [];
    const matches = xml.matchAll(/<Comuna>(.*?)<\/Comuna>/gs);

    for (const match of matches) {
        const comunaXML = match[1];
        const codigo = extractXMLValue(comunaXML, 'Codigo');
        const nombre = extractXMLValue(comunaXML, 'Nombre');
        const provincia = extractXMLValue(comunaXML, 'Provincia');
        const region = extractXMLValue(comunaXML, 'Region');

        comunas.push({ codigo, nombre, provincia, region });
    }

    return comunas;
}

function parseProvinciasXML(xml: string): Provincia[] {
    const provincias: Provincia[] = [];
    const matches = xml.matchAll(/<Provincia>(.*?)<\/Provincia>/gs);

    for (const match of matches) {
        const provinciaXML = match[1];
        const codigo = extractXMLValue(provinciaXML, 'Codigo');
        const nombre = extractXMLValue(provinciaXML, 'Nombre');
        const region = extractXMLValue(provinciaXML, 'Region');

        provincias.push({ codigo, nombre, region });
    }

    return provincias;
}

function parseMinisteriosXML(xml: string): Ministerio[] {
    const ministerios: Ministerio[] = [];
    const matches = xml.matchAll(/<Ministerio>(.*?)<\/Ministerio>/gs);

    for (const match of matches) {
        const ministerioXML = match[1];
        const codigo = extractXMLValue(ministerioXML, 'Codigo');
        const nombre = extractXMLValue(ministerioXML, 'Nombre');

        ministerios.push({ codigo, nombre });
    }

    return ministerios;
}

/**
 * Extract value from XML tag
 */
function extractXMLValue(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`, 's');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
}
