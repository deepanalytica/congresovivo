"use client"

import { MotionCard } from '@/components/ui/MotionCard'
import { CheckCircle2, XCircle, Clock, Building2, Ticket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'
import { VoteDetailModal } from './VoteDetailModal'

interface VoteCardProps {
    vote: {
        id: string;
        fecha: string;
        camara: string;
        resultado: string;
        materia: string;
        a_favor: number;
        contra: number;
        abstenciones: number;
        ausentes: number;
        bill?: {
            titulo: string;
            boletin: string;
        }
    }
}

export function VoteCard({ vote }: VoteCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isApproved = vote.resultado === 'aprobado';

    return (
        <MotionCard className="overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
            <div className={`h-1.5 w-full ${isApproved ? 'bg-emerald-500' : 'bg-rose-500'}`} />

            <div className="p-6 space-y-4">
                {/* Header: Date and Chamber */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {format(new Date(vote.fecha), 'PP', { locale: es })}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4" />
                            {vote.camara === 'senado' ? 'Senado' : 'Cámara'}
                        </div>
                    </div>

                    <Badge className={isApproved ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}>
                        {isApproved ? (
                            <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Aprobado
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                Rechazado
                            </div>
                        )}
                    </Badge>
                </div>

                {/* Content: Title and Bulletin */}
                <div>
                    <h3 className="text-white font-bold leading-tight group-hover:text-cyan-400 transition-colors line-clamp-2 mb-2">
                        {vote.materia}
                    </h3>
                    <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-500 font-mono">Boletín {vote.bill?.boletin || 'N/A'}</span>
                    </div>
                </div>

                {/* Footer: Vote Counts */}
                <div className="pt-4 border-t border-white/5">
                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-emerald-500/5 rounded-lg p-2 border border-emerald-500/10">
                            <p className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-wider mb-1">A favor</p>
                            <p className="text-lg font-bold text-white">{vote.a_favor}</p>
                        </div>
                        <div className="bg-rose-500/5 rounded-lg p-2 border border-rose-500/10">
                            <p className="text-[10px] text-rose-500/70 font-bold uppercase tracking-wider mb-1">En contra</p>
                            <p className="text-lg font-bold text-white">{vote.contra}</p>
                        </div>
                        <div className="bg-slate-500/5 rounded-lg p-2 border border-slate-500/10">
                            <p className="text-[10px] text-slate-500/70 font-bold uppercase tracking-wider mb-1">Abst.</p>
                            <p className="text-lg font-bold text-white">{vote.abstenciones}</p>
                        </div>
                        <div className="bg-slate-500/5 rounded-lg p-2 border border-slate-500/10">
                            <p className="text-[10px] text-slate-500/70 font-bold uppercase tracking-wider mb-1">Aus.</p>
                            <p className="text-lg font-bold text-white">{vote.ausentes}</p>
                        </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full flex overflow-hidden">
                        <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${(vote.a_favor / (vote.a_favor + vote.contra + vote.abstenciones)) * 100}%` }}
                        />
                        <div
                            className="h-full bg-rose-500"
                            style={{ width: `${(vote.contra / (vote.a_favor + vote.contra + vote.abstenciones)) * 100}%` }}
                        />
                        <div
                            className="h-full bg-slate-500"
                            style={{ width: `${(vote.abstenciones / (vote.a_favor + vote.contra + vote.abstenciones)) * 100}%` }}
                        />
                    </div>
                </div>

                {/* New: Detail Button */}
                <div className="pt-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full py-2 bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 rounded-lg text-xs font-bold text-slate-400 hover:text-cyan-400 transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-2 group/btn"
                    >
                        Ver Detalle de Votación
                        <Ticket className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            <VoteDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                voteId={vote.id}
                title={vote.materia}
                boletin={vote.bill?.boletin}
            />
        </MotionCard>
    )
}
