/**
 * TypeScript Types - Congreso Vivo
 * Domain types for the Chilean legislative system
 */

// ============================================
// Core Legislature Types
// ============================================

export type Chamber = 'camara' | 'senado'

export type LegislativeStage =
    | 'ingreso'
    | 'comision'
    | 'sala'
    | 'segundo_tramite'
    | 'comision_mixta'
    | 'tribunal_constitucional'
    | 'aprobado'
    | 'promulgado'
    | 'publicado'
    | 'rechazado'
    | 'archivado'

export type UrgencyLevel = 'sin' | 'simple' | 'suma' | 'inmediata'

export type VoteType = 'a_favor' | 'contra' | 'abstencion' | 'ausente' | 'pareo'

export type PoliticalIdeology =
    | 'left'
    | 'centerLeft'
    | 'center'
    | 'centerRight'
    | 'right'
    | 'independent'

// ============================================
// Bill (Proyecto de Ley)
// ============================================

export interface Bill {
    id: string
    boletin: string // e.g. "12345-07"
    titulo: string
    resumen?: string
    estado: LegislativeStage
    camaraOrigen: Chamber
    urgencia: UrgencyLevel
    autores: string[] // IDs de parlamentarios
    fechaIngreso: Date
    fechaUltimaModificacion: Date
    materias: string[] // Temas/tags
    etapaActual: string
    tramitacionLink: string // URL a opendata

    // Metadata
    tipo: 'mocion' | 'mensaje' | 'mensaje_mocion'
    ley?: string // Número de ley si fue aprobado
    iniciativa: 'ejecutivo' | 'parlamentaria' | 'mixta'
}

export interface BillEvent {
    id: string
    billId: string
    tipo: 'ingreso' | 'comision' | 'sala' | 'votacion' | 'indicacion' | 'informe' | 'oficio' | 'otro'
    fecha: Date
    descripcion: string
    camara: Chamber
    documentos: BillDocument[]
    metadata?: Record<string, any>
}

export interface BillDocument {
    id: string
    tipo: 'proyecto' | 'indicacion' | 'informe' | 'oficio' | 'votacion' | 'otro'
    titulo: string
    url: string
    fecha: Date
}

// ============================================
// Voting (Votaciones)
// ============================================

export interface Vote {
    id: string
    billId: string
    boletin: string
    fecha: Date
    camara: Chamber
    sesion: string
    tipo: 'sala' | 'comision'
    materia: string
    resultado: 'aprobado' | 'rechazado' | 'empate'
    quorum: string // e.g. "Mayoría simple", "2/3"

    // Resultados agregados
    aFavor: number
    contra: number
    abstenciones: number
    ausentes: number
    pareos: number

    // Detalle de votos
    rollCall: VoteRollCall[]
}

export interface VoteRollCall {
    parlamentarioId: string
    parlamentarioNombre: string
    partido: string
    voto: VoteType
}

// ============================================
// Parliamentarian (Parlamentario)
// ============================================

export interface Parliamentarian {
    id: string
    nombre: string
    apellidoPaterno: string
    apellidoMaterno: string
    nombreCompleto: string

    // Political affiliation
    partido: string
    coalicion?: string
    ideologia: PoliticalIdeology // Calculado a partir del partido

    // Chamber info
    camara: Chamber
    region: string
    circunscripcion?: string // For senadores
    distrito?: number // For diputados

    // Contact
    email?: string
    telefono?: string
    curriculumUrl?: string

    // Period
    periodoInicio: Date
    periodoFin?: Date
    vigente: boolean
}

// Para análisis visual por bancada
export interface PoliticalBlock {
    id: string
    nombre: string
    ideologia: PoliticalIdeology
    partidos: string[]
    parlamentarios: Parliamentarian[]
    color: string
}

// ============================================
// Session (Sesión de Sala)
// ============================================

export interface Session {
    id: string
    camara: Chamber
    numero: number
    legislatura: number
    tipo: 'ordinaria' | 'extraordinaria' | 'especial'
    fecha: Date
    horaInicio?: string
    horaTermino?: string
    estado: 'programada' | 'en_curso' | 'finalizada' | 'suspendida'

    // Content
    tabla: SessionAgendaItem[]
    asistencia?: {
        presentes: number
        ausentes: number
        justificados: number
    }

    // Links
    diarioSesionUrl?: string
    videolUrl?: string
}

export interface SessionAgendaItem {
    orden: number
    materia: string
    boletin?: string
    tipo: 'proyecto' | 'acuerdo' | 'comunicacion' | 'incidente' | 'otro'
    discusion?: boolean
    votacion?: boolean
}

// ============================================
// Committee (Comisión)
// ============================================

export interface Committee {
    id: string
    nombre: string
    tipo: 'permanente' | 'especial' | 'investigadora' | 'mixta'
    camara: Chamber | 'mixta'

    // Members
    miembros: CommitteeMember[]
    presidente?: string // parlamentarioId
    vicepresidente?: string

    // Activity
    proyectosEnTramitacion: string[] // billIds
    ultimaSesion?: Date
    vigente: boolean
}

export interface CommitteeMember {
    parlamentarioId: string
    rol: 'presidente' | 'vicepresidente' | 'secretario' | 'integrante'
    fechaIngreso: Date
    fechaSalida?: Date
}

// ============================================
// Activity Feed (for Radar Semanal)
// ============================================

export interface LegislativeActivity {
    id: string
    tipo: 'bill_update' | 'vote' | 'session' | 'committee_meeting'
    fecha: Date
    titulo: string
    descripcion: string
    entidad: {
        tipo: 'bill' | 'vote' | 'session' | 'committee'
        id: string
        nombre: string
    }
    relevancia: 'alta' | 'media' | 'baja' // Para ordenar en el feed
}

// ============================================
// Stats & Metrics
// ============================================

export interface LegislativeStats {
    totalProyectos: number
    proyectosActivos: number
    proyectosAprobados: number
    proyectosRechazados: number
    proyectosArchivados: number

    votacionesSemana: number
    sesionesProgramadas: number
    comisionesActivas: number

    // Por cámara
    camaraStats: {
        camara: Chamber
        proyectos: number
        sesiones: number
    }[]
}

// ============================================
// Metro Map (for visualization)
// ============================================

export interface MetroMapStation {
    id: string
    nombre: string
    tipo: LegislativeStage
    alcanzado: boolean
    activo: boolean
    fecha?: Date
    duracion?: number // días
    eventos: BillEvent[]
}

export interface MetroMapTrack {
    billId: string
    estaciones: MetroMapStation[]
    color: string
    grosor: number // basado en momentum
    estado: 'activo' | 'estancado' | 'completado' | 'archivado'
}
