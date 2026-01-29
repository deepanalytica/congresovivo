"use client"

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
        <MotionCard className="overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
            {/* Top Color Bar */}
            <div
                className="h-1.5 w-full"
                style={{ backgroundColor: partyColor.bg }}
            />

            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2"
                        style={{
                            backgroundColor: `${partyColor.bg}20`,
                            borderColor: partyColor.bg,
                            color: partyColor.bg
                        }}
                    >
                        {initials}
                    </div>
                    <Badge variant="outline" className="text-xs uppercase tracking-wider bg-white/5 border-white/10 text-slate-400">
                        {parliamentarian.camara === 'senado' ? 'Senador' : 'Diputado'}
                    </Badge>
                </div>

                <div className="space-y-1 mb-4">
                    <h3 className="text-white font-bold leading-tight group-hover:text-cyan-400 transition-colors">
                        {parliamentarian.nombre_completo}
                    </h3>
                    <p className="text-sm font-medium" style={{ color: partyColor.bg }}>
                        {parliamentarian.partido}
                    </p>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {parliamentarian.region || 'Región Desconocida'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        {parliamentarian.camara === 'senado' ? 'Cámara Alta' : 'Cámara Baja'}
                    </div>
                </div>
            </div>
        </MotionCard>
    )
}
