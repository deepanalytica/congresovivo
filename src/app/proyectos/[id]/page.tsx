"use client"

import '../../globals.css'
import React from 'react'
import { MotionCard } from '@/components/ui/MotionCard'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Building2, User, FileText, Clock, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { getBillStageColor, getUrgencyColor, getBillStageLabel, getUrgencyLabel } from '@/lib/utils/legislature'
import { formatRelative } from '@/lib/utils/dates'

export default function ProyectoDetailPage({ params }: { params: { id: string } }) {
    const [bill, setBill] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function loadBill() {
            try {
                // Fetch from our API that wraps Supabase
                const res = await fetch(`/api/bills`);
                const { bills } = await res.json();

                // Find bill by ID or bulletin number
                const foundBill = bills?.find((b: any) =>
                    b.id === params.id || b.boletin === params.id
                );

                if (foundBill) {
                    // Map database schema to frontend needs
                    setBill({
                        ...foundBill,
                        titulo: foundBill.titulo,
                        boletin: foundBill.boletin,
                        estado: (foundBill.estado || 'ingreso').toLowerCase(),
                        urgencia: (foundBill.urgencia || 'sin').toLowerCase(),
                        camaraOrigen: foundBill.camara_origen,
                        iniciativa: foundBill.iniciativa,
                        fechaIngreso: foundBill.fecha_ingreso,
                        etapaActual: foundBill.etapa_actual || 'En tramitación',
                        fechaUltimaModificacion: foundBill.updated_at
                    });
                }
            } catch (error) {
                console.error('Error loading bill:', error);
            } finally {
                setLoading(false);
            }
        }
        loadBill();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#030712]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                    <p className="mt-4 text-slate-400">Cargando proyecto...</p>
                </div>
            </div>
        );
    }

    if (!bill) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#030712]">
                <div className="text-center">
                    <FileText className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Proyecto no encontrado</h2>
                    <p className="text-slate-400 mb-6">El proyecto que buscas no existe o fue eliminado</p>
                    <Link href="/proyectos" className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                        Ver todos los proyectos
                    </Link>
                </div>
            </div>
        );
    }

    const stageColor = getBillStageColor(bill.estado);
    const urgencyColor = getUrgencyColor(bill.urgencia);

    return (
        <div className="min-h-screen bg-[#030712] p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <Link href="/proyectos" className="p-2 rounded-lg hover:bg-white/10 transition-colors mt-1">
                        <ArrowLeft className="text-slate-400" />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <Badge
                                className="badge-glow"
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
                                    className="badge-glow flex items-center gap-1"
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
                        <h1 className="font-outfit text-3xl md:text-4xl font-bold text-white mb-2">
                            {bill.titulo}
                        </h1>
                        <p className="text-slate-400">Boletín {bill.boletin}</p>
                    </div>
                </div>

                {/* Main Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MotionCard className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Building2 className="text-cyan-400" />
                            <h3 className="font-bold text-white">Cámara de Origen</h3>
                        </div>
                        <p className="text-slate-300">{bill.camaraOrigen}</p>
                    </MotionCard>

                    <MotionCard className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <User className="text-cyan-400" />
                            <h3 className="font-bold text-white">Iniciativa</h3>
                        </div>
                        <p className="text-slate-300">{bill.iniciativa}</p>
                    </MotionCard>

                    <MotionCard className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="text-cyan-400" />
                            <h3 className="font-bold text-white">Fecha Ingreso</h3>
                        </div>
                        <p className="text-slate-300">
                            {new Date(bill.fechaIngreso).toLocaleDateString('es-CL', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </MotionCard>
                </div>

                {/* Etapa Actual */}
                <MotionCard className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-cyan-400 w-6 h-6" />
                        <h2 className="font-outfit text-2xl font-bold text-white">Etapa Actual</h2>
                    </div>
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                        <p className="text-xl text-white font-medium">{bill.etapaActual}</p>
                        <div className="flex items-center gap-2 mt-4 text-sm text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span>Última modificación: {formatRelative(bill.fechaUltimaModificacion)}</span>
                        </div>
                    </div>
                </MotionCard>

                {/* Timeline Placeholder */}
                <MotionCard className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <CheckCircle2 className="text-cyan-400 w-6 h-6" />
                        <h2 className="font-outfit text-2xl font-bold text-white">Tramitación</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-3 h-3 rounded-full bg-cyan-500 mt-1.5"></div>
                            <div className="flex-1">
                                <p className="text-white font-medium">{bill.etapaActual}</p>
                                <p className="text-sm text-slate-400">Estado actual del proyecto</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 opacity-50">
                            <div className="w-3 h-3 rounded-full bg-slate-600 mt-1.5"></div>
                            <div className="flex-1">
                                <p className="text-slate-400 font-medium">Ingreso</p>
                                <p className="text-sm text-slate-500">
                                    {new Date(bill.fechaIngreso).toLocaleDateString('es-CL')}
                                </p>
                            </div>
                        </div>
                    </div>
                </MotionCard>

                {/* Additional Info */}
                <MotionCard className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="text-cyan-400 w-6 h-6" />
                        <h2 className="font-outfit text-2xl font-bold text-white">Información Adicional</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Estado</p>
                            <p className="text-white capitalize">{getBillStageLabel(bill.estado)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Urgencia</p>
                            <p className="text-white capitalize">{getUrgencyLabel(bill.urgencia)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Boletín</p>
                            <p className="text-white">{bill.boletin}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">ID</p>
                            <p className="text-white font-mono text-sm">{bill.id}</p>
                        </div>
                    </div>
                </MotionCard>

                {/* Actions */}
                <div className="flex gap-4">
                    <Link
                        href="/proyectos"
                        className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors text-center"
                    >
                        Volver a proyectos
                    </Link>
                    <button className="flex-1 px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                        Ver en BCN
                    </button>
                </div>
            </div>
        </div>
    );
}
