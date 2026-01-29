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
        <div className="w-full h-[300px] flex items-center justify-center p-4">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Desempeño"
                        dataKey="A"
                        stroke="#2563eb"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#111827', fontWeight: 600 }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
