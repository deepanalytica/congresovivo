/**
 * Database TypeScript Types
 * Auto-generated types for Supabase tables
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            parliamentarians: {
                Row: {
                    id: string
                    external_id: string
                    nombre: string
                    apellido_paterno: string
                    apellido_materno: string
                    nombre_completo: string
                    partido: string
                    ideologia: string
                    coalicion: string | null
                    camara: 'camara' | 'senado'
                    region: string
                    circunscripcion: string | null
                    distrito: string | null
                    email: string | null
                    telefono: string | null
                    curriculum_url: string | null
                    vigente: boolean
                    periodo_inicio: string | null
                    periodo_fin: string | null
                    synced_at: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    external_id: string
                    nombre: string
                    apellido_paterno: string
                    apellido_materno: string
                    nombre_completo: string
                    partido: string
                    ideologia: string
                    coalicion?: string | null
                    camara: 'camara' | 'senado'
                    region: string
                    circunscripcion?: string | null
                    distrito?: string | null
                    email?: string | null
                    telefono?: string | null
                    curriculum_url?: string | null
                    vigente?: boolean
                    periodo_inicio?: string | null
                    periodo_fin?: string | null
                    synced_at?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    external_id?: string
                    nombre?: string
                    apellido_paterno?: string
                    apellido_materno?: string
                    nombre_completo?: string
                    partido?: string
                    ideologia?: string
                    coalicion?: string | null
                    camara?: 'camara' | 'senado'
                    region?: string
                    circunscripcion?: string | null
                    distrito?: string | null
                    email?: string | null
                    telefono?: string | null
                    curriculum_url?: string | null
                    vigente?: boolean
                    periodo_inicio?: string | null
                    periodo_fin?: string | null
                    synced_at?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            bills: {
                Row: {
                    id: string
                    external_id: string
                    boletin: string
                    titulo: string
                    resumen: string | null
                    estado: string
                    etapa_actual: string | null
                    urgencia: string
                    camara_origen: 'camara' | 'senado'
                    iniciativa: string
                    tipo: string | null
                    fecha_ingreso: string
                    fecha_ultima_modificacion: string | null
                    ley: string | null
                    tramitacion_link: string | null
                    materias: Json
                    synced_at: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    external_id: string
                    boletin: string
                    titulo: string
                    resumen?: string | null
                    estado: string
                    etapa_actual?: string | null
                    urgencia?: string
                    camara_origen: 'camara' | 'senado'
                    iniciativa: string
                    tipo?: string | null
                    fecha_ingreso: string
                    fecha_ultima_modificacion?: string | null
                    ley?: string | null
                    tramitacion_link?: string | null
                    materias?: Json
                    synced_at?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    external_id?: string
                    boletin?: string
                    titulo?: string
                    resumen?: string | null
                    estado?: string
                    etapa_actual?: string | null
                    urgencia?: string
                    camara_origen?: 'camara' | 'senado'
                    iniciativa?: string
                    tipo?: string | null
                    fecha_ingreso?: string
                    fecha_ultima_modificacion?: string | null
                    ley?: string | null
                    tramitacion_link?: string | null
                    materias?: Json
                    synced_at?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            bill_events: {
                Row: {
                    id: string
                    bill_id: string
                    tipo: string
                    fecha: string
                    descripcion: string
                    camara: 'camara' | 'senado'
                    sesion: string | null
                    documentos: Json
                    metadata: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    bill_id: string
                    tipo: string
                    fecha: string
                    descripcion: string
                    camara: 'camara' | 'senado'
                    sesion?: string | null
                    documentos?: Json
                    metadata?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    bill_id?: string
                    tipo?: string
                    fecha?: string
                    descripcion?: string
                    camara?: 'camara' | 'senado'
                    sesion?: string | null
                    documentos?: Json
                    metadata?: Json
                    created_at?: string
                }
            }
            votes: {
                Row: {
                    id: string
                    external_id: string
                    bill_id: string | null
                    boletin: string
                    fecha: string
                    camara: 'camara' | 'senado'
                    sesion: string | null
                    tipo: string
                    materia: string
                    resultado: string
                    quorum: string | null
                    a_favor: number
                    contra: number
                    abstenciones: number
                    ausentes: number
                    pareos: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    external_id: string
                    bill_id?: string | null
                    boletin: string
                    fecha: string
                    camara: 'camara' | 'senado'
                    sesion?: string | null
                    tipo: string
                    materia: string
                    resultado: string
                    quorum?: string | null
                    a_favor?: number
                    contra?: number
                    abstenciones?: number
                    ausentes?: number
                    pareos?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    external_id?: string
                    bill_id?: string | null
                    boletin?: string
                    fecha?: string
                    camara?: 'camara' | 'senado'
                    sesion?: string | null
                    tipo?: string
                    materia?: string
                    resultado?: string
                    quorum?: string | null
                    a_favor?: number
                    contra?: number
                    abstenciones?: number
                    ausentes?: number
                    pareos?: number
                    created_at?: string
                }
            }
            vote_roll_call: {
                Row: {
                    id: string
                    vote_id: string
                    parliamentarian_id: string
                    voto: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    vote_id: string
                    parliamentarian_id: string
                    voto: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    vote_id?: string
                    parliamentarian_id?: string
                    voto?: string
                    created_at?: string
                }
            }
        }
        Views: {
            recent_activity: {
                Row: {
                    id: string | null
                    tipo: string | null
                    fecha: string | null
                    descripcion: string | null
                    boletin: string | null
                    titulo: string | null
                    camara: string | null
                }
            }
            active_bills: {
                Row: {
                    id: string | null
                    external_id: string | null
                    boletin: string | null
                    titulo: string | null
                    resumen: string | null
                    estado: string | null
                    etapa_actual: string | null
                    urgencia: string | null
                    camara_origen: string | null
                    iniciativa: string | null
                    tipo: string | null
                    fecha_ingreso: string | null
                    fecha_ultima_modificacion: string | null
                    ley: string | null
                    tramitacion_link: string | null
                    materias: Json | null
                    synced_at: string | null
                    created_at: string | null
                    updated_at: string | null
                    days_since_update: number | null
                    momentum: number | null
                }
            }
        }
        Functions: {}
        Enums: {}
    }
}
