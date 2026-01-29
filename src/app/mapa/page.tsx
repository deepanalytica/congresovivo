"use client"

import '../globals.css'
import { LegislativeMap } from '@/components/legislature/LegislativeMap'
import { Map, ArrowLeft, Users, Building2, MapPin, Search, Filter, Palette, Mail, Award, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MotionCard } from '@/components/ui/MotionCard'
import { getPartyColor, getIdeologyFromParty } from '@/lib/constants/party-colors'

export default function MapaPage() {
    const [mapData, setMapData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRegion, setSelectedRegion] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'default' | 'party'>('default')
    const [chamberFilter, setChamberFilter] = useState<'all' | 'senado' | 'camara'>('all')
    const [selectedParliamentarian, setSelectedParliamentarian] = useState<any>(null)

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

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    {/* Visualization Mode */}
                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                        <Palette className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-500">Vista:</span>
                        <button
                            onClick={() => setViewMode('default')}
                            className={`px-3 py-1 text-xs rounded-lg transition-all ${viewMode === 'default'
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            Por región
                        </button>
                        <button
                            onClick={() => setViewMode('party')}
                            className={`px-3 py-1 text-xs rounded-lg transition-all ${viewMode === 'party'
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            Por partido
                        </button>
                    </div>

                    {/* Chamber Filter */}
                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-500">Cámara:</span>
                        <button
                            onClick={() => setChamberFilter('all')}
                            className={`px-3 py-1 text-xs rounded-lg transition-all ${chamberFilter === 'all'
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setChamberFilter('senado')}
                            className={`px-3 py-1 text-xs rounded-lg transition-all ${chamberFilter === 'senado'
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            Senado
                        </button>
                        <button
                            onClick={() => setChamberFilter('camara')}
                            className={`px-3 py-1 text-xs rounded-lg transition-all ${chamberFilter === 'camara'
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            Diputados
                        </button>
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
                                viewMode={viewMode}
                                chamberFilter={chamberFilter}
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
                                        {selectedRegion.parliamentarians
                                            .filter((p: any) => {
                                                if (chamberFilter === 'all') return true;
                                                return p.camara === chamberFilter;
                                            })
                                            .map((p: any) => {
                                                const ideology = getIdeologyFromParty(p.partido);
                                                return (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => setSelectedParliamentarian(p)}
                                                        className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                                    {p.nombre_completo}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <p className="text-xs text-slate-500">{p.partido || 'Independiente'}</p>
                                                                    <span className="text-slate-700">•</span>
                                                                    <span className="text-xs" style={{ color: getPartyColor(p.partido) }}>
                                                                        {ideology}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Badge variant="outline" className="text-[10px] py-0 h-5 ml-2">
                                                                {p.camara === 'senado' ? 'S' : 'D'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        }
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

            {/* Parliamentarian Detail Modal */}
            {selectedParliamentarian && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedParliamentarian(null)}
                >
                    <div
                        className="bg-[#0f172a] border border-white/20 rounded-2xl max-w-md w-full p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedParliamentarian(null)}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>

                        <div className="mb-6">
                            <div className="flex items-start gap-3 mb-4">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                                    style={{ backgroundColor: getPartyColor(selectedParliamentarian.partido) }}
                                >
                                    {selectedParliamentarian.nombre_completo.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white">
                                        {selectedParliamentarian.nombre_completo}
                                    </h3>
                                    <Badge className="mt-2">
                                        {selectedParliamentarian.camara === 'senado' ? 'Senador(a)' : 'Diputado(a)'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white/5 p-4 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">Partido Político</p>
                                <p className="text-white font-semibold">{selectedParliamentarian.partido || 'Independiente'}</p>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">Ideología</p>
                                <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4" style={{ color: getPartyColor(selectedParliamentarian.partido) }} />
                                    <p className="text-white font-semibold">
                                        {getIdeologyFromParty(selectedParliamentarian.partido)}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">Región</p>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-cyan-400" />
                                    <p className="text-white font-semibold">{selectedParliamentarian.region}</p>
                                </div>
                            </div>

                            {selectedParliamentarian.distrito && (
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">Distrito Electoral</p>
                                    <p className="text-white font-semibold">Distrito N°{selectedParliamentarian.distrito}</p>
                                </div>
                            )}

                            {selectedParliamentarian.email && (
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">Contacto</p>
                                    <a
                                        href={`mailto:${selectedParliamentarian.email}`}
                                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                                    >
                                        <Mail className="w-4 h-4" />
                                        <p className="text-sm">{selectedParliamentarian.email}</p>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
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
