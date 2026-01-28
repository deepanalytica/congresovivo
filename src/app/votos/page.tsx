"use client"

import '../globals.css'
import { VoteCard } from '@/components/legislature/VoteCard'
import { Vote, ArrowLeft, Filter, Search } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function VotosPage() {
    const [votes, setVotes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [camaraFilter, setCamaraFilter] = useState('all')
    const [resultFilter, setResultFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchVotes = async () => {
            setLoading(true)
            try {
                let url = '/api/votes?limit=100'
                if (camaraFilter !== 'all') url += `&camara=${camaraFilter}`
                if (resultFilter !== 'all') url += `&resultado=${resultFilter}`

                const res = await fetch(url)
                const data = await res.json()
                setVotes(data)
            } catch (err) {
                console.error('Error fetching votes:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchVotes()
    }, [camaraFilter, resultFilter])

    const filteredVotes = votes.filter(v =>
        v.materia.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.bill?.boletin.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
                                <Vote className="text-cyan-400" />
                                Votaciones
                            </h1>
                            <p className="text-slate-400 mt-2">Historial de votaciones en el Congreso</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-4">
                        <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Registradas</p>
                            <p className="text-xl font-bold text-white font-outfit">{votes.length}</p>
                        </div>
                        <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Aprobadas</p>
                            <p className="text-xl font-bold text-emerald-500 font-outfit">
                                {votes.filter(v => v.resultado === 'aprobado').length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar por materia o boletín..."
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
                                <option value="camara">Diputados</option>
                                <option value="senado">Senado</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                            <Filter className="w-4 h-4 text-slate-500" />
                            <select
                                value={resultFilter}
                                onChange={(e) => setResultFilter(e.target.value)}
                                className="bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer"
                            >
                                <option value="all">Todos los resultados</option>
                                <option value="aprobado">Aprobados</option>
                                <option value="rechazado">Rechazados</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-white/5 rounded-2xl border border-white/10" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVotes.map((vote) => (
                            <VoteCard key={vote.id} vote={vote} />
                        ))}
                    </div>
                )}

                {!loading && filteredVotes.length === 0 && (
                    <div className="py-20 text-center">
                        <Vote className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-400">No se encontraron votaciones</h3>
                        <p className="text-slate-600 mt-2">Prueba ajustando los filtros o la búsqueda</p>
                    </div>
                )}
            </div>
        </div>
    )
}
