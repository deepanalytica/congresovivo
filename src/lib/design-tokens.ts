/**
 * Design Tokens - Congreso Vivo
 * Sistema de tokens semánticos para el dashboard legislativo
 */

export const colors = {
    // Estados del trámite legislativo
    legislativeStages: {
        ingreso: { bg: '#3B82F6', text: '#FFFFFF', label: 'Ingreso' },
        comision: { bg: '#F59E0B', text: '#000000', label: 'Comisión' },
        sala: { bg: '#8B5CF6', text: '#FFFFFF', label: 'Sala' },
        segundoTramite: { bg: '#06B6D4', text: '#FFFFFF', label: '2º Trámite' },
        comisionMixta: { bg: '#EC4899', text: '#FFFFFF', label: 'C. Mixta' },
        aprobado: { bg: '#10B981', text: '#FFFFFF', label: 'Aprobado' },
        promulgado: { bg: '#059669', text: '#FFFFFF', label: 'Promulgado' },
        rechazado: { bg: '#EF4444', text: '#FFFFFF', label: 'Rechazado' },
        archivado: { bg: '#6B7280', text: '#FFFFFF', label: 'Archivado' },
    },

    // Niveles de urgencia
    urgencyLevels: {
        sin: { bg: '#E5E7EB', text: '#374151', label: 'Sin urgencia' },
        simple: { bg: '#FBBF24', text: '#78350F', label: 'Simple' },
        suma: { bg: '#F97316', text: '#FFFFFF', label: 'Suma' },
        inmediata: { bg: '#DC2626', text: '#FFFFFF', label: 'Discusión inmediata' },
    },

    // Cámaras
    chambers: {
        camara: { bg: '#006400', text: '#FFFFFF', label: 'Cámara de Diputados' },
        senado: { bg: '#8B0000', text: '#FFFFFF', label: 'Senado' },
    },

    // Espectro político (ideología)
    politicalSpectrum: {
        left: { bg: '#E11D48', text: '#FFFFFF', label: 'Izquierda' },
        centerLeft: { bg: '#F43F5E', text: '#FFFFFF', label: 'Centro-Izquierda' },
        center: { bg: '#8B5CF6', text: '#FFFFFF', label: 'Centro' },
        centerRight: { bg: '#3B82F6', text: '#FFFFFF', label: 'Centro-Derecha' },
        right: { bg: '#0EA5E9', text: '#FFFFFF', label: 'Derecha' },
        independent: { bg: '#6B7280', text: '#FFFFFF', label: 'Independiente' },
    },
}

/**
 * Mapeo de partidos políticos chilenos a ideología
 * Basado en datos históricos y posicionamiento actual
 */
export const partyToIdeology: Record<string, keyof typeof colors.politicalSpectrum> = {
    // Izquierda
    'P.C': 'left', // Partido Comunista
    'F.R.E.V.S.': 'left', // Frente Regionalista Verde Social

    // Centro-Izquierda
    'P.S.': 'centerLeft', // Partido Socialista
    'P.P.D.': 'centerLeft', // Partido por la Democracia
    'Revolución Democrática': 'centerLeft',
    'P.L.': 'centerLeft', // Partido Liberal

    // Centro
    'P.D.C.': 'center', // Partido Demócrata Cristiano
    'Demócratas': 'center',
    'Partido Radical': 'center',
    'Social Cristiano': 'center',

    // Centro-Derecha
    'Evópoli': 'centerRight',

    // Derecha
    'R.N.': 'right', // Renovación Nacional
    'U.D.I.': 'right', // Unión Demócrata Independiente
    'Partido Republicano': 'right',

    // Independientes
    'Independiente': 'independent',
}

/**
 * Obtiene el color de un partido político según su ideología
 */
export function getPartyColor(partido: string): { bg: string; text: string; label: string } {
    const ideology = partyToIdeology[partido] || 'independent'
    return colors.politicalSpectrum[ideology]
}

/**
 * Obtiene el label de ideología de un partido
 */
export function getPartyIdeology(partido: string): string {
    const ideology = partyToIdeology[partido] || 'independent'
    return colors.politicalSpectrum[ideology].label
}

export const typography = {
    fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    },
}

export const spacing = {
    section: '4rem',
    card: '1.5rem',
    element: '1rem',
}
