
"use client";

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';

interface VoteOption {
    id: string;
    voto: string; // 'si', 'no', 'abstencion', 'pareo', 'ausente'
    parliamentarian: {
        id: string;
        nombre_completo: string;
        partido: string;
        camara: string;
        region: string;
        avatar?: string;
    };
}

interface HemicycleProps {
    votes: VoteOption[];
    width?: number;
    height?: number;
}

export function Hemicycle({ votes, width = 800, height = 500 }: HemicycleProps) {
    const [hoveredSeat, setHoveredSeat] = useState<VoteOption | null>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    // Color mapping
    const getColor = (voto: string) => {
        switch (voto.toLowerCase()) {
            case 'si':
            case 'a favor':
                return '#10b981'; // emerald-500
            case 'no':
            case 'en contra':
                return '#f43f5e'; // rose-500
            case 'abstencion':
                return '#eab308'; // yellow-500
            case 'ausente':
            case 'pareo':
                return '#475569'; // slate-600
            default:
                return '#475569'; // slate-600
        }
    };

    // Calculate seat positions
    const seats = useMemo(() => {
        const data = [];
        const rows = 6; // Fewer rows for better spacing
        const totalSeats = votes.length || 155;
        const cx = 400; // Fixed center for viewBox 800x500
        const cy = 450;
        const radiusStep = 45;
        const startParams = {
            gap: 2, // px gap
        };

        // Sort votes by result to group colors (optional) or by party
        // For now, let's sort by vote option to group them visually like a real visual
        // Group by vote option
        const groupedVotes = {
            'si': votes.filter(v => v.voto === 'si'),
            'no': votes.filter(v => v.voto === 'no'),
            'abstencion': votes.filter(v => v.voto === 'abstencion'),
            'ausente': votes.filter(v => v.voto === 'ausente' || v.voto === 'pareo')
        };

        const sortedVotes = [
            ...groupedVotes['si'],
            ...groupedVotes['abstencion'],
            ...groupedVotes['ausente'],
            ...groupedVotes['no']
        ];

        let currentSeatIndex = 0;

        for (let r = 0; r < rows; r++) {
            const radius = 180 + (r * radiusStep);
            const arcLength = Math.PI * radius;
            const seatsInRow = Math.floor(arcLength / 22);

            const angleStep = Math.PI / (seatsInRow + 1);

            for (let s = 0; s < seatsInRow; s++) {
                if (currentSeatIndex >= totalSeats) break;

                const angle = Math.PI - (angleStep * (s + 1));

                data.push({
                    x: cx + radius * Math.cos(angle),
                    y: cy - radius * Math.sin(angle),
                    data: sortedVotes[currentSeatIndex] || null,
                    r: 7
                });
                currentSeatIndex++;
            }
        }
        return data;
    }, [votes]);

    const legendItems = [
        { label: 'A Favor', value: 'si', color: '#10b981' },
        { label: 'En Contra', value: 'no', color: '#f43f5e' },
        { label: 'Abstención', value: 'abstencion', color: '#eab308' },
        { label: 'Ausente/Pareo', value: 'ausente', color: '#475569' },
    ];

    return (
        <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
            {/* Legend with interactive filters */}
            <div className="flex flex-wrap justify-center gap-6 mb-8 z-10">
                {legendItems.map((item) => (
                    <div
                        key={item.value}
                        className={`flex items-center gap-2 cursor-pointer transition-all duration-300 ${activeFilter && activeFilter !== item.value ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}
                        onMouseEnter={() => setActiveFilter(item.value)}
                        onMouseLeave={() => setActiveFilter(null)}
                    >
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{
                                backgroundColor: item.color,
                                boxShadow: `0 0 10px ${item.color}80`
                            }}
                        />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.label}</span>
                    </div>
                ))}
            </div>

            <svg
                viewBox="0 0 800 500"
                className="w-full h-auto drop-shadow-[0_0_30px_rgba(34,211,238,0.05)]"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <radialGradient id="seatGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </radialGradient>

                    {/* Glow filters for each color */}
                    {legendItems.map(item => (
                        <filter key={`glow-${item.value}`} id={`glow-${item.value}`} x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    ))}
                </defs>

                {/* Speaker's Table / Podium */}
                <motion.path
                    d="M 340 460 L 460 460 L 480 500 L 320 500 Z"
                    fill="#1e293b"
                    className="opacity-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                />

                {seats.map((seat, i) => {
                    const isFiltered = activeFilter && seat.data?.voto !== activeFilter && !(activeFilter === 'ausente' && (seat.data?.voto === 'pareo' || seat.data?.voto === 'ausente'));
                    const color = seat.data ? getColor(seat.data.voto) : '#334155';

                    return (
                        <g key={i}>
                            <motion.circle
                                cx={seat.x}
                                cy={seat.y}
                                r={seat.r}
                                fill={color}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: isFiltered ? 0.7 : 1,
                                    opacity: isFiltered ? 0.15 : 1,
                                    filter: isFiltered ? 'none' : `url(#glow-${seat.data?.voto === 'pareo' ? 'ausente' : seat.data?.voto})`
                                }}
                                transition={{
                                    delay: i * 0.003,
                                    duration: 0.4,
                                    scale: { duration: 0.2 },
                                    opacity: { duration: 0.2 }
                                }}
                                className="cursor-pointer"
                                onMouseEnter={() => seat.data && setHoveredSeat(seat.data)}
                                onMouseLeave={() => setHoveredSeat(null)}
                            />
                            {/* Inner highlight for premium feel */}
                            {!isFiltered && (
                                <circle
                                    cx={seat.x}
                                    cy={seat.y}
                                    r={seat.r * 0.4}
                                    fill="url(#seatGlow)"
                                    className="pointer-events-none"
                                />
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Premium Tooltip */}
            <AnimatePresence>
                {hoveredSeat && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-4 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-5 z-50 pointer-events-none ring-1 ring-white/5"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-xl font-bold text-cyan-500 shadow-inner overflow-hidden">
                                {hoveredSeat.parliamentarian.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                <div className="absolute inset-0 bg-cyan-500/5" />
                            </div>
                            <div
                                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0f172a] shadow-lg"
                                style={{ backgroundColor: getColor(hoveredSeat.voto) }}
                            />
                        </div>
                        <div className="min-w-[180px]">
                            <h4 className="font-bold text-white text-lg leading-tight mb-1">{hoveredSeat.parliamentarian.nombre_completo}</h4>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500/80 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                                    {hoveredSeat.parliamentarian.partido || 'Independiente'}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">{hoveredSeat.parliamentarian.region || 'N/A'}</span>
                            </div>
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border"
                                style={{
                                    backgroundColor: `${getColor(hoveredSeat.voto)}15`,
                                    borderColor: `${getColor(hoveredSeat.voto)}30`,
                                    color: getColor(hoveredSeat.voto)
                                }}
                            >
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getColor(hoveredSeat.voto) }} />
                                {hoveredSeat.voto === 'si' ? 'APROBÓ' : hoveredSeat.voto === 'no' ? 'RECHAZÓ' : hoveredSeat.voto.toUpperCase()}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
