'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface VoteBreakdownChartProps {
    yesCount: number;
    noCount: number;
    abstentionCount: number;
    absentCount?: number;
}

export function VoteBreakdownChart({
    yesCount,
    noCount,
    abstentionCount,
    absentCount = 0
}: VoteBreakdownChartProps) {

    const data = [
        { name: 'Sí', value: yesCount, color: '#22c55e' },
        { name: 'No', value: noCount, color: '#ef4444' },
        { name: 'Abstención', value: abstentionCount, color: '#f59e0b' },
        ...(absentCount > 0 ? [{ name: 'Ausente', value: absentCount, color: '#6b7280' }] : [])
    ];

    const total = yesCount + noCount + abstentionCount + absentCount;

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const percentage = ((data.value / total) * 100).toFixed(1);

            return (
                <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-lg p-3 shadow-xl">
                    <p className="text-sm font-medium" style={{ color: data.payload.color }}>
                        {data.name}
                    </p>
                    <p className="text-lg font-bold text-white">
                        {data.value} votos
                    </p>
                    <p className="text-xs text-gray-400">
                        {percentage}% del total
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // Don't show label if less than 5%

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-sm font-bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-xl"
        >
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-950/80 backdrop-blur-xl" />
            <div className="absolute inset-0 border border-white/10 rounded-xl" />

            <div className="relative p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">
                    Distribución de Votos
                </h3>

                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={CustomLabel}
                            outerRadius={100}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={800}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="text-2xl font-bold text-green-400">{yesCount}</div>
                        <div className="text-xs text-green-300">Sí</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="text-2xl font-bold text-red-400">{noCount}</div>
                        <div className="text-xs text-red-300">No</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <div className="text-2xl font-bold text-orange-400">{abstentionCount}</div>
                        <div className="text-xs text-orange-300">Abstención</div>
                    </div>
                    {absentCount > 0 && (
                        <div className="text-center p-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
                            <div className="text-2xl font-bold text-gray-400">{absentCount}</div>
                            <div className="text-xs text-gray-300">Ausente</div>
                        </div>
                    )}
                </div>

                {/* Total */}
                <div className="text-center pt-2 border-t border-gray-700">
                    <span className="text-gray-400 text-sm">Total de votos: </span>
                    <span className="text-white font-bold">{total}</span>
                </div>
            </div>
        </motion.div>
    );
}
