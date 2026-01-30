
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Hemicycle } from '@/components/visualizations/Hemicycle';
import { PartyBreakdown } from '@/components/visualizations/PartyBreakdown';
import { ArrowLeft, Calendar, Users, Share2, CheckCircle2, XCircle, Vote as VoteIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function VoteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [vote, setVote] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVote = async () => {
            try {
                // Ensure we include roll_call=true param
                const res = await fetch(`/api/votes?id=${params.id}&roll_call=true`);
                if (res.ok) {
                    const data = await res.json();
                    setVote(data);
                }
            } catch (error) {
                console.error("Error fetching vote details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchVote();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
            </div>
        );
    }

    if (!vote) {
        return (
            <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-white">
                <h1 className="text-2xl font-bold mb-4">Votación no encontrada</h1>
                <Link href="/votos" className="text-cyan-400 hover:underline">Volver a la lista</Link>
            </div>
        );
    }

    // Map roll call data for Hemicycle
    const hemicycleData = vote.roll_call?.map((rc: any) => ({
        id: rc.parliamentarian.id,
        voto: rc.voto,
        parliamentarian: rc.parliamentarian
    })) || [];

    const isApproved = vote.resultado === 'aprobado';

    return (
        <div className="min-h-screen bg-[#030712] text-white p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-6">
                    <Link href="/votos" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Votaciones
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className={`capitalize ${isApproved ? 'border-emerald-500 text-emerald-500' : 'border-rose-500 text-rose-500'}`}>
                                    {isApproved ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                    {vote.resultado}
                                </Badge>
                                <span className="text-slate-500 text-sm flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(vote.fecha), 'PPP', { locale: es })}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold font-outfit leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                {vote.materia}
                            </h1>
                            {vote.bill?.boletin && (
                                <p className="text-slate-400 font-mono text-sm">Boletín: {vote.bill.boletin}</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                                <Share2 className="w-4 h-4 mr-2" />
                                Compartir
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content: Hemicycle & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">

                    {/* Left: Hemicycle Visualization */}
                    <div className="lg:col-span-3 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-700" />

                        <div className="w-full flex justify-between items-center mb-12 z-10 px-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Users className="w-6 h-6 text-cyan-400" />
                                Hemaciclo de Votación
                            </h2>
                            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-950/50 px-3 py-1.5 rounded-full border border-white/5">
                                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                {hemicycleData.length} Parlamentarios
                            </div>
                        </div>

                        <div className="w-full z-10">
                            <Hemicycle votes={hemicycleData} />
                        </div>
                    </div>

                    {/* Right Side: Stats & Party Breakdown */}
                    <div className="space-y-8">
                        {/* Summary Card */}
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-2xl">
                            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                <VoteIcon className="w-5 h-5 text-cyan-400" />
                                Resultado Total
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                                    <span className="block text-[10px] font-black uppercase text-emerald-500 tracking-tighter mb-1">A Favor</span>
                                    <span className="text-3xl font-black text-white">{vote.a_favor}</span>
                                </div>
                                <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-center">
                                    <span className="block text-[10px] font-black uppercase text-rose-500 tracking-tighter mb-1">En Contra</span>
                                    <span className="text-3xl font-black text-white">{vote.contra}</span>
                                </div>
                                <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-center">
                                    <span className="block text-[10px] font-black uppercase text-yellow-500 tracking-tighter mb-1">Abstención</span>
                                    <span className="text-3xl font-black text-white">{vote.abstenciones}</span>
                                </div>
                                <div className="p-4 bg-slate-800/20 rounded-2xl border border-white/5 text-center">
                                    <span className="block text-[10px] font-black uppercase text-slate-500 tracking-tighter mb-1">Ausentes</span>
                                    <span className="text-3xl font-black text-white">{vote.ausentes + (vote.pareos || 0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Party Breakdown Analytics */}
                        <PartyBreakdown votes={hemicycleData} />

                        {/* Metadata Details */}
                        <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 text-sm text-slate-400 space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Cámara</span>
                                <span className="text-white font-bold capitalize">{vote.camara}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Quorum</span>
                                <span className="text-white font-bold">{vote.quorum || 'Mayoría Simple'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Sesión</span>
                                <span className="text-white font-mono">{vote.sesion || 'Ordinaria'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
