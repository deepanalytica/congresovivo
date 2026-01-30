"use client";

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface RadarProps {
    data: {
        subject: string;
        A: number; // Value for this parliamentarian
        fullMark: number;
    }[];
}

export function ParliamentarianRadar({ data }: RadarProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className="w-full h-[300px] flex items-center justify-center p-2 select-none">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Desempeño"
                        dataKey="A"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fill="#06b6d4"
                        fillOpacity={0.3}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#1e293b',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
                            color: '#f8fafc'
                        }}
                        itemStyle={{ color: '#22d3ee', fontWeight: 600 }}
                        cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
