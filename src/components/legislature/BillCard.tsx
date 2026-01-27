import type { Bill } from '@/types/legislature'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getBillStageColor, getUrgencyColor, getBillStageLabel, getUrgencyLabel, calculateMomentum } from '@/lib/utils/legislature'
import { formatRelative } from '@/lib/utils/dates'
import Link from 'next/link'
import { TrendingUp, Clock, AlertCircle } from 'lucide-react'

interface BillCardProps {
    bill: Bill
}

export function BillCard({ bill }: BillCardProps) {
    const stageColor = getBillStageColor(bill.estado)
    const urgencyColor = getUrgencyColor(bill.urgencia)
    const momentum = calculateMomentum(bill.fechaUltimaModificacion)

    return (
        <Link href={`/proyectos/${bill.id}`}>
            <div className="glass-card-hover cursor-pointer h-full p-4 group">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold leading-snug line-clamp-2 text-slate-100 group-hover:text-cyan-300 transition-colors">
                            {bill.titulo}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                            Boletín {bill.boletin}
                        </p>
                    </div>
                    {momentum > 70 && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/50 flex items-center justify-center pulse-glow">
                            <TrendingUp className="h-4 w-4 text-orange-400" />
                        </div>
                    )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <Badge
                        className="badge-glow text-xs"
                        style={{
                            backgroundColor: stageColor.bg,
                            color: stageColor.text,
                            borderColor: stageColor.bg
                        }}
                    >
                        {getBillStageLabel(bill.estado)}
                    </Badge>

                    {bill.urgencia !== 'sin' && (
                        <Badge
                            className="badge-glow text-xs flex items-center gap-1"
                            style={{
                                backgroundColor: urgencyColor.bg,
                                color: urgencyColor.text,
                                borderColor: urgencyColor.bg
                            }}
                        >
                            <AlertCircle className="h-3 w-3" />
                            {getUrgencyLabel(bill.urgencia)}
                        </Badge>
                    )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelative(bill.fechaUltimaModificacion)}
                    </span>
                    <span className="capitalize text-cyan-400">{bill.camaraOrigen}</span>
                </div>

                {/* Materias */}
                {bill.materias && bill.materias.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {bill.materias.slice(0, 2).map((materia, i) => (
                            <span
                                key={i}
                                className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300"
                            >
                                {materia}
                            </span>
                        ))}
                        {bill.materias.length > 2 && (
                            <span className="text-xs px-2 py-0.5 text-slate-500">
                                +{bill.materias.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </Link>
    )
}
