"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ParliamentarianCard } from '@/components/legislature/ParliamentarianCard'
import { Users, Filter, Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Parliamentarian {
    id: string;
    nombre_completo: string;
    partido: string;
    camara: string;
    region: string;
    ideologia: string;
}

export default function ParlamentariosPage() {
    const [parlamentarios, setParlamentarios] = useState<Parliamentarian[]>([])
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

    const filteredParls = parlamentarios.filter((p: Parliamentarian) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            p.nombre_completo.toLowerCase().includes(query) ||
            p.partido.toLowerCase().includes(query) ||
            p.region?.toLowerCase().includes(query);

        const matchesCamara = camaraFilter === 'all' || p.camara === camaraFilter;

        const matchesIdeology = ideologyFilter === 'all' ||
            (p.ideologia && p.ideologia.toLowerCase() === ideologyFilter.toLowerCase());

        return matchesSearch && matchesCamara && matchesIdeology;
    })

    return (
        <div className="min-h-screen bg-[#030712] relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10"></div>

            <main className="p-6 md:p-12 lg:px-20 pt-10">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Link href="/">
                                    <Button variant="outline" size="icon" className="rounded-xl">
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                </Link>
                                <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest">
                                    Poder Legislativo
                                </div>
                            </div>
                            <h1 className="font-outfit text-5xl md:text-6xl font-bold text-white tracking-tight">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Nuestro</span> Congreso
                            </h1>
                            <p className="text-slate-400 text-lg max-w-2xl">
                                Conoce a los representantes que legislan por Chile. Filtra por cámara, partido o ideología política.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-center min-w-[140px]">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total</p>
                                <p className="text-3xl font-bold text-white font-outfit">{filteredParls.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Controls */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                        <div className="lg:col-span-2 relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
                            <div className="relative flex items-center bg-[#0a0e1a]/80 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3">
                                <Search className="w-5 h-5 text-slate-500 mr-3" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, partido o región..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none outline-none text-slate-200 w-full placeholder:text-slate-600 focus:ring-0"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <select
                                value={camaraFilter}
                                onChange={(e) => setCamaraFilter(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:bg-white/10 focus:border-cyan-500/50 outline-none transition-all cursor-pointer appearance-none"
                            >
                                <option value="all">Todas las Cámaras</option>
                                <option value="senado">Senado</option>
                                <option value="camara">Diputados</option>
                            </select>
                            <select
                                value={ideologyFilter}
                                onChange={(e) => setIdeologyFilter(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:bg-white/10 focus:border-cyan-500/50 outline-none transition-all cursor-pointer appearance-none"
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

                    {/* Results Grid */}
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                            >
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="h-72 bg-white/5 rounded-2xl border border-white/10 animate-pulse delay-[i*100ms]" />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                layout
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                            >
                                {filteredParls.map((parl) => (
                                    <ParliamentarianCard key={parl.id} parliamentarian={parl} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!loading && filteredParls.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-32 text-center space-y-6"
                        >
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                                <Users className="w-10 h-10 text-slate-700" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-slate-400 font-outfit">Sin resultados</h3>
                                <p className="text-slate-600">No encontramos parlamentarios que coincidan con tu búsqueda.</p>
                            </div>
                            <Button variant="outline" onClick={() => { setSearchQuery(''); setCamaraFilter('all'); setIdeologyFilter('all'); }}>
                                Limpiar Filtros
                            </Button>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    )
}
