"use client"

import '../globals.css'
import { MotionCard } from '@/components/ui/MotionCard'
import { Users, ArrowLeft, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function ComisionesPage() {
    return (
        <div className="min-h-screen bg-[#030712] p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <ArrowLeft className="text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="font-outfit text-4xl font-bold text-white flex items-center gap-3">
                            <Users className="text-cyan-400" />
                            Comisiones
                        </h1>
                        <p className="text-slate-400 mt-2">Comisiones permanentes y especiales del Congreso</p>
                    </div>
                </div>

                {/* Coming Soon */}
                <MotionCard className="p-12 text-center">
                    <Briefcase className="w-20 h-20 text-cyan-400 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-4">Próximamente</h2>
                    <p className="text-slate-400 max-w-md mx-auto">
                        Información detallada sobre todas las comisiones del Congreso, sus integrantes, proyectos en revisión y calendario de sesiones.
                    </p>
                    <div className="mt-8 grid grid-cols-2 gap-4 max-w-md mx-auto">
                        <div className="px-4 py-2 bg-white/5 rounded-lg">
                            <p className="text-sm text-slate-500">Comisiones Activas</p>
                            <p className="text-2xl font-bold text-white">38</p>
                        </div>
                        <div className="px-4 py-2 bg-white/5 rounded-lg">
                            <p className="text-sm text-slate-500">Proyectos en Comisión</p>
                            <p className="text-2xl font-bold text-white">5</p>
                        </div>
                    </div>
                </MotionCard>

                {/* Sample Commissions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        'Constitución',
                        'Hacienda',
                        'Educación',
                        'Salud',
                        'Trabajo',
                        'Medio Ambiente'
                    ].map((name, i) => (
                        <MotionCard key={i} className="p-6">
                            <h3 className="font-bold text-white mb-2">{name}</h3>
                            <p className="text-sm text-slate-400">Comisión permanente</p>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(j => (
                                        <div key={j} className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-[#0a0e1a]" />
                                    ))}
                                </div>
                                <span className="text-xs text-slate-500">+12 miembros</span>
                            </div>
                        </MotionCard>
                    ))}
                </div>
            </div>
        </div>
    )
}
