"use client"

import { motion } from 'framer-motion'
import { MotionCard } from '@/components/ui/MotionCard'
import { Badge } from '@/components/ui/badge'
import { getPartyColor } from '@/lib/design-tokens'
import { Building2, MapPin } from 'lucide-react'

interface ParliamentarianCardProps {
    parliamentarian: {
        id: string;
        nombre_completo: string;
        partido: string;
        camara: string;
        region: string;
        ideologia: string;
    }
}

export function ParliamentarianCard({ parliamentarian }: ParliamentarianCardProps) {
    const partyColor = getPartyColor(parliamentarian.partido);
    const initials = parliamentarian.nombre_completo
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('');

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="relative group cursor-pointer"
        >
            {/* Background Glow */}
            <div
                className="absolute -inset-0.5 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"
                style={{ backgroundColor: partyColor.bg }}
            ></div>

            {/* Main Card */}
            <div className="relative h-full rounded-2xl bg-[#0a0e1a]/80 backdrop-blur-xl border border-white/10 overflow-hidden flex flex-col">
                {/* Header Decoration */}
                <div
                    className="h-2 w-full"
                    style={{ backgroundColor: partyColor.bg }}
                />

                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold border border-white/10 shadow-lg relative overflow-hidden"
                            style={{
                                color: partyColor.bg
                            }}
                        >
                            <div className="absolute inset-0 opacity-10" style={{ backgroundColor: partyColor.bg }}></div>
                            {initials}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className="text-[10px] h-5 bg-white/5 border-white/10 text-slate-400 font-bold uppercase tracking-widest">
                                {parliamentarian.camara === 'senado' ? 'Senador' : 'Diputado'}
                            </Badge>
                            {parliamentarian.ideologia && (
                                <Badge variant="outline" className="text-[10px] h-5 bg-cyan-500/10 border-cyan-500/20 text-cyan-400 font-bold uppercase tracking-widest">
                                    {parliamentarian.ideologia}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1 mb-6">
                        <h3 className="text-white text-lg font-bold leading-tight group-hover:text-cyan-400 transition-colors line-clamp-2">
                            {parliamentarian.nombre_completo}
                        </h3>
                        <p className="text-sm font-semibold tracking-wide uppercase opacity-80" style={{ color: partyColor.bg }}>
                            {parliamentarian.partido}
                        </p>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
                        <div className="flex items-center gap-3 text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                            <div className="p-1.5 rounded-md bg-white/5">
                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <span className="truncate">{parliamentarian.region || 'Región Desconocida'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                            <div className="p-1.5 rounded-md bg-white/5">
                                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <span>{parliamentarian.camara === 'senado' ? 'Cámara Alta' : 'Cámara Baja'}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Interaction */}
                <div className="p-4 bg-white/5 border-t border-white/5 flex justify-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
                        Ver actividad legislativa
                    </span>
                </div>
            </div>
        </motion.div>
    )
}
