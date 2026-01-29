"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, CheckCircle2, XCircle, MinusCircle, UserX, Building2, Ticket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface RollCallEntry {
    voto: string;
    parliamentarian: {
        id: string;
        nombre_completo: string;
        partido: string;
        camara: string;
        region?: string;
        ideologia?: string;
    }
}

import { getPartyColor } from '@/lib/design-tokens'

interface VoteDetailModalProps {
    voteId: string;
    isOpen: boolean;
    onClose: () => void;
    title: string;
    boletin?: string;
}

export function VoteDetailModal({ voteId, isOpen, onClose, title, boletin }: VoteDetailModalProps) {
    const [loading, setLoading] = useState(true);
    const [rollCall, setRollCall] = useState<RollCallEntry[]>([]);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'favor' | 'contra' | 'abstencion' | 'ausente'>('all');

    useEffect(() => {
        if (isOpen && voteId) {
            setLoading(true);
            fetch(`/api/votes?id=${voteId}&roll_call=true`)
                .then(res => res.json())
                .then(data => {
                    setRollCall(data.roll_call || []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching roll call:', err);
                    setLoading(false);
                });
        }
    }, [isOpen, voteId]);

    const filteredVotes = rollCall.filter(entry => {
        const matchesSearch = entry.parliamentarian.nombre_completo.toLowerCase().includes(search.toLowerCase());
        const matchesTab = activeTab === 'all' ||
            (activeTab === 'favor' && entry.voto === 'a_favor') ||
            (activeTab === 'contra' && entry.voto === 'contra') ||
            (activeTab === 'abstencion' && entry.voto === 'abstencion') ||
            (activeTab === 'ausente' && entry.voto === 'ausente');
        return matchesSearch && matchesTab;
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">DETALLE DE VOTACIÓN</Badge>
                                {boletin && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                                        <Ticket className="w-3.5 h-3.5" />
                                        Boletín {boletin}
                                    </div>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-white line-clamp-2">{title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Search and Tabs */}
                    <div className="p-4 bg-slate-900/50 sticky top-0 z-10 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Buscar parlamentario..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {[
                                { id: 'all', label: 'Todos', icon: Building2 },
                                { id: 'favor', label: 'A Favor', icon: CheckCircle2, color: 'text-emerald-500' },
                                { id: 'contra', label: 'En Contra', icon: XCircle, color: 'text-rose-500' },
                                { id: 'abstencion', label: 'Abstenciones', icon: MinusCircle, color: 'text-slate-400' },
                                { id: 'ausente', label: 'Ausentes', icon: UserX, color: 'text-slate-600' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                        }`}
                                >
                                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : tab.color || ''}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
                            </div>
                        ) : filteredVotes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filteredVotes.map((entry, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.01 }}
                                        className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2"
                                                style={{
                                                    backgroundColor: `${getPartyColor(entry.parliamentarian.partido).bg}20`,
                                                    borderColor: getPartyColor(entry.parliamentarian.partido).bg,
                                                    color: getPartyColor(entry.parliamentarian.partido).bg
                                                }}
                                            >
                                                {entry.parliamentarian.nombre_completo.substring(0, 1)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-white leading-tight">
                                                        {entry.parliamentarian.nombre_completo}
                                                    </p>
                                                    {entry.parliamentarian.ideologia && (
                                                        <div
                                                            className="w-2 h-2 rounded-full"
                                                            title={`Ideología: ${entry.parliamentarian.ideologia}`}
                                                            style={{ backgroundColor: getPartyColor(entry.parliamentarian.partido).bg }}
                                                        />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    {entry.parliamentarian.partido} • {entry.parliamentarian.region || 'Región no disponible'}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            {entry.voto === 'a_favor' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                            {entry.voto === 'contra' && <XCircle className="w-5 h-5 text-rose-500" />}
                                            {entry.voto === 'abstencion' && <MinusCircle className="w-5 h-5 text-slate-400" />}
                                            {entry.voto === 'ausente' && <UserX className="w-5 h-5 text-slate-600" />}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-slate-500">
                                No se encontraron resultados para los filtros seleccionados.
                            </div>
                        )}
                    </div>

                    {/* Footer Summary */}
                    <div className="p-4 bg-slate-950/50 border-t border-white/5 text-xs text-slate-500 flex justify-between">
                        <span>Mostrando {filteredVotes.length} de {rollCall.length} registros</span>
                        <span>Fuente: OpenData Congreso Nacional</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
