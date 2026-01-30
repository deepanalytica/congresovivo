"use client"

import './globals.css'
import React from 'react'
import { MotionCard } from '@/components/ui/MotionCard'
import { CountUp } from '@/components/ui/CountUp'
import { BillCard } from '@/components/legislature/BillCard'
import { ActivityFeed } from '@/components/legislature/ActivityFeed'
import { FileText, CheckCircle2, Vote, Calendar, Users, TrendingUp, Search, Bell, Settings, BarChart3, Map, User, Menu, Zap } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { VoteBreakdownChart } from '@/components/visualization/VoteBreakdownChart'
import { LegislativeTimeline } from '@/components/visualization/LegislativeTimeline'
import { Button } from '@/components/ui/button'

import { MobileMenu } from '@/components/ui/MobileMenu'

export default function HomePage() {
    const [stats, setStats] = React.useState<any>(null);
    const [bills, setBills] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function loadData() {
            try {
                const [statsRes, billsRes] = await Promise.all([
                    fetch('/api/stats'),
                    fetch('/api/bills'),
                ]);

                const statsData = await statsRes.json();
                const billsData = await billsRes.json();

                setStats(statsData);
                // Handle the wrap { bills: [...] } from the new API
                setBills((billsData.bills || billsData).slice(0, 4));
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#030712]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                    <p className="mt-4 text-slate-400">Cargando datos del Congreso...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#030712]">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Error al cargar datos del Congreso</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-cyan-500 rounded">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    const activities = bills.slice(0, 5).map(bill => ({
        id: bill.id,
        tipo: 'bill_update' as const,
        titulo: `${bill.boletin}: ${bill.titulo?.substring(0, 60)}...`,
        fecha: new Date(bill.fecha_ingreso),
        descripcion: `Nuevo proyecto ingresado al ${bill.camara_origen === 'senado' ? 'Senado' : 'Cámara'}`,
        entidad: {
            tipo: 'bill' as const,
            id: bill.id,
            nombre: bill.boletin
        },
        relevancia: 'alta' as const
    }));


    return (
        <div className="min-h-screen relative flex flex-col md:flex-row">

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full z-50 glass-panel p-4 flex justify-between items-center">
                <h1 className="font-outfit font-bold text-xl tracking-tight text-white">CONGRESO<span className="text-cyan-400">VIVO</span></h1>
                <MobileMenu />
            </div>

            {/* Sidebar Navigation */}
            <aside className="hidden md:flex flex-col w-24 h-screen sticky top-0 border-r border-white/5 bg-black/20 backdrop-blur-xl z-40 items-center py-8 gap-8">
                <Link href="/">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer">
                        <Zap className="text-white w-6 h-6 fill-current" />
                    </div>
                </Link>

                <nav className="flex-1 flex flex-col gap-6 w-full px-4">
                    <NavIcon href="/" icon={<BarChart3 />} label="Radar" active />
                    <NavIcon href="/proyectos" icon={<FileText />} label="Proyectos" />
                    <NavIcon href="/votos" icon={<Vote />} label="Votos" />
                    <NavIcon href="/parlamentarios" icon={<Users />} label="Parlamentarios" />
                    <NavIcon href="/comisiones" icon={<Calendar />} label="Comisiones" />
                    <NavIcon href="/mapa" icon={<Map />} label="Mapa" />
                </nav>

                <div className="flex flex-col gap-4">
                    <button className="p-3 rounded-xl hover:bg-white/10 transition-colors">
                        <Settings className="w-6 h-6 text-slate-400" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-rose-500 p-[2px]">
                        <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" alt="User" className="rounded-full w-full h-full" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-8 lg:p-10 pt-20 md:pt-10 overflow-hidden">
                <div className="max-w-7xl mx-auto space-y-10">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="font-outfit text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                                Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">Ciudadano</span>
                            </h1>
                            <p className="text-slate-400 text-lg">Datos en vivo del Congreso Nacional de Chile</p>
                        </div>

                        <div className="relative group w-full md:w-96">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl opacity-30 group-hover:opacity-75 blur transition duration-500"></div>
                            <div className="relative flex items-center bg-[#0a0e1a] rounded-xl px-4 py-3 border border-white/10">
                                <Search className="w-5 h-5 text-slate-400 mr-3" />
                                <input
                                    type="text"
                                    placeholder="Buscar proyectos, leyes, diputados..."
                                    className="bg-transparent border-none outline-none text-slate-200 w-full placeholder:text-slate-600 focus:ring-0"
                                />
                                <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10">
                                    <span className="text-xs text-slate-500 font-mono">⌘K</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KPI Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            label="Proyectos Activos"
                            value={stats.proyectosActivos}
                            icon={<FileText className="w-6 h-6 text-orange-400" />}
                            color="orange"
                        />
                        <StatCard
                            label="Aprobados"
                            value={stats.proyectosAprobados}
                            icon={<CheckCircle2 className="w-6 h-6 text-green-400" />}
                            color="green"
                        />
                        <StatCard
                            label="Total Proyectos"
                            value={stats.totalProyectos}
                            icon={<Vote className="w-6 h-6 text-cyan-400" />}
                            color="cyan"
                        />
                        <StatCard
                            label="Rechazados"
                            value={stats.proyectosRechazados || 0}
                            icon={<TrendingUp className="w-6 h-6 text-red-400" />}
                            color="purple"
                        />
                    </div>

                    {/* Voting Analysis Section (New Premium Content) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <VoteBreakdownChart
                            yesCount={84}
                            noCount={42}
                            abstentionCount={12}
                            absentCount={15}
                        />
                        <div className="relative group p-8 rounded-2xl bg-[#0a0e1a]/80 backdrop-blur-xl border border-white/10 flex flex-col justify-center">
                            <h3 className="font-outfit text-3xl font-bold text-white mb-4">Análisis de Votación en Sala</h3>
                            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                                Visualiza en tiempo real el comportamiento de voto por bancada, partido e individualmente.
                                Identifica patrones de consenso y disidencia en las leyes más relevantes de Chile.
                            </p>
                            <div className="flex gap-4">
                                <Button variant="premium" className="px-8">Explorar Filtros</Button>
                                <Button variant="outline">Descargar Reporte</Button>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">

                        {/* Featured Projects */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="font-outfit text-2xl font-bold flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-orange-500/20">
                                        <TrendingUp className="text-orange-400 w-6 h-6" />
                                    </div>
                                    Proyectos Recientes
                                </h3>
                                <Link href="/proyectos" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 group">
                                    Ver todos
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {bills.map((bill, i) => (
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
                            </div>

                            {/* Activity Feed */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                                <div className="relative p-8 rounded-2xl bg-[#0a0e1a]/80 backdrop-blur-xl border border-white/10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                                        <h3 className="font-outfit text-2xl font-bold text-white">Actividad Reciente</h3>
                                    </div>
                                    <ActivityFeed activities={activities} />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Chamber Distribution */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                                <div className="relative p-6 rounded-2xl bg-[#0a0e1a]/80 backdrop-blur-xl border border-white/10">
                                    <h3 className="font-outfit text-xl font-bold mb-6 flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-500/20">
                                            <BarChart3 className="text-emerald-400 w-5 h-5" />
                                        </div>
                                        Carga Legislativa
                                    </h3>
                                    <div className="space-y-6">
                                        {stats.camaraStats.map((stat: any) => (
                                            <div key={stat.camara} className="space-y-3">
                                                <div className="flex justify-between text-sm font-medium">
                                                    <span className="text-slate-300 capitalize">{stat.camara === 'camara' ? 'Cámara Diputados' : 'Senado'}</span>
                                                    <span className="text-slate-100">{stat.proyectos} proyectos</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                    <motion.div
                                                        className={`h-full ${stat.camara === 'camara' ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r from-rose-500 to-orange-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`}
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${(stat.proyectos / stats.totalProyectos) * 100}%` }}
                                                        transition={{ duration: 1.5, ease: "circOut" }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Official Sources */}
                            <div className="p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-md">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Fuentes Verificadas</h4>
                                <div className="space-y-2">
                                    <SourceLink label="Cámara de Diputados" url="https://opendata.camara.cl/" />
                                    <SourceLink label="Senado de la República" url="https://tramitacion.senado.cl/" />
                                    <SourceLink label="Biblioteca del Congreso" url="https://www.bcn.cl/" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}

function NavIcon({ icon, label, active = false, href = "/" }: { icon: React.ReactNode, label: string, active?: boolean, href?: string }) {
    return (
        <Link href={href} className={`flex flex-col items-center gap-1 group cursor-pointer ${active ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
            <div className={`p-3 rounded-xl transition-all duration-300 ${active ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'hover:bg-white/10 text-white'}`}>
                {React.cloneElement(icon as React.ReactElement, { size: 24 })}
            </div>
            <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
        </Link>
    )
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
    const gradients = {
        orange: "from-orange-500/20 to-orange-600/5",
        green: "from-green-500/20 to-green-600/5",
        cyan: "from-cyan-500/20 to-cyan-600/5",
        purple: "from-purple-500/20 to-purple-600/5"
    }

    return (
        <MotionCard className="p-6 flex items-center justify-between overflow-hidden">
            <div className={`absolute right-0 top-0 w-32 h-full bg-gradient-to-l ${gradients[color as keyof typeof gradients]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            <div className="relative z-10">
                <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
                <p className="text-4xl font-bold text-white tracking-tight">
                    <CountUp end={value} />
                </p>
            </div>
            <div className="relative z-10 p-3 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
        </MotionCard>
    )
}

function SourceLink({ label, url }: { label: string, url: string }) {
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
            <span className="text-slate-600 group-hover:text-cyan-400 transition-colors">↗</span>
        </a>
    )
}
