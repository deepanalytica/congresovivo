'use client';

import { motion } from 'framer-motion';
import { Check, Clock, FileText, Gavel, Flag } from 'lucide-react';

interface TimelineEvent {
    date: string;
    stage: string;
    chamber?: string;
    description: string;
    isComplete: boolean;
}

interface LegislativeTimelineProps {
    events: TimelineEvent[];
    currentStage?: string;
}

const stageIcons: Record<string, any> = {
    ingreso: FileText,
    primer_tramite: Gavel,
    segundo_tramite: Gavel,
    tercer_tramite: Gavel,
    promulgacion: Flag,
    publicacion: Check
};

const stageColors: Record<string, string> = {
    ingreso: 'from-blue-500 to-blue-600',
    primer_tramite: 'from-purple-500 to-purple-600',
    segundo_tramite: 'from-indigo-500 to-indigo-600',
    tercer_tramite: 'from-violet-500 to-violet-600',
    promulgacion: 'from-green-500 to-green-600',
    publicacion: 'from-emerald-500 to-emerald-600'
};

export function LegislativeTimeline({ events, currentStage }: LegislativeTimelineProps) {

    return (
        <div className="relative overflow-hidden rounded-xl">
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-950/80 backdrop-blur-xl" />
            <div className="absolute inset-0 border border-white/10 rounded-xl" />

            <div className="relative p-8 space-y-6">
                <h3 className="text-2xl font-bold text-white mb-8">
                    Timeline de Tramitación
                </h3>

                {/* Timeline */}
                <div className="relative space-y-8">
                    {/* Vertical Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-green-500/50" />

                    {events.map((event, index) => {
                        const stage_key = event.stage.toLowerCase().replace(' ', '_');
                        const Icon = stageIcons[stage_key] || Clock;
                        const gradient = stageColors[stage_key] || 'from-gray-500 to-gray-600';
                        const isActive = event.stage === currentStage;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative flex items-start gap-6"
                            >
                                {/* Icon Circle */}
                                <motion.div
                                    className={`relative z-10 flex-shrink-0`}
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <div className={`
                                        w-12 h-12 rounded-full flex items-center justify-center
                                        bg-gradient-to-br ${gradient}
                                        ${isActive ? 'ring-4 ring-blue-500/30 shadow-lg shadow-blue-500/50' : ''}
                                        ${event.isComplete ? 'opacity-100' : 'opacity-60'}
                                    `}>
                                        {event.isComplete ? (
                                            <Check className="h-6 w-6 text-white" />
                                        ) : (
                                            <Icon className="h-6 w-6 text-white" />
                                        )}
                                    </div>

                                    {/* Active Pulse Animation */}
                                    {isActive && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full bg-blue-500/30"
                                            animate={{
                                                scale: [1, 1.3, 1],
                                                opacity: [0.6, 0, 0.6]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: 'easeInOut'
                                            }}
                                        />
                                    )}
                                </motion.div>

                                {/* Content */}
                                <div className="flex-1 pb-8">
                                    <div className={`
                                        p-4 rounded-lg
                                        ${isActive
                                            ? 'bg-blue-500/10 border border-blue-500/30'
                                            : 'bg-gray-800/30 border border-gray-700/30'
                                        }
                                    `}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className={`
                                                    font-semibold
                                                    ${isActive ? 'text-blue-400' : 'text-white'}
                                                `}>
                                                    {event.stage}
                                                </h4>
                                                {event.chamber && (
                                                    <p className="text-sm text-gray-400 capitalize">
                                                        {event.chamber}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500 font-mono">
                                                {new Date(event.date).toLocaleDateString('es-CL')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-300">
                                            {event.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Progress Indicator */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-400">Progreso de tramitación</span>
                        <span className="text-white font-medium">
                            {Math.round((events.filter(e => e.isComplete).length / events.length) * 100)}%
                        </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
                            initial={{ width: 0 }}
                            animate={{
                                width: `${(events.filter(e => e.isComplete).length / events.length) * 100}%`
                            }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
