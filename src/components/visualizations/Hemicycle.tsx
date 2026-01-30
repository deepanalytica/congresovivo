
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
            default:
                return '#475569'; // slate-600
        }
    };

    // Calculate seat positions
    const seats = useMemo(() => {
        const data = [];
        const rows = 8; // Number of semicircles
        const totalSeats = votes.length || 155; // Default to full chamber if empty
        const cx = width / 2;
        const cy = height - 50;
        const radiusStep = (height - 100) / rows;
        const startParams = {
            gap: 2, // px gap
        };

        // Sort votes by result to group colors (optional) or by party
        // For now, let's sort by vote option to group them visually like a real visual
        const sortedVotes = [...votes].sort((a, b) => a.voto.localeCompare(b.voto));

        let currentSeatIndex = 0;

        for (let r = 0; r < rows; r++) {
            const radius = 150 + (r * radiusStep); // Core radius
            // Calculate number of seats in this row proportional to radius (circumference)
            // Arc length = PI * r. Seat width approx 15px.
            const arcLength = Math.PI * radius;
            const seatsInRow = Math.floor(arcLength / 25); // 25px per seat space

            const angleStep = Math.PI / (seatsInRow + 1);

            for (let s = 0; s < seatsInRow; s++) {
                if (currentSeatIndex >= totalSeats) break;

                const angle = Math.PI - (angleStep * (s + 1)); // Start from left (PI to 0)

                data.push({
                    x: cx + radius * Math.cos(angle),
                    y: cy - radius * Math.sin(angle),
                    data: sortedVotes[currentSeatIndex] || null, // Map vote data if available
                    r: 8 // Dot radius
                });
                currentSeatIndex++;
            }
        }
        return data;
    }, [votes, width, height]);

    return (
        <div className="relative flex flex-col items-center">
            <svg width={width} height={height} className="overflow-visible">
                {/* Podium / Speaker Area */}
                <path
                    d={`M ${width / 2 - 60} ${height - 40} L ${width / 2 + 60} ${height - 40} L ${width / 2 + 80} ${height} L ${width / 2 - 80} ${height} Z`}
                    fill="#1e293b"
                    className="opacity-50"
                />

                {seats.map((seat, i) => (
                    <motion.circle
                        key={i}
                        cx={seat.x}
                        cy={seat.y}
                        r={seat.r}
                        fill={seat.data ? getColor(seat.data.voto) : '#334155'}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.005, duration: 0.3 }}
                        className="cursor-pointer hover:stroke-2 hover:stroke-white transition-all"
                        onMouseEnter={() => seat.data && setHoveredSeat(seat.data)}
                        onMouseLeave={() => setHoveredSeat(null)}
                    />
                ))}
            </svg>

            {/* Tooltip / Info Panel */}
            <AnimatePresence>
                {hoveredSeat && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-10 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl flex items-center gap-4 z-50 pointer-events-none"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden border-2 border-slate-600">
                            {/* Fallback avatar */}
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                                {hoveredSeat.parliamentarian.nombre_completo.substring(0, 2)}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{hoveredSeat.parliamentarian.nombre_completo}</h4>
                            <p className="text-xs text-slate-400">{hoveredSeat.parliamentarian.partido}</p>
                            <div className="mt-1 flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Voto:</span>
                                <span
                                    className="text-xs font-bold px-2 py-0.5 rounded"
                                    style={{
                                        backgroundColor: `${getColor(hoveredSeat.voto)}20`,
                                        color: getColor(hoveredSeat.voto)
                                    }}
                                >
                                    {hoveredSeat.voto.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
