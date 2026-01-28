"use client"

import '../globals.css'
import { LegislativeMap } from '@/components/legislature/LegislativeMap'
import { Map, ArrowLeft, Users, Building2, MapPin, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MotionCard } from '@/components/ui/MotionCard'

export default function MapaPage() {
    const [mapData, setMapData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRegion, setSelectedRegion] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchMapData = async () => {
            setLoading(true)
            try {
                const res = await fetch('/api/map/parliamentarians')
                const data = await res.json()
                setMapData(data)
            } catch (err) {
                console.error('Error fetching map data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchMapData()
    }, [])

    return (
        <div className="min-h-screen bg-[#030712] p-6 md:p-10 flex flex-col gap-8">
            <div className="max-w-7xl mx-auto w-full space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <ArrowLeft className="text-slate-400" />
                        </Link>
                        <div>
                            <h1 className="font-outfit text-4xl font-bold text-white flex items-center gap-3">
                                <Map className="text-cyan-400" />
                                Mapa Legislativo
                            </h1>
                            <p className="text-slate-400 mt-2">Distribución territorial de representantes</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-4">
                        <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Regiones</p>
                            <p className="text-xl font-bold text-white font-outfit">{mapData.length}</p>
                        </div>
                        <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total representantes</p>
                            <p className="text-xl font-bold text-cyan-500 font-outfit">
                                {mapData.reduce((acc, r) => acc + r.count, 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content: Map + Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]">
                    {/* Map Container */}
                    <div className="lg:col-span-2 h-[500px] lg:h-auto overflow-hidden rounded-2xl border border-white/10">
                        {loading ? (
                            <div className="w-full h-full bg-white/5 animate-pulse flex items-center justify-center">
                                <Map className="w-12 h-12 text-slate-700 animate-bounce" />
                            </div>
                        ) : (
                            <LegislativeMap
                                data={mapData}
                                onRegionSelect={(region) => setSelectedRegion(region)}
                            />
                        )}
                    </div>

                    {/* Sidebar / Info Panel */}
                    <div className="space-y-6">
                        {selectedRegion ? (
                            <MotionCard className="p-6 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <Badge className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
                                        Seleccionado
                                    </Badge>
                                    <button
                                        onClick={() => setSelectedRegion(null)}
                                        className="text-xs text-slate-500 hover:text-white transition-colors"
                                    >
                                        Limpiar selección
                                    </button>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <MapPin className="text-cyan-400 w-5 h-5" />
                                        <h2 className="text-2xl font-bold text-white font-outfit">
                                            {selectedRegion.region}
                                        </h2>
                                    </div>
                                    <p className="text-slate-400 text-sm">
                                        Esta región cuenta con {selectedRegion.count} representantes parlamentarios.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Senadores</p>
                                        <p className="text-2xl font-bold text-white">{selectedRegion.senators}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Diputados</p>
                                        <p className="text-2xl font-bold text-white">{selectedRegion.deputies}</p>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Representantes</h3>
                                    <div className="space-y-3">
                                        {selectedRegion.parliamentarians.map((p: any) => (
                                            <div key={p.id} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all flex items-center justify-between group">
                                                <div>
                                                    <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                        {p.nombre_completo}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{p.partido}</p>
                                                </div>
                                                <Badge variant="outline" className="text-[10px] py-0 h-5">
                                                    {p.camara === 'senado' ? 'S' : 'D'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </MotionCard>
                        ) : (
                            <MotionCard className="p-8 text-center flex flex-col items-center justify-center h-full bg-white/5 border-dashed">
                                <MapPin className="w-12 h-12 text-slate-700 mb-4" />
                                <h3 className="text-lg font-bold text-slate-400">Selecciona una región</h3>
                                <p className="text-slate-600 text-sm mt-2 max-w-[200px]">
                                    Haz clic en los círculos del mapa para ver el detalle de representantes por zona.
                                </p>
                            </MotionCard>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function Badge({ children, className, variant = 'default' }: { children: React.ReactNode, className?: string, variant?: 'default' | 'outline' }) {
    if (variant === 'outline') {
        return (
            <span className={`px-2 py-0.5 rounded-full border border-white/20 text-slate-400 font-bold uppercase tracking-wider ${className}`}>
                {children}
            </span>
        )
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${className}`}>
            {children}
        </span>
    )
}
