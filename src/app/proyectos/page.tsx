"use client"

import '../globals.css'
import React from 'react'
import { MotionCard } from '@/components/ui/MotionCard'
import { BillCard } from '@/components/legislature/BillCard'
import { FileText, TrendingUp, Filter, Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ProyectosPage() {
    const [bills, setBills] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState('todos');

    React.useEffect(() => {
        async function loadBills() {
            try {
                const res = await fetch('/api/bills');
                const data = await res.json();
                setBills(data);
            } catch (error) {
                console.error('Error loading bills:', error);
            } finally {
                setLoading(false);
            }
        }
        loadBills();
    }, []);

    const filteredBills = filter === 'todos'
        ? bills
        : bills.filter(b => b.estado === filter);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#030712]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                    <p className="mt-4 text-slate-400">Cargando proyectos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030712] p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <ArrowLeft className="text-slate-400" />
                        </Link>
                        <div>
                            <h1 className="font-outfit text-4xl font-bold text-white flex items-center gap-3">
                                <FileText className="text-cyan-400" />
                                Proyectos de Ley
                            </h1>
                            <p className="text-slate-400 mt-2">Todos los proyectos legislativos en tramitación</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar proyectos..."
                                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <MotionCard className="p-6">
                    <div className="flex items-center gap-4 flex-wrap">
                        <Filter className="text-slate-400" />
                        <button
                            onClick={() => setFilter('todos')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'todos' ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                        >
                            Todos ({bills.length})
                        </button>
                        <button
                            onClick={() => setFilter('ingreso')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'ingreso' ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                        >
                            Ingreso
                        </button>
                        <button
                            onClick={() => setFilter('comision')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'comision' ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                        >
                            En Comisión
                        </button>
                        <button
                            onClick={() => setFilter('segundo_tramite')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'segundo_tramite' ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                        >
                            Segundo Trámite
                        </button>
                        <button
                            onClick={() => setFilter('aprobado')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'aprobado' ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                        >
                            Aprobados
                        </button>
                    </div>
                </MotionCard>

                {/* Bills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBills.map((bill, i) => (
                        <motion.div
                            key={bill.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <BillCard bill={bill} />
                        </motion.div>
                    ))}
                </div>

                {filteredBills.length === 0 && (
                    <div className="text-center py-20">
                        <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No se encontraron proyectos con este filtro</p>
                    </div>
                )}
            </div>
        </div>
    )
}
