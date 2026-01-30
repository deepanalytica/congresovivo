"use client"

import { MotionCard } from '@/components/ui/MotionCard'
import { CheckCircle2, XCircle, Clock, Building2, Ticket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'
import { VoteDetailModal } from './VoteDetailModal'
import Link from 'next/link'

interface VoteCardProps {
    vote: {
        id: string;
        vote_date: string;
        vote_context: string;
        result: string;
        description: string;
        yes_count: number;
        no_count: number;
        abstention_count: number;
        absent_count: number;
        bill?: {
            title: string;
            bulletin_number: string;
        }
    }
}

export function VoteCard({ vote }: VoteCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isApproved = vote.result === 'aprobado';

    return (
        <MotionCard className="overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
            <div className={`h-1.5 w-full ${isApproved ? 'bg-emerald-500' : 'bg-rose-500'}`} />

            <div className="p-6 space-y-4">
                {/* Header: Date and Chamber */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {vote.vote_date ? format(new Date(vote.vote_date), 'PP', { locale: es }) : 'N/A'}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4" />
                            {vote.vote_context === 'senado' ? 'Senado' : 'Cámara'}
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
                        {vote.description}
                    </h3>
                    <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-500 font-mono">Boletín {vote.bill?.bulletin_number || 'N/A'}</span>
                    </div>
                </div>

                {/* Footer: Vote Counts */}
                <div className="pt-4 border-t border-white/5">
                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-emerald-500/5 rounded-lg p-2 border border-emerald-500/10">
                            <p className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-wider mb-1">A favor</p>
                            <p className="text-lg font-bold text-white">{vote.yes_count}</p>
                        </div>
                        <div className="bg-rose-500/5 rounded-lg p-2 border border-rose-500/10">
                            <p className="text-[10px] text-rose-500/70 font-bold uppercase tracking-wider mb-1">En contra</p>
                            <p className="text-lg font-bold text-white">{vote.no_count}</p>
                        </div>
                        <div className="bg-slate-500/5 rounded-lg p-2 border border-slate-500/10">
                            <p className="text-[10px] text-slate-500/70 font-bold uppercase tracking-wider mb-1">Abst.</p>
                            <p className="text-lg font-bold text-white">{vote.abstention_count}</p>
                        </div>
                        <div className="bg-slate-500/5 rounded-lg p-2 border border-slate-500/10">
                            <p className="text-[10px] text-slate-500/70 font-bold uppercase tracking-wider mb-1">Aus.</p>
                            <p className="text-lg font-bold text-white">{vote.absent_count}</p>
                        </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full flex overflow-hidden">
                        <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${(vote.yes_count / (Math.max(1, vote.yes_count + vote.no_count + vote.abstention_count))) * 100}%` }}
                        />
                        <div
                            className="h-full bg-rose-500"
                            style={{ width: `${(vote.no_count / (Math.max(1, vote.yes_count + vote.no_count + vote.abstention_count))) * 100}%` }}
                        />
                        <div
                            className="h-full bg-slate-500"
                            style={{ width: `${(vote.abstention_count / (Math.max(1, vote.yes_count + vote.no_count + vote.abstention_count))) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Link to Detail Page */}
                <div className="pt-2">
                    <Link href={`/votos/${vote.id}`} className="block w-full">
                        <button
                            className="w-full py-2 bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 rounded-lg text-xs font-bold text-slate-400 hover:text-cyan-400 transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-2 group/btn"
                        >
                            Ver Visualización Interactiva
                            <Ticket className="w-3.5 h-3.5 group-hover/btn:translate-x-1-1 transition-transform" />
                        </button>
                    </Link>
                </div>
            </div>

            <VoteDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                voteId={vote.id}
                title={vote.description}
                boletin={vote.bill?.bulletin_number}
            />
        </MotionCard>
    )
}
