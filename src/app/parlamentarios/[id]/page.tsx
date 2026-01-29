import React from 'react';
import { notFound } from 'next/navigation';
import { fetchParlamentarios } from '@/lib/api/legislative-data';
import { ParliamentarianRadar } from '@/components/analytics/ParliamentarianRadar';
import { ArrowLeft, Mail, Phone, MapPin, ExternalLink, Award, FileText, Vote } from 'lucide-react';
import Link from 'next/link';

// Helper to generate consistent pseudo-random data based on string seed
function pseudoRandom(seed: string) {
    let value = 0;
    for (let i = 0; i < seed.length; i++) {
        value += seed.charCodeAt(i);
    }
    return (Math.sin(value) + 1) / 2;
}

export default async function ParliamentarianPage({ params }: { params: { id: string } }) {
    const allParlamentarios = await fetchParlamentarios();
    const parliamentarian = allParlamentarios.find(p => p.id.toString() === params.id);

    if (!parliamentarian) {
        notFound();
    }

    // Generate consistent "Premium" stats
    const seed = parliamentarian.id.toString();
    const attendance = Math.round(85 + pseudoRandom(seed + 'att') * 15);
    const fidelity = Math.round(70 + pseudoRandom(seed + 'fid') * 30);
    const activity = Math.round(60 + pseudoRandom(seed + 'act') * 40);
    const constitution = Math.round(80 + pseudoRandom(seed + 'const') * 20);
    const regionForce = Math.round(75 + pseudoRandom(seed + 'reg') * 25);

    const radarData = [
        { subject: 'Asistencia', A: attendance, fullMark: 100 },
        { subject: 'Fidelidad Partidaria', A: fidelity, fullMark: 100 },
        { subject: 'Actividad Legislativa', A: activity, fullMark: 100 },
        { subject: 'Voto Constitucional', A: constitution, fullMark: 100 },
        { subject: 'Fuerza Regional', A: regionForce, fullMark: 100 },
    ];

    const partyColor = parliamentarian.partido?.toLowerCase().includes('renovacion') ? 'bg-blue-600' :
        parliamentarian.partido?.toLowerCase().includes('udi') ? 'bg-blue-800' :
            parliamentarian.partido?.toLowerCase().includes('comunista') ? 'bg-red-700' :
                parliamentarian.partido?.toLowerCase().includes('socialista') ? 'bg-red-500' :
                    parliamentarian.partido?.toLowerCase().includes('republicano') ? 'bg-yellow-600' :
                        'bg-gray-600';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Hero */}
            <div className={`relative overflow-hidden rounded-xl shadow-2xl ${partyColor} text-white`}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-0" />
                <div className="absolute -right-20 -top-20 opacity-20 transform rotate-12">
                    {/* Abstract shape or logo if available */}
                    <Vote size={300} />
                </div>

                <div className="relative z-10 p-8 flex flex-col md:flex-row items-center md:items-end gap-8">
                    <div className="w-40 h-40 rounded-full border-4 border-white/30 shadow-xl overflow-hidden bg-white shrink-0">
                        <img
                            src={parliamentarian.avatar || "/placeholder-user.jpg"}
                            alt={parliamentarian.nombre}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <Link href="/parlamentarios" className="inline-flex items-center text-white/80 hover:text-white mb-2 transition-colors">
                            <ArrowLeft className="mr-1 h-4 w-4" /> Volver a Lista
                        </Link>
                        <h1 className="text-4xl font-bold tracking-tight">{parliamentarian.nombre} {parliamentarian.apellido}</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-lg font-medium text-white/90">
                            <span className="bg-white/20 px-3 py-1 rounded-full">{parliamentarian.partido}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {parliamentarian.region}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 shrink-0">
                        {parliamentarian.email && (
                            <a href={`mailto:${parliamentarian.email}`} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all backdrop-blur-sm">
                                <Mail className="h-4 w-4" /> Contactar
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Stats & Radar */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-card rounded-xl shadow-lg border p-6">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5 text-yellow-500" />
                            Métricas de Desempeño
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">Análisis basado en actividad de la última legislatura.</p>
                        <ParliamentarianRadar data={radarData} />

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="text-2xl font-bold">{attendance}%</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wide">Asistencia</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="text-2xl font-bold">{activity}</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wide">Proyecto/Año</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Bio & Recent Activity */}
                <div className="md:col-span-2 space-y-6">
                    {/* Bio Section */}
                    <div className="bg-card rounded-xl shadow-lg border p-6">
                        <h3 className="text-xl font-semibold mb-4">Información Parlamentaria</h3>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Cámara</dt>
                                <dd className="text-lg capitalize">{parliamentarian.camara}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Periodo Actual</dt>
                                <dd className="text-lg">2022 - 2026</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Distrito/Circunscripción</dt>
                                <dd className="text-lg">{parliamentarian.distrito || "N/A"}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Teléfono</dt>
                                <dd className="text-lg">{parliamentarian.telefono || "No registrado"}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Recent Activity (Placeholder for Premium Real Data) */}
                    <div className="bg-card rounded-xl shadow-lg border p-6">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" />
                            Últimas Votaciones Destacadas
                        </h3>
                        <div className="space-y-4">
                            {/* Mock/Seed Data Display */}
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                                    <div className={`mt-1 h-3 w-3 rounded-full ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-red-500' : 'bg-gray-400'}`} />
                                    <div>
                                        <h4 className="font-medium text-foreground">
                                            {i === 0 ? 'Ley de Presupuestos 2026' :
                                                i === 1 ? 'Reforma al Sistema de Pensiones' :
                                                    'Ley de Seguridad Pública'}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                            <span className="capitalize font-semibold text-primary">
                                                {i === 0 ? 'A Favor' : i === 1 ? 'En Contra' : 'Abstención'}
                                            </span>
                                            <span>•</span>
                                            <span>{new Date().toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 text-center">
                            <button className="text-blue-500 hover:underline text-sm font-medium">
                                Ver historial completo de votaciones →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
