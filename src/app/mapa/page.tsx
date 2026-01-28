"use client"

import '../globals.css'
import { MotionCard } from '@/components/ui/MotionCard'
import { Map, ArrowLeft, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function MapaPage() {
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
                            <Map className="text-cyan-400" />
                            Mapa Legislativo
                        </h1>
                        <p className="text-slate-400 mt-2">Distribución geográfica de parlamentarios y proyectos</p>
                    </div>
                </div>

                {/* Coming Soon */}
                <MotionCard className="p-12 text-center">
                    <MapPin className="w-20 h-20 text-cyan-400 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-4">Próximamente</h2>
                    <p className="text-slate-400 max-w-md mx-auto">
                        Mapa interactivo de Chile mostrando la distribución de parlamentarios por región, distritos electorales y proyectos de ley por zona geográfica.
                    </p>
                    <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto">
                        <div className="px-4 py-2 bg-white/5 rounded-lg">
                            <p className="text-sm text-slate-500">Regiones</p>
                            <p className="text-2xl font-bold text-white">16</p>
                        </div>
                        <div className="px-4 py-2 bg-white/5 rounded-lg">
                            <p className="text-sm text-slate-500">Senadores</p>
                            <p className="text-2xl font-bold text-white">50</p>
                        </div>
                        <div className="px-4 py-2 bg-white/5 rounded-lg">
                            <p className="text-sm text-slate-500">Diputados</p>
                            <p className="text-2xl font-bold text-white">10</p>
                        </div>
                    </div>
                </MotionCard>
            </div>
        </div>
    )
}
