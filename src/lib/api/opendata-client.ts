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
    <getDiputados_Vigentes xmlns="http://tempuri.org/" />
  </soap:Body>
</soap:Envelope>`;

    const response = await fetch(`${CAMARA_BASE_URL}/wscamaradiputados.asmx`, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://tempuri.org/getDiputados_Vigentes',
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
            id: getTag('DIPID') || getTag('Id'), // Support both just in case
            nombre: getTag('Nombre'),
            apellidoPaterno: getTag('Apellido_Paterno'),
            apellidoMaterno: getTag('Apellido_Materno'),
            partido: getTag('Militancia_Actual'), // This might need nested parsing but let's see
            region: getTag('Region'),
            distrito: getTag('Distrito'),
            email: getTag('Correo_Electronico'),
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
    <getProyectos_Ley xmlns="http://tempuri.org/">
      <fechaInicio>2024-01-01</fechaInicio>
      <fechaTermino>2026-12-31</fechaTermino>
    </getProyectos_Ley>
  </soap:Body>
</soap:Envelope>`;

    const response = await fetch(`${CAMARA_BASE_URL}/wscamaradiputados.asmx`, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://tempuri.org/getProyectos_Ley',
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
 * Get detailed individual votes for a specific session ID
 */
export async function getVotacionDetalle(idVotacion: string) {
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getVotacion_Detalle xmlns="http://tempuri.org/">
      <prmVotacionID>${idVotacion}</prmVotacionID>
    </getVotacion_Detalle>
  </soap:Body>
</soap:Envelope>`;

    const response = await fetch(`${CAMARA_BASE_URL}/wscamaradiputados.asmx`, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://tempuri.org/getVotacion_Detalle',
        },
        body: soapEnvelope,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const doc = parseXML(xmlText);

    const votosNodes = doc.getElementsByTagName('Voto');
    const votos = Array.from(votosNodes).map(votoNode => {
        const diputadoNode = votoNode.getElementsByTagName('Diputado')[0];
        const getDipuTag = (tag: string) => {
            if (!diputadoNode) return '';
            const elements = diputadoNode.getElementsByTagName(tag);
            return elements.length > 0 ? elements[0].textContent || '' : '';
        };

        const opcionNode = votoNode.getElementsByTagName('Opcion')[0];
        const opcionValue = opcionNode ? (opcionNode.textContent || '') : '';

        return {
            parliamentarianId: getDipuTag('DIPID'),
            opcion: opcionValue,
        };
    });

    return votos;
}

/**
 * Get voting sessions for a specific bulletin
 */
export async function getVotaciones_Boletin(boletin: string) {
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getVotaciones_Boletin xmlns="http://tempuri.org/">
      <prmBoletin>${boletin}</prmBoletin>
    </getVotaciones_Boletin>
  </soap:Body>
</soap:Envelope>`;

    const response = await fetch(`${CAMARA_BASE_URL}/wscamaradiputados.asmx`, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://tempuri.org/getVotaciones_Boletin',
        },
        body: soapEnvelope,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const doc = parseXML(xmlText);

    const votacionesNodes = doc.getElementsByTagName('Votacion');
    const votaciones = Array.from(votacionesNodes).map(votNode => {
        const getTag = (tag: string) => {
            const elements = votNode.getElementsByTagName(tag);
            return elements.length > 0 ? elements[0].textContent || '' : '';
        };

        return {
            id: getTag('ID'),
            boletin: getTag('Boletin'),
            fecha: getTag('Fecha'),
            resultado: getTag('Resultado'),
            aFavor: getTag('TotalAfirmativos'),
            enContra: getTag('TotalNegativos'),
            abstencion: getTag('TotalAbstenciones'),
            ausente: getTag('TotalDispensados'),
        };
    });

    return votaciones;
}
