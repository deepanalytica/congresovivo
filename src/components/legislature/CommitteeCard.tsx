"use client"

import { MotionCard } from '@/components/ui/MotionCard'
import { Users, Building2, ExternalLink, Calendar, Mail, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CommitteeCardProps {
    committee: {
        id: string;
        nombre: string;
        nombre_corto?: string;
        tipo: string;
        camara: string;
        descripcion?: string;
        memberCount: number;
        email?: string;
        telefono?: string;
    }
}

export function CommitteeCard({ committee }: CommitteeCardProps) {
    const isSenate = committee.camara === 'senado';
    const isSpecial = committee.tipo === 'especial';

    return (
        <MotionCard className="group overflow-hidden border-white/5 hover:border-cyan-500/30 transition-all duration-300">
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${isSenate ? 'bg-amber-500' : 'bg-cyan-500'}`} />

            <div className="p-6 h-full flex flex-col relative">
                {/* Header: Type and Chamber */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                        <Badge variant="outline" className="border-white/10 text-[10px] uppercase tracking-wider font-bold">
                            {isSpecial ? 'Especial' : 'Permanente'}
                        </Badge>
                        <Badge className={`${isSenate ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'} text-[10px] uppercase tracking-wider font-bold`}>
                            {isSenate ? 'Senado' : 'Cámara'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-bold text-white">{committee.memberCount}</span>
                    </div>
                </div>

                {/* Body: Title and Description */}
                <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight">
                        {committee.nombre}
                    </h3>
                    {committee.descripcion && (
                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                            {committee.descripcion}
                        </p>
                    )}
                </div>

                {/* Footer: Contacts and Link */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-3">
                        {committee.email && (
                            <a href={`mailto:${committee.email}`} title={committee.email} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                                <Mail className="w-4 h-4" />
                            </a>
                        )}
                        {committee.telefono && (
                            <a href={`tel:${committee.telefono}`} title={committee.telefono} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                                <Phone className="w-4 h-4" />
                            </a>
                        )}
                    </div>

                    <button className="flex items-center gap-2 text-xs font-bold text-white hover:text-cyan-400 transition-colors">
                        Ver Detalles
                        <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </MotionCard>
    )
}
