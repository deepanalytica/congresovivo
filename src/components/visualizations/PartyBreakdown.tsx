
"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface PartyStats {
    party: string;
    si: number;
    no: number;
    abstencion: number;
    ausente: number;
    total: number;
}

interface PartyBreakdownProps {
    votes: any[];
}

export function PartyBreakdown({ votes }: PartyBreakdownProps) {
    const stats = useMemo(() => {
        const partyMap: Record<string, PartyStats> = {};

        votes.forEach(v => {
            const party = v.parliamentarian?.partido || 'Independiente';
            if (!partyMap[party]) {
                partyMap[party] = { party, si: 0, no: 0, abstencion: 0, ausente: 0, total: 0 };
            }
            const option = v.voto?.toLowerCase();
            if (option === 'si') partyMap[party].si++;
            else if (option === 'no') partyMap[party].no++;
            else if (option === 'abstencion') partyMap[party].abstencion++;
            else partyMap[party].ausente++;

            partyMap[party].total++;
        });

        return Object.values(partyMap).sort((a, b) => b.total - a.total);
    }, [votes]);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="w-1 h-6 bg-cyan-500 rounded-full" />
                Votación por Partido
            </h3>

            <div className="grid gap-4">
                {stats.map((party, idx) => (
                    <motion.div
                        key={party.party}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl hover:bg-slate-900/60 transition-colors group"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors uppercase tracking-tight text-sm">
                                {party.party}
                            </span>
                            <span className="text-xs font-mono text-slate-500">{party.total} Miembros</span>
                        </div>

                        <div className="h-2 w-full bg-slate-950 rounded-full flex overflow-hidden shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(party.si / party.total) * 100}%` }}
                                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                            />
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(party.no / party.total) * 100}%` }}
                                className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                            />
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(party.abstencion / party.total) * 100}%` }}
                                className="h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                            />
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(party.ausente / party.total) * 100}%` }}
                                className="h-full bg-slate-700"
                            />
                        </div>

                        <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                            {party.si > 0 && <span className="text-emerald-500/80">{party.si} A Favor</span>}
                            {party.no > 0 && <span className="text-rose-500/80">{party.no} En Contra</span>}
                            {party.abstencion > 0 && <span className="text-yellow-500/80">{party.abstencion} Abst.</span>}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
