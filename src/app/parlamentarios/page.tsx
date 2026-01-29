"use client"

import './../globals.css'
import { ParliamentarianCard } from '@/components/legislature/ParliamentarianCard'
import { Users, Filter, Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function ParlamentariosPage() {
    const [parlamentarios, setParlamentarios] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [camaraFilter, setCamaraFilter] = useState('all')
    const [ideologyFilter, setIdeologyFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchParls = async () => {
            setLoading(true)
            try {
                const res = await fetch('/api/parliamentarians')
                const data = await res.json()
                setParlamentarios(data)
            } catch (err) {
                console.error('Error fetching parliamentarians:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchParls()
    }, [])

    const filteredParls = parlamentarios.filter(p => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            p.nombre_completo.toLowerCase().includes(query) ||
            p.partido.toLowerCase().includes(query) ||
            p.region?.toLowerCase().includes(query);

        const matchesCamara = camaraFilter === 'all' || p.camara === camaraFilter;

        // Match ideology if needed, currently data might be mixed case or null
        const matchesIdeology = ideologyFilter === 'all' ||
            (p.ideologia && p.ideologia.toLowerCase() === ideologyFilter.toLowerCase());

        return matchesSearch && matchesCamara && matchesIdeology;
    })

    return (
        <div className="min-h-screen bg-[#030712] p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <ArrowLeft className="text-slate-400" />
                        </Link>
                        <div>
                            <h1 className="font-outfit text-4xl font-bold text-white flex items-center gap-3">
                                <Users className="text-cyan-400" />
                                Parlamentarios
                            </h1>
                            <p className="text-slate-400 mt-2">Senadores y Diputados en ejercicio</p>
                        </div>
                    </div>

                    <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Activos</p>
                        <p className="text-xl font-bold text-white font-outfit">{filteredParls.length}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, partido o región..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                            <Filter className="w-4 h-4 text-slate-500" />
                            <select
                                value={camaraFilter}
                                onChange={(e) => setCamaraFilter(e.target.value)}
                                className="bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer"
                            >
                                <option value="all">Todas las Cámaras</option>
                                <option value="senado">Senado</option>
                                <option value="camara">Diputados</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                            <Filter className="w-4 h-4 text-slate-500" />
                            <select
                                value={ideologyFilter}
                                onChange={(e) => setIdeologyFilter(e.target.value)}
                                className="bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer"
                            >
                                <option value="all">Todas las Ideologías</option>
                                <option value="izquierda">Izquierda</option>
                                <option value="centro-izquierda">Centro-Izquierda</option>
                                <option value="centro">Centro</option>
                                <option value="centro-derecha">Centro-Derecha</option>
                                <option value="derecha">Derecha</option>
                                <option value="independiente">Independiente</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-48 bg-white/5 rounded-2xl border border-white/10" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredParls.map((parl) => (
                            <ParliamentarianCard key={parl.id} parliamentarian={parl} />
                        ))}
                    </div>
                )}

                {!loading && filteredParls.length === 0 && (
                    <div className="py-20 text-center">
                        <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-400">No se encontraron parlamentarios</h3>
                        <p className="text-slate-600 mt-2">Intenta cambiar los filtros de búsqueda</p>
                    </div>
                )}
            </div>
        </div>
    )
}
