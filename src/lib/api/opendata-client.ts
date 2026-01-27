/**
 * API Client for Chilean Congress Open Data
 * Connects to opendata.camara.cl and tramitacion.senado.cl
 */

const CAMARA_BASE_URL = 'https://opendata.camara.cl';
const SENADO_BASE_URL = 'https://tramitacion.senado.cl/wspublico';

/**
 * Parse XML string to Document
 */
export function parseXML(xmlString: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(xmlString, 'text/xml');
}

/**
 * Fetch and parse XML from URL
 */
export async function fetchXML(url: string): Promise<Document> {
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/xml, text/xml',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    return parseXML(xmlText);
}

/**
 * Get current senators from Senado API
 */
export async function getSenadores() {
    const url = `${SENADO_BASE_URL}/senadores_vigentes.php`;
    const doc = await fetchXML(url);

    const senadores = Array.from(doc.querySelectorAll('SENADOR')).map(senador => {
        const getId = (tag: string) => senador.querySelector(tag)?.textContent || '';

        return {
            id: getId('ID'),
            nombre: getId('NOMBRE'),
            apellidoPaterno: getId('APELLIDO_PATERNO'),
            apellidoMaterno: getId('APELLIDO_MATERNO'),
            partido: getId('PARTIDO'),
            region: getId('REGION'),
            circunscripcion: getId('CIRCUNSCRIPCION'),
            email: getId('EMAIL'),
            telefono: getId('TELEFONO'),
        };
    });

    return senadores;
}

/**
 * Get current deputies from Cámara API (SOAP)
 */
export async function getDiputados() {
    // The SOAP endpoint requires a POST with envelope
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getDiputados_Vigentes xmlns="http://opendata.camara.cl/" />
  </soap:Body>
</soap:Envelope>`;

    const response = await fetch(`${CAMARA_BASE_URL}/wscamaradiputados.asmx`, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://opendata.camara.cl/getDiputados_Vigentes',
        },
        body: soapEnvelope,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const doc = parseXML(xmlText);

    const diputados = Array.from(doc.querySelectorAll('Diputado')).map(diputado => {
        const getId = (tag: string) => diputado.querySelector(tag)?.textContent || '';

        return {
            id: getId('Id'),
            nombre: getId('Nombre'),
            apellidoPaterno: getId('ApellidoPaterno'),
            apellidoMaterno: getId('ApellidoMaterno'),
            partido: getId('Partido'),
            region: getId('Region'),
            distrito: getId('Distrito'),
            email: getId('Email'),
        };
    });

    return diputados;
}

/**
 * Get legislative projects from Cámara API
 */
export async function getProyectosLey() {
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getProyectos_Ley xmlns="http://opendata.camara.cl/">
      <fechaInicio>2024-01-01</fechaInicio>
      <fechaTermino>2026-12-31</fechaTermino>
    </getProyectos_Ley>
  </soap:Body>
</soap:Envelope>`;

    const response = await fetch(`${CAMARA_BASE_URL}/wscamaradiputados.asmx`, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://opendata.camara.cl/getProyectos_Ley',
        },
        body: soapEnvelope,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const doc = parseXML(xmlText);

    const proyectos = Array.from(doc.querySelectorAll('Proyecto')).map(proyecto => {
        const getId = (tag: string) => proyecto.querySelector(tag)?.textContent || '';

        return {
            id: getId('Id'),
            boletin: getId('Boletin'),
            titulo: getId('Titulo'),
            fechaIngreso: getId('FechaIngreso'),
            etapa: getId('Etapa'),
            subEtapa: getId('SubEtapa'),
            urgencia: getId('Urgencia'),
            camara: getId('Camara'),
            iniciativa: getId('Iniciativa'),
        };
    });

    return proyectos;
}

/**
 * Get project tramitación from Senado API
 */
export async function getTramitacion(boletin: string) {
    const url = `${SENADO_BASE_URL}/tramitacion.php?boletin=${boletin}`;
    const doc = await fetchXML(url);

    const tramites = Array.from(doc.querySelectorAll('TRAMITE')).map(tramite => {
        const getId = (tag: string) => tramite.querySelector(tag)?.textContent || '';

        return {
            fecha: getId('FECHA'),
            camara: getId('CAMARA'),
            etapa: getId('ETAPA'),
            descripcion: getId('DESCRIPCION'),
            sesion: getId('SESION'),
        };
    });

    return tramites;
}
