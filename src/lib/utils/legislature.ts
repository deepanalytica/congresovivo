import type { LegislativeStage, UrgencyLevel } from '@/types/legislature'
import { colors } from '@/lib/design-tokens'

/**
 * Get color for a legislative stage
 */
export function getBillStageColor(stage: LegislativeStage): { bg: string; text: string } {
    const stageColors = colors.legislativeStages
    switch (stage) {
        case 'ingreso':
            return { bg: stageColors.ingreso.bg, text: stageColors.ingreso.text }
        case 'comision':
            return { bg: stageColors.comision.bg, text: stageColors.comision.text }
        case 'sala':
            return { bg: stageColors.sala.bg, text: stageColors.sala.text }
        case 'segundo_tramite':
            return { bg: stageColors.segundoTramite.bg, text: stageColors.segundoTramite.text }
        case 'comision_mixta':
            return { bg: stageColors.comisionMixta.bg, text: stageColors.comisionMixta.text }
        case 'aprobado':
            return { bg: stageColors.aprobado.bg, text: stageColors.aprobado.text }
        case 'promulgado':
            return { bg: stageColors.promulgado.bg, text: stageColors.promulgado.text }
        case 'rechazado':
            return { bg: stageColors.rechazado.bg, text: stageColors.rechazado.text }
        case 'archivado':
            return { bg: stageColors.archivado.bg, text: stageColors.archivado.text }
        default:
            return { bg: '#6B7280', text: '#FFFFFF' }
    }
}

/**
 * Get color for an urgency level
 */
export function getUrgencyColor(urgency: UrgencyLevel): { bg: string; text: string } {
    const urgencyColors = colors.urgencyLevels
    switch (urgency) {
        case 'sin':
            return { bg: urgencyColors.sin.bg, text: urgencyColors.sin.text }
        case 'simple':
            return { bg: urgencyColors.simple.bg, text: urgencyColors.simple.text }
        case 'suma':
            return { bg: urgencyColors.suma.bg, text: urgencyColors.suma.text }
        case 'inmediata':
            return { bg: urgencyColors.inmediata.bg, text: urgencyColors.inmediata.text }
        default:
            return { bg: '#E5E7EB', text: '#374151' }
    }
}

/**
 * Get label for a legislative stage
 */
export function getBillStageLabel(stage: LegislativeStage): string {
    const labels: Record<LegislativeStage, string> = {
        ingreso: colors.legislativeStages.ingreso.label,
        comision: colors.legislativeStages.comision.label,
        sala: colors.legislativeStages.sala.label,
        segundo_tramite: colors.legislativeStages.segundoTramite.label,
        comision_mixta: colors.legislativeStages.comisionMixta.label,
        tribunal_constitucional: 'Tribunal Constitucional',
        aprobado: colors.legislativeStages.aprobado.label,
        promulgado: colors.legislativeStages.promulgado.label,
        publicado: 'Publicado',
        rechazado: colors.legislativeStages.rechazado.label,
        archivado: colors.legislativeStages.archivado.label,
    }
    return labels[stage] || stage
}


/**
 * Get label for an urgency level
 */
export function getUrgencyLabel(urgency: UrgencyLevel): string {
    return colors.urgencyLevels[urgency]?.label || urgency
}

/**
 * Calculate "momentum" score for a bill based on recent activity
 * Returns a number 0-100
 */
export function calculateMomentum(lastModified: Date | string): number {
    // Convert string to Date if needed
    const lastModifiedDate = typeof lastModified === 'string' ? new Date(lastModified) : lastModified;

    // Validate date
    if (!lastModifiedDate || isNaN(lastModifiedDate.getTime())) {
        return 10; // Default low momentum for invalid dates
    }

    const now = new Date()
    const daysSinceModification = Math.floor(
        (now.getTime() - lastModifiedDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceModification === 0) return 100 // Modificado hoy
    if (daysSinceModification <= 2) return 85   // Últimos 2 días
    if (daysSinceModification <= 7) return 60   // Última semana
    if (daysSinceModification <= 30) return 30  // Último mes
    return 10 // Estancado
}

/**
 * Determine if a bill is "stalled" (>30 days without updates)
 */
export function isBillStalled(lastModified: Date): boolean {
    const daysSinceModification = Math.floor(
        (new Date().getTime() - lastModified.getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSinceModification > 30
}
