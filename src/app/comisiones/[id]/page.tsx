
import React from 'react';
import { notFound } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Calendar, Mail, Phone, Building2, User, Globe } from 'lucide-react';
import Link from 'next/link';
import { MotionCard } from '@/components/ui/MotionCard';

export default async function CommitteeDetailPage({ params }: { params: { id: string } }) {
    const supabase = getServerSupabase();

    // Fetch Committee Details
    const { data: committee } = await supabase
        .from('committees')
        .select('*')
        .eq('id', params.id)
        .single();

    if (!committee) {
        // Try looking up by external_id just in case
        const { data: committeeExt } = await supabase
            .from('committees')
            .select('*')
            .eq('external_id', params.id)
            .single();

        if (!committeeExt) return notFound();
    }

    // Fetch Members (Might be empty)
    const { data: members } = await supabase
        .from('committee_members')
        .select(`
            id,
            role,
            parliamentarian:parliamentarians (
                id,
                nombre_completo,
                partido,
                region,
                avatar
            )
        `)
        .eq('committee_id', committee.id);

    const isSenate = committee.camara === 'senado';
    const accentColor = isSenate ? 'text-amber-500' : 'text-cyan-500';
    const bgAccent = isSenate ? 'bg-amber-500/10 border-amber-500/20' : 'bg-cyan-500/10 border-cyan-500/20';

    return (
        <div className="min-h-screen bg-[#030712] p-6 md:p-10 select-none">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">

                {/* Header */}
                <div className="space-y-4">
                    <Link
                        href="/comisiones"
                        className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Comisiones
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                                <Badge className={`${bgAccent} ${isSenate ? 'text-amber-400' : 'text-cyan-400'} uppercase hover:${bgAccent}`}>
                                    {isSenate ? 'Senado' : 'Cámara de Diputados'}
                                </Badge>
                                <Badge variant="outline" className="border-white/10 text-slate-400 uppercase">
                                    {committee.tipo}
                                </Badge>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-white font-outfit leading-tight">
                                {committee.nombre}
                            </h1>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[200px]">
                            {committee.email && (
                                <a
                                    href={`mailto:${committee.email}`}
                                    className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                                >
                                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                                        <Mail className="h-4 w-4 text-slate-400 group-hover:text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Email</span>
                                        <span className="text-sm text-slate-300 group-hover:text-white truncate max-w-[150px]">
                                            {committee.email}
                                        </span>
                                    </div>
                                </a>
                            )}
                            {committee.telefono && (
                                <a
                                    href={`tel:${committee.telefono}`}
                                    className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                                >
                                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                                        <Phone className="h-4 w-4 text-slate-400 group-hover:text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Teléfono</span>
                                        <span className="text-sm text-slate-300 group-hover:text-white">
                                            {committee.telefono}
                                        </span>
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <MotionCard className="p-8 border-white/10">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${bgAccent}`}>
                            <Building2 className={`h-6 w-6 ${accentColor}`} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">Sobre esta comisión</h3>
                            <p className="text-slate-400 leading-relaxed text-lg">
                                {committee.descripcion || "No hay descripción disponible para esta comisión."}
                            </p>
                        </div>
                    </div>
                </MotionCard>

                {/* Integration / Members Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Users className={accentColor} />
                            Integrantes
                            <span className="text-sm font-normal text-slate-500 ml-2">
                                ({members?.length || 0})
                            </span>
                        </h2>
                    </div>

                    {members && members.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {members.map((member: any) => (
                                <Link key={member.id} href={`/parlamentarios/${member.parliamentarian.id}`}>
                                    <MotionCard className="p-4 flex items-center gap-4 hover:border-cyan-500/30 group cursor-pointer transition-all">
                                        <div className="h-12 w-12 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                                            {member.parliamentarian.avatar ? (
                                                <img src={member.parliamentarian.avatar} alt={member.parliamentarian.nombre_completo} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-lg">
                                                    {member.parliamentarian.nombre_completo.substring(0, 2)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                {member.parliamentarian.nombre_completo}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {member.role === 'president' ? 'Presidente' : 'Integrante'} • {member.parliamentarian.partido}
                                            </p>
                                        </div>
                                    </MotionCard>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="h-8 w-8 text-slate-600" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Integrantes no disponibles</h3>
                            <p className="text-slate-400 max-w-md mx-auto">
                                La información de los integrantes no se ha podido sincronizar debido a problemas temporales con la fuente de datos oficial (API OpenData).
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
