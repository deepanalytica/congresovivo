
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Hemicycle } from '@/components/visualizations/Hemicycle';
import { ArrowLeft, Calendar, Vote, Users, Share2, CheckCircle2, XCircle } from 'lucide-react';
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
                    <div className="lg:col-span-3 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent pointer-events-none" />

                        <h2 className="text-xl font-bold mb-8 text-slate-300 flex items-center gap-2 z-10">
                            <Users className="w-5 h-5 text-cyan-400" />
                            Distribución de Votos
                        </h2>

                        <div className="w-full overflow-x-auto flex justify-center z-10">
                            <Hemicycle votes={hemicycleData} width={800} height={400} />
                        </div>

                        {/* Legend */}
                        <div className="flex gap-6 mt-8 z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-sm text-slate-400">A Favor</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500" />
                                <span className="text-sm text-slate-400">En Contra</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span className="text-sm text-slate-400">Abstención</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-600" />
                                <span className="text-sm text-slate-400">Ausente/Pareo</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Stats & Summary */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <h3 className="font-bold text-slate-200 mb-4">Resumen</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                    <span className="text-emerald-500 font-medium">A Favor</span>
                                    <span className="text-2xl font-bold text-white">{vote.a_favor}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                                    <span className="text-rose-500 font-medium">En Contra</span>
                                    <span className="text-2xl font-bold text-white">{vote.contra}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                    <span className="text-yellow-500 font-medium">Abstención</span>
                                    <span className="text-2xl font-bold text-white">{vote.abstenciones}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-700/10 rounded-lg border border-slate-700/20">
                                    <span className="text-slate-400 font-medium">Ausentes</span>
                                    <span className="text-2xl font-bold text-white">{vote.ausentes + (vote.pareos || 0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Mini metadata card */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-sm text-slate-400 space-y-3">
                            <div className="flex justify-between">
                                <span>Cámara:</span>
                                <span className="text-white capitalize">{vote.camara}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Quorum:</span>
                                <span className="text-white">{vote.quorum || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>ID Votación:</span>
                                <span className="font-mono text-xs">{vote.external_id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
