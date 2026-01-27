import type { LegislativeActivity } from '@/types/legislature'
import { formatRelative } from '@/lib/utils/dates'
import { FileText, Vote, Calendar, Users } from 'lucide-react'

interface ActivityFeedProps {
    activities: LegislativeActivity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <div className="space-y-6">
            {activities.map((activity) => (
                <div key={activity.id} className="timeline-item last:border-0 last:pb-0">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getActivityStyle(activity.tipo)}`}>
                                {getActivityIcon(activity.tipo)}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm leading-snug text-slate-100 mb-1">
                                        {activity.titulo}
                                    </h4>
                                    <p className="text-sm text-slate-400 leading-relaxed mb-2">
                                        {activity.descripcion}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <p className="text-xs text-cyan-400">
                                            {formatRelative(activity.fecha)}
                                        </p>
                                        {activity.relevancia === 'alta' && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                                                Alta prioridad
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function getActivityStyle(tipo: LegislativeActivity['tipo']): string {
    switch (tipo) {
        case 'bill_update':
            return 'bg-blue-500/10 border border-blue-500/30'
        case 'vote':
            return 'bg-green-500/10 border border-green-500/30 glow-green'
        case 'session':
            return 'bg-violet-500/10 border border-violet-500/30'
        case 'committee_meeting':
            return 'bg-orange-500/10 border border-orange-500/30'
        default:
            return 'bg-white/5 border border-white/10'
    }
}

function getActivityIcon(tipo: LegislativeActivity['tipo']) {
    switch (tipo) {
        case 'bill_update':
            return <FileText className="h-5 w-5 text-blue-400" />
        case 'vote':
            return <Vote className="h-5 w-5 text-green-400" />
        case 'session':
            return <Calendar className="h-5 w-5 text-violet-400" />
        case 'committee_meeting':
            return <Users className="h-5 w-5 text-orange-400" />
        default:
            return <FileText className="h-5 w-5 text-slate-400" />
    }
}
