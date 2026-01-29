'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Building2, RefreshCw, Filter } from 'lucide-react';
import Link from 'next/link';

interface Committee {
    id: string;
    external_id: string;
    name: string;
    short_name?: string;
    chamber: string;
    committee_type?: string;
    is_active: boolean;
    description?: string;
    committee_members: {
        id: string;
        role: string;
        parliamentarian: {
            id: string;
            nombre_completo: string;
            partido: string;
            camara: string;
        };
    }[];
}

export default function CommitteesPage() {
    const [committees, setCommittees] = useState<Committee[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [chamberFilter, setChamberFilter] = useState<string | null>(null);

    useEffect(() => {
        fetchCommittees();
    }, [chamberFilter]);

    const fetchCommittees = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (chamberFilter) params.append('chamber', chamberFilter);
            params.append('active', 'true');

            const response = await fetch(`/api/committees?${params}`);
            const result = await response.json();
            setCommittees(result.committees || []);
        } catch (error) {
            console.error('Error fetching committees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const response = await fetch('/api/sync/committees', { method: 'POST' });
            const result = await response.json();
            if (result.success || result.committees_synced > 0) {
                await fetchCommittees();
            }
        } catch (error) {
            console.error('Error syncing:', error);
        } finally {
            setSyncing(false);
        }
    };

    const getChamberBadge = (chamber: string) => {
        const colors = {
            camara: 'bg-blue-500',
            senado: 'bg-purple-500',
            mixta: 'bg-green-500'
        };
        return colors[chamber as keyof typeof colors] || 'bg-gray-500';
    };

    const getChamberLabel = (chamber: string) => {
        const labels = {
            camara: 'Cámara',
            senado: 'Senado',
            mixta: 'Mixta'
        };
        return labels[chamber as keyof typeof labels] || chamber;
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Comisiones Legislativas</h1>
                    <p className="text-muted-foreground">
                        Comisiones permanentes, especiales e investigadoras
                    </p>
                </div>
                <Button
                    onClick={handleSync}
                    disabled={syncing}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Sincronizando...' : 'Sincronizar'}
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 items-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-2">
                    <Button
                        variant={chamberFilter === null ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChamberFilter(null)}
                    >
                        Todas
                    </Button>
                    <Button
                        variant={chamberFilter === 'camara' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChamberFilter('camara')}
                    >
                        Cámara
                    </Button>
                    <Button
                        variant={chamberFilter === 'senado' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChamberFilter('senado')}
                    >
                        Senado
                    </Button>
                    <Button
                        variant={chamberFilter === 'mixta' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChamberFilter('mixta')}
                    >
                        Mixtas
                    </Button>
                </div>
            </div>

            {/* Committees Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Cargando comisiones...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {committees.map((committee) => (
                        <Card key={committee.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Building2 className="h-5 w-5 text-primary" />
                                            <Badge className={getChamberBadge(committee.chamber)}>
                                                {getChamberLabel(committee.chamber)}
                                            </Badge>
                                            {committee.committee_type && (
                                                <Badge variant="outline">{committee.committee_type}</Badge>
                                            )}
                                        </div>
                                        <CardTitle className="text-xl mb-1">
                                            {committee.short_name || committee.name}
                                        </CardTitle>
                                        {committee.short_name && committee.name !== committee.short_name && (
                                            <CardDescription className="text-sm">
                                                {committee.name}
                                            </CardDescription>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {committee.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {committee.description}
                                    </p>
                                )}

                                {/* Members */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Users className="h-4 w-4" />
                                        <span>Miembros ({committee.committee_members.length})</span>
                                    </div>
                                    {committee.committee_members.length > 0 ? (
                                        <div className="space-y-1">
                                            {committee.committee_members.slice(0, 5).map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                                                >
                                                    <Link
                                                        href={`/parlamentarios/${member.parliamentarian.id}`}
                                                        className="hover:underline"
                                                    >
                                                        {member.parliamentarian.nombre_completo}
                                                    </Link>
                                                    <div className="flex items-center gap-2">
                                                        {member.role && member.role !== 'miembro' && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {member.role}
                                                            </Badge>
                                                        )}
                                                        <span className="text-xs text-muted-foreground">
                                                            {member.parliamentarian.partido}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            {committee.committee_members.length > 5 && (
                                                <p className="text-xs text-muted-foreground text-center py-1">
                                                    +{committee.committee_members.length - 5} más
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No hay miembros registrados
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Ver Sesiones
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {committees.length === 0 && !loading && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">
                            No hay comisiones sincronizadas.
                        </p>
                        <Button onClick={handleSync} disabled={syncing}>
                            Sincronizar Comisiones
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
