'use client';

import { motion } from 'framer-motion';
import { Calendar, Users, TrendingUp, Clock, FileText, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface BillCardProps {
    id: string;
    boletin: string;
    titulo: string;
    estado: string;
    etapa?: string;
    urgencia?: string;
    fechaIngreso: string;
    camaraOrigen: string;
    tipoIniciativa: string;
    autores?: number;
    onClick?: () => void;
}

export function BillCard({
    id,
    boletin,
    titulo,
    estado,
    etapa,
    urgencia,
    fechaIngreso,
    camaraOrigen,
    tipoIniciativa,
    autores = 0,
    onClick
}: BillCardProps) {

    const getEstadoBadge = () => {
        const estados: Record<string, { color: string; label: string }> = {
            'en_tramite': { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'En Trámite' },
            'aprobado': { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Aprobado' },
            'rechazado': { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Rechazado' },
            'archivado': { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Archivado' },
            'retirado': { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Retirado' },
            'promulgado': { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Promulgado' }
        };

        const estado_key = estado.toLowerCase().replace(' ', '_');
        return estados[estado_key] || { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: estado };
    };

    const getUrgenciaBadge = () => {
        if (!urgencia) return null;

        const urgencias: Record<string, { color: string; icon: any }> = {
            'simple': { color: 'bg-blue-500/20 text-blue-400', icon: Clock },
            'suma': { color: 'bg-orange-500/20 text-orange-400', icon: TrendingUp },
            'discusion_inmediata': { color: 'bg-red-500/20 text-red-400', icon: AlertCircle }
        };

        const urgencia_key = urgencia.toLowerCase().replace(' ', '_');
        const config = urgencias[urgencia_key] || { color: 'bg-blue-500/20 text-blue-400', icon: Clock };
        const Icon = config.icon;

        return (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${config.color}`}>
                <Icon className="h-3 w-3" />
                {urgencia}
            </div>
        );
    };

    const getEtapaProgress = () => {
        const etapas = ['ingreso', 'primer_tramite', 'segundo_tramite', 'tercer_tramite', 'promulgacion'];
        const etapa_key = etapa?.toLowerCase().replace(' ', '_') || 'ingreso';
        const current = etapas.indexOf(etapa_key);
        const progress = current >= 0 ? ((current + 1) / etapas.length) * 100 : 20;

        return (
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </div>
        );
    };

    const estadoBadge = getEstadoBadge();
    const urgenciaBadge = getUrgenciaBadge();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            className="cursor-pointer group"
        >
            <div className="relative h-full rounded-xl overflow-hidden">
                {/* Glassmorphism Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-950/80 backdrop-blur-xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
                <div className="absolute inset-0 border border-white/10 rounded-xl" />

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-xl" />
                </div>

                {/* Content */}
                <div className="relative p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="font-mono text-xs border-blue-500/30 text-blue-400">
                                    {boletin}
                                </Badge>
                                <Badge className={`border ${estadoBadge.color}`}>
                                    {estadoBadge.label}
                                </Badge>
                                {urgenciaBadge}
                            </div>
                            <h3 className="text-lg font-semibold text-white leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">
                                {titulo}
                            </h3>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {etapa && (
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400">{etapa}</span>
                                <span className="text-gray-500">{Math.round(getEtapaProgress().props.children.props.animate.width.replace('%', ''))}%</span>
                            </div>
                            {getEtapaProgress()}
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            <span>{new Date(fechaIngreso).toLocaleDateString('es-CL')}</span>
                        </div>
                        {autores > 0 && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <Users className="h-4 w-4 text-purple-400" />
                                <span>{autores} {autores === 1 ? 'autor' : 'autores'}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-400">
                            <FileText className="h-4 w-4 text-green-400" />
                            <span className="capitalize">{camaraOrigen}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 capitalize">
                            <TrendingUp className="h-4 w-4 text-orange-400" />
                            <span>{tipoIniciativa}</span>
                        </div>
                    </div>

                    {/* Hover Arrow */}
                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm text-blue-400 flex items-center gap-1">
                            Ver detalle
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
