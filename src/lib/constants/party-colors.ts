/**
 * Party colors for political visualization
 */
export const PARTY_COLORS: Record<string, string> = {
    // Left
    'PC': '#E53E3E',        // Communist - Red
    'PS': '#E53E3E',        // Socialist - Red
    'FA': '#9F7AEA',        // Frente Amplio - Purple
    'RD': '#9F7AEA',        // Revolución Democrática - Purple
    'CS': '#9F7AEA',        // Comunes - Purple

    // Center-Left
    'PPD': '#F56565',       // PPD - Light Red
    'DC': '#F6AD55',        // Christian Democrat - Orange
    'PDC': '#F6AD55',       // Christian Democrat - Orange
    'PR': '#F6AD55',        // Radical - Orange
    'LIBERAL': '#F6AD55',   // Liberal - Orange

    // Center
    'IND': '#A0AEC0',       // Independent - Gray

    // Center-Right
    'RN': '#4299E1',        // National Renovation - Blue
    'EVOPOLI': '#4299E1',   // Evopoli - Blue
    'PNL': '#4299E1',       // Partido de la Gente - Blue
    'PDG': '#4299E1',       // Partido de la Gente - Blue
    'PSC': '#4299E1',       // Social Christian - Blue

    // Right
    'UDI': '#2B6CB0',       // UDI - Dark Blue
    'PREP': '#2B6CB0',      // Republican - Dark Blue
    'REP': '#2B6CB0',       // Republican - Dark Blue
    'REPUBLICANO': '#2B6CB0', // Republican - Dark Blue

    // Default
    'DEFAULT': '#718096'    // Gray
};

/**
 * Get color for a party
 */
export function getPartyColor(partido: string | null | undefined): string {
    if (!partido) return PARTY_COLORS.DEFAULT;

    const normalized = partido.toUpperCase().trim();

    // Direct match
    if (PARTY_COLORS[normalized]) {
        return PARTY_COLORS[normalized];
    }

    // Partial match
    for (const [key, color] of Object.entries(PARTY_COLORS)) {
        if (normalized.includes(key)) {
            return color;
        }
    }

    return PARTY_COLORS.DEFAULT;
}

/**
 * Get ideology from party
 */
export function getIdeologyFromParty(partido: string | null | undefined): string {
    if (!partido) return 'Independiente';

    const normalized = partido.toUpperCase().trim();

    if (['PC', 'PS', 'FA', 'RD', 'CS'].some(p => normalized.includes(p))) {
        return 'Izquierda';
    }
    if (['PPD', 'DC', 'PDC', 'PR', 'LIBERAL'].some(p => normalized.includes(p))) {
        return 'Centro-Izquierda';
    }
    if (['RN', 'EVOPOLI', 'PNL', 'PDG', 'PSC'].some(p => normalized.includes(p))) {
        return 'Centro-Derecha';
    }
    if (['UDI', 'PREP', 'REP', 'REPUBLICANO'].some(p => normalized.includes(p))) {
        return 'Derecha';
    }

    return 'Independiente';
}
