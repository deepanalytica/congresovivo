"use client"

import '../globals.css'
import { MotionCard } from '@/components/ui/MotionCard'
import { Vote, ArrowLeft, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function VotosPage() {
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
                            <Vote className="text-cyan-400" />
                            Votaciones
                        </h1>
                        <p className="text-slate-400 mt-2">Historial de votaciones en el Congreso</p>
                    </div>
                </div>

                {/* Coming Soon */}
                <MotionCard className="p-12 text-center">
                    <Vote className="w-20 h-20 text-cyan-400 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-4">Próximamente</h2>
                    <p className="text-slate-400 max-w-md mx-auto">
                        Esta sección mostrará el historial completo de votaciones, análisis de tendencias y patrones de voto de los parlamentarios.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <div className="px-4 py-2 bg-white/5 rounded-lg">
                            <p className="text-sm text-slate-500">Votaciones registradas</p>
                            <p className="text-2xl font-bold text-white">0</p>
                        </div>
                        <div className="px-4 py-2 bg-white/5 rounded-lg">
                            <p className="text-sm text-slate-500">Parlamentarios</p>
                            <p className="text-2xl font-bold text-white">60</p>
                        </div>
                    </div>
                </MotionCard>
            </div>
        </div>
    )
}
