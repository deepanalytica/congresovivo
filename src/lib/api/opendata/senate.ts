
import { DOMParser } from 'xmldom';

const SENADO_BASE_URL = 'https://tramitacion.senado.cl/wspublico';

export interface SenateVote {
    id: string;
    boletin: string | null;
    fecha: string;
    descripcion: string;
    resultado: string | null;
    total_si: number;
    total_no: number;
    total_abst: number;
    total_pareo: number;
}

/**
 * Fetch and parse XML from URL
 */
async function fetchXML(url: string): Promise<Document> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const xmlText = await response.text();
    const parser = new DOMParser();
    return parser.parseFromString(xmlText, 'text/xml');
}

function extractTag(parent: Element | Document, tag: string): string {
    const elements = parent.getElementsByTagName(tag);
    return elements.length > 0 ? elements[0].textContent || '' : '';
}

/**
 * Get recent Senate votes
 * Endpoint: votaciones.php
 */
export async function retornarVotacionesSenate(): Promise<SenateVote[]> {
    try {
        const doc = await fetchXML(`${SENADO_BASE_URL}/votaciones.php`);
        const votes: SenateVote[] = [];

        const voteNodes = doc.getElementsByTagName('votacion');

        Array.from(voteNodes).forEach(node => {
            const descripcion = extractTag(node, 'MATERIA') || extractTag(node, 'TIPOVOTACION');
            const fechaRaw = extractTag(node, 'FECHA'); // dd/mm/yyyy
            // Parse date
            let fecha = new Date().toISOString();
            if (fechaRaw) {
                const parts = fechaRaw.split('/');
                if (parts.length === 3) fecha = `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00Z`;
            }

            const id = extractTag(node, 'IDVOTACION') || `SEN-${new Date(fecha).getTime()}`;
            const boletin = extractTag(node, 'BOLETIN'); // check if exists

            votes.push({
                id,
                boletin: boletin || null,
                fecha,
                descripcion: descripcion.substring(0, 300),
                resultado: null, // Senate XML doesn't always have explicit "Approved" tag in summary
                total_si: parseInt(extractTag(node, 'TOTALSI') || '0'),
                total_no: parseInt(extractTag(node, 'TOTALNO') || '0'),
                total_abst: parseInt(extractTag(node, 'TOTALABSTENCION') || '0'),
                total_pareo: parseInt(extractTag(node, 'TOTALPAREO') || '0'),
            });
        });

        return votes;
    } catch (e) {
        console.error('Error fetching Senate votes:', e);
        return [];
    }
}
