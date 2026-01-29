'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, RefreshCw, TrendingUp, FileText, Clock, CheckCircle } from 'lucide-react';
import { BillCard } from '@/components/legislature/BillCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Bill {
    id: string;
    bulletin_number: string;
    title: string;
    status: string;
    current_stage?: string;
    urgency?: string;
    entry_date: string;
    chamber_origin: string;
    initiative_type: string;
    bill_authors: any[];
}

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
        calculateStats();
    }, []);

    const fetchBills = async () => {
        setLoading(true);
        try {
            // TODO: Create /api/bills endpoint
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
        // TODO: Calculate from actual data
        setStats({
            total: bills.length,
            enTramite: bills.filter(b => b.status === 'en_tramite').length,
            aprobados: bills.filter(b => b.status === 'aprobado').length,
            rechazados: bills.filter(b => b.status === 'rechazado').length
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

    const filteredBills = bills.filter(bill => {
        const matchesSearch = bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bill.bulletin_number.includes(searchQuery);
        const matchesStatus = !statusFilter || bill.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const StatCard = ({ icon: Icon, label, value, gradient }: any) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-xl"
        >
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-950/80 backdrop-blur-xl" />
            <div className={`absolute inset-0 ${gradient}`} />
            <div className="absolute inset-0 border border-white/10 rounded-xl" />

            <div className="relative p-6 space-y-2">
                <div className="flex items-center justify-between">
                    <Icon className="h-8 w-8 text-white" />
                    <span className="text-3xl font-bold text-white">{value}</span>
                </div>
                <p className="text-sm text-gray-300">{label}</p>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Proyectos de Ley
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Todos los proyectos legislativos con datos actualizados
                        </p>
                    </div>
                    <Button
                        onClick={handleSync}
                        disabled={syncing}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Sincronizando...' : 'Sincronizar'}
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={FileText}
                        label="Total Proyectos"
                        value={stats.total}
                        gradient="bg-gradient-to-br from-blue-500/10 to-purple-500/5"
                    />
                    <StatCard
                        icon={Clock}
                        label="En Trámite"
                        value={stats.enTramite}
                        gradient="bg-gradient-to-br from-yellow-500/10 to-orange-500/5"
                    />
                    <StatCard
                        icon={CheckCircle}
                        label="Aprobados"
                        value={stats.aprobados}
                        gradient="bg-gradient-to-br from-green-500/10 to-emerald-500/5"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Rechazados"
                        value={stats.rechazados}
                        gradient="bg-gradient-to-br from-red-500/10 to-pink-500/5"
                    />
                </div>

                {/* Search & Filters */}
                <div className="relative overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-950/80 backdrop-blur-xl" />
                    <div className="absolute inset-0 border border-white/10 rounded-xl" />

                    <div className="relative p-6 space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por título o boletín..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-400">Estado:</span>
                            <Button
                                variant={statusFilter === null ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter(null)}
                                className="rounded-full"
                            >
                                Todos
                            </Button>
                            <Button
                                variant={statusFilter === 'en_tramite' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('en_tramite')}
                                className="rounded-full"
                            >
                                En Trámite
                            </Button>
                            <Button
                                variant={statusFilter === 'aprobado' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('aprobado')}
                                className="rounded-full"
                            >
                                Aprobado
                            </Button>
                            <Button
                                variant={statusFilter === 'rechazado' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('rechazado')}
                                className="rounded-full"
                            >
                                Rechazado
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bills Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-400" />
                        <p className="text-gray-400">Cargando proyectos...</p>
                    </div>
                ) : filteredBills.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400 text-lg">No se encontraron proyectos</p>
                        <Button onClick={handleSync} className="mt-4" disabled={syncing}>
                            Sincronizar Proyectos
                        </Button>
                    </div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: { staggerChildren: 0.05 }
                            }
                        }}
                    >
                        {filteredBills.map((bill) => (
                            <BillCard
                                key={bill.id}
                                id={bill.id}
                                boletin={bill.bulletin_number}
                                titulo={bill.title}
                                estado={bill.status}
                                etapa={bill.current_stage}
                                urgencia={bill.urgency}
                                fechaIngreso={bill.entry_date}
                                camaraOrigen={bill.chamber_origin}
                                tipoIniciativa={bill.initiative_type}
                                autores={bill.bill_authors?.length || 0}
                            />
                        ))}
                    </motion.div>
                )}

                {/* Results Count */}
                {!loading && filteredBills.length > 0 && (
                    <div className="text-center text-gray-400">
                        Mostrando {filteredBills.length} de {bills.length} proyectos
                    </div>
                )}
            </div>
        </div>
    );
}
