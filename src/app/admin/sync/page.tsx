"use client"

import { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle2, AlertCircle, Database, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function SyncAdminPage() {
    const [syncing, setSyncing] = useState(false)
    const [results, setResults] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [year, setYear] = useState(new Date().getFullYear())

    const runSync = async () => {
        setSyncing(true)
        setError(null)
        try {
            const res = await fetch('/api/sync/all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Sync failed')
            setResults(data.results)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSyncing(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#030712] p-8 md:p-20">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white font-outfit">Control de Sincronización</h1>
                        <p className="text-slate-400 mt-2">Orquestador de datos OpenData → Supabase</p>
                    </div>
                    <Database className="w-12 h-12 text-cyan-400 opacity-20" />
                </div>

                <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-xl">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 space-y-4 w-full">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Año Legislativo
                            </label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
                            />
                        </div>
                        <Button
                            onClick={runSync}
                            disabled={syncing}
                            className="h-14 px-8 bg-cyan-600 hover:bg-cyan-50 hovrer:scale-105 transition-all text-white font-bold rounded-xl gap-3 shadow-lg shadow-cyan-500/20"
                        >
                            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Sincronizando...' : 'Iniciar Sincronización Total'}
                        </Button>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
                </Card>

                {results && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <SyncResultCard title="Parlamentarios" data={results.parliamentarians} />
                        <SyncResultCard title="Datos de Referencia" data={results.reference} />
                        <SyncResultCard title="Comisiones" data={results.committees} />
                        <SyncResultCard title="Proyectos y Votos" data={results.bills} />
                    </div>
                )}
            </div>
        </div>
    )
}

function SyncResultCard({ title, data }: { title: string, data: any }) {
    const isSuccess = data?.success || data?.count > 0 || data?.parliamentarians_synced > 0;

    return (
        <Card className="p-6 bg-white/5 border-white/10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">{title}</h3>
                {isSuccess ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                )}
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Estado</span>
                    <Badge variant={isSuccess ? 'success' : 'outline'}>
                        {isSuccess ? 'Completado' : 'Pendiente/Error'}
                    </Badge>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Registros</span>
                    <span className="text-white font-mono">{data?.count || data?.parliamentarians_synced || data?.bills_synced || 0}</span>
                </div>
            </div>
        </Card>
    )
}
