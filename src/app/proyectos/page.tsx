'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, RefreshCw, TrendingUp, FileText, Clock, CheckCircle } from 'lucide-react';
import { BillCard } from '@/components/legislature/BillCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Bill {
    id: string;
    boletin: string;
    titulo: string;
    estado: string;
    etapa_actual?: string;
    urgencia?: string;
    fecha_ingreso: string;
    camara_origen: string;
    iniciativa: string;
    bill_authors: any[];
}

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function BillsPage() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        enTramite: 0,
        aprobados: 0,
        rechazados: 0
    });

    useEffect(() => {
        fetchBills();
    }, []);

    useEffect(() => {
        calculateStats();
    }, [bills]);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/bills');
            if (response.ok) {
                const data = await response.json();
                setBills(data.bills || []);
            }
        } catch (error) {
            console.error('Error fetching bills:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        setStats({
            total: bills.length,
            enTramite: bills.filter(b => ['en_tramite', 'primer_tramite', 'segundo_tramite'].includes(b.estado || '')).length,
            aprobados: bills.filter(b => ['aprobado', 'promulgado'].includes(b.estado || '')).length,
            rechazados: bills.filter(b => ['rechazado', 'archivado'].includes(b.estado || '')).length
        });
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const response = await fetch('/api/sync/bills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year: new Date().getFullYear() })
            });
            const result = await response.json();
            if (result.success || result.bills_synced > 0) {
                await fetchBills();
            }
        } catch (error) {
            console.error('Error syncing:', error);
        } finally {
            setSyncing(false);
        }
    };

    const filteredBills = bills.filter((bill: Bill) => {
        const matchesSearch = (bill.titulo?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (bill.boletin || '').includes(searchQuery);
        const matchesStatus = !statusFilter || bill.estado === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusChartData = [
        { name: 'En Trámite', value: stats.enTramite, color: '#f59e0b' },
        { name: 'Aprobados', value: stats.aprobados, color: '#22c55e' },
        { name: 'Rechazados', value: stats.rechazados, color: '#ef4444' },
    ].filter(d => d.value > 0);

    const StatCard = ({ icon: Icon, label, value, gradient, color }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-2xl"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-40`} />
            <div className="absolute inset-0 bg-[#0a0e1a]/80 backdrop-blur-xl border border-white/10 rounded-2xl" />

            <div className="relative p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-${color}-500/20 border border-${color}-500/30 group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 text-${color}-400`} />
                    </div>
                    <span className="text-3xl font-bold text-white font-outfit">{value}</span>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                    <div className={`h-1 w-12 bg-${color}-500/50 rounded-full group-hover:w-full transition-all duration-700`} />
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#030712] relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] -z-10"></div>
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>

            <main className="p-6 md:p-12 lg:px-20 pt-10">
                <div className="max-w-7xl mx-auto space-y-12">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest inline-block">
                                Monitor Legislativo
                            </div>
                            <h1 className="font-outfit text-5xl md:text-6xl font-bold text-white tracking-tight">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Proyectos</span> de Ley
                            </h1>
                            <p className="text-slate-400 text-lg max-w-2xl">
                                Seguimiento en tiempo real de toda la actividad legislativa en el Congreso Nacional de Chile.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleSync}
                                disabled={syncing}
                                variant="premium"
                                className="h-12 px-6 rounded-xl gap-2 font-bold"
                            >
                                <RefreshCw className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
                                {syncing ? 'Sincronizando...' : 'Actualizar Datos'}
                            </Button>
                        </div>
                    </div>

                    {/* Stats & Visualizations Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* KPI Cards */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <StatCard
                                icon={FileText}
                                label="Iniciativas Totales"
                                value={stats.total}
                                gradient="from-blue-500/20 to-transparent"
                                color="blue"
                            />
                            <StatCard
                                icon={Clock}
                                label="Leyes en Trámite"
                                value={stats.enTramite}
                                gradient="from-orange-500/20 to-transparent"
                                color="orange"
                            />
                            <StatCard
                                icon={CheckCircle}
                                label="Normas Aprobadas"
                                value={stats.aprobados}
                                gradient="from-emerald-500/20 to-transparent"
                                color="emerald"
                            />
                            <StatCard
                                icon={TrendingUp}
                                label="Proyectos Archivados"
                                value={stats.rechazados}
                                gradient="from-red-500/20 to-transparent"
                                color="red"
                            />
                        </div>

                        {/* Chart Area */}
                        <div className="relative group p-8 rounded-2xl bg-[#0a0e1a]/80 backdrop-blur-xl border border-white/10 overflow-hidden">
                            <h3 className="text-lg font-bold text-white mb-6 font-outfit">Distribución de Estados</h3>
                            <div className="h-[180px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusChartData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {statusChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#0a0e1a',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="relative group p-6 rounded-2xl bg-[#0a0e1a]/80 backdrop-blur-xl border border-white/10">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex-1 relative w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar por título o boletín..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                            </div>
                            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 whitespace-nowrap overflow-x-auto max-w-full">
                                <button
                                    onClick={() => setStatusFilter(null)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${!statusFilter ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => setStatusFilter('en_tramite')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${statusFilter === 'en_tramite' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    En Trámite
                                </button>
                                <button
                                    onClick={() => setStatusFilter('aprobado')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${statusFilter === 'aprobado' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    Aprobado
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bills Grid */}
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                            >
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-80 bg-white/5 rounded-2xl border border-white/10 animate-pulse" />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                layout
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                            >
                                {filteredBills.map((bill) => (
                                    <BillCard
                                        key={bill.id}
                                        id={bill.id}
                                        boletin={bill.boletin}
                                        titulo={bill.titulo}
                                        estado={bill.estado}
                                        etapa={bill.etapa_actual}
                                        urgencia={bill.urgencia}
                                        fechaIngreso={bill.fecha_ingreso}
                                        camaraOrigen={bill.camara_origen}
                                        tipoIniciativa={bill.iniciativa}
                                        autores={bill.bill_authors?.length || 0}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!loading && filteredBills.length === 0 && (
                        <div className="py-32 text-center space-y-6">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 text-slate-700">
                                <FileText className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-slate-400 font-outfit">Sin hallazgos</h3>
                                <p className="text-slate-600">No hay proyectos que coincidan con los criterios actuales.</p>
                            </div>
                            <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter(null); }}>
                                Restaurar Filtros
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
