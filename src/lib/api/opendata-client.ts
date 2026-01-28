/**
 * API Client for Chilean Congress Open Data
 * Connects to opendata.camara.cl and tramitacion.senado.cl
 */

import { DOMParser } from 'xmldom';

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

    const senadoresNodes = doc.getElementsByTagName('senador');
    const senadores = Array.from(senadoresNodes).map(senador => {
        const getTag = (tag: string) => {
            const elements = senador.getElementsByTagName(tag);
            return elements.length > 0 ? elements[0].textContent || '' : '';
        };

        return {
            id: getTag('PARLID'),
            nombre: getTag('PARLNOMBRE'),
            apellidoPaterno: getTag('PARLAPELLIDOPATERNO'),
            apellidoMaterno: getTag('PARLAPELLIDOMATERNO'),
            partido: getTag('PARTIDO'),
            region: getTag('REGION'),
            circunscripcion: getTag('CIRCUNSCRIPCION'),
            email: getTag('EMAIL'),
            telefono: getTag('FONO'),
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

    const diputadosNodes = doc.getElementsByTagName('Diputado');
    const diputados = Array.from(diputadosNodes).map(diputado => {
        const getTag = (tag: string) => {
            const elements = diputado.getElementsByTagName(tag);
            return elements.length > 0 ? elements[0].textContent || '' : '';
        };

        return {
            id: getTag('Id'),
            nombre: getTag('Nombre'),
            apellidoPaterno: getTag('ApellidoPaterno'),
            apellidoMaterno: getTag('ApellidoMaterno'),
            partido: getTag('Partido'),
            region: getTag('Region'),
            distrito: getTag('Distrito'),
            email: getTag('Email'),
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

    const proyectosNodes = doc.getElementsByTagName('Proyecto');
    const proyectos = Array.from(proyectosNodes).map(proyecto => {
        const getTag = (tag: string) => {
            const elements = proyecto.getElementsByTagName(tag);
            return elements.length > 0 ? elements[0].textContent || '' : '';
        };

        return {
            id: getTag('Id'),
            boletin: getTag('Boletin'),
            titulo: getTag('Titulo'),
            fechaIngreso: getTag('FechaIngreso'),
            etapa: getTag('Etapa'),
            subEtapa: getTag('SubEtapa'),
            urgencia: getTag('Urgencia'),
            camara: getTag('Camara'),
            iniciativa: getTag('Iniciativa'),
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

    const tramitesNodes = doc.getElementsByTagName('TRAMITE');
    const tramites = Array.from(tramitesNodes).map(tramite => {
        const getTag = (tag: string) => {
            const elements = tramite.getElementsByTagName(tag);
            return elements.length > 0 ? elements[0].textContent || '' : '';
        };

        return {
            fecha: getTag('FECHA'),
            camara: getTag('CAMARA'),
            etapa: getTag('ETAPA'),
            descripcion: getTag('DESCRIPCION'),
            sesion: getTag('SESION'),
        };
    });

    return tramites;
}
