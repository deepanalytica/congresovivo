'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Building2, Map, RefreshCw } from 'lucide-react';

interface ReferenceData {
    category: string;
    code: string;
    name: string;
    parent_code?: string;
    metadata?: any;
}

export default function ReferenceDataPage() {
    const [data, setData] = useState<Record<string, ReferenceData[]>>({});
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('distritos');

    useEffect(() => {
        fetchData();
        fetchSyncStatus();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/reference-data');
            const result = await response.json();
            setData(result.data || {});
        } catch (error) {
            console.error('Error fetching reference data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSyncStatus = async () => {
        try {
            const response = await fetch('/api/sync/reference-data');
            const result = await response.json();
            setLastSync(result.last_sync);
        } catch (error) {
            console.error('Error fetching sync status:', error);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const response = await fetch('/api/sync/reference-data', { method: 'POST' });
            const result = await response.json();
            if (result.success) {
                await fetchData();
                await fetchSyncStatus();
            }
        } catch (error) {
            console.error('Error syncing:', error);
        } finally {
            setSyncing(false);
        }
    };

    const categories = [
        { key: 'distrito', label: 'Distritos', icon: MapPin, color: 'bg-blue-500' },
        { key: 'region', label: 'Regiones', icon: Map, color: 'bg-green-500' },
        { key: 'provincia', label: 'Provincias', icon: Building2, color: 'bg-purple-500' },
        { key: 'comuna', label: 'Comunas', icon: Building2, color: 'bg-orange-500' },
        { key: 'ministerio', label: 'Ministerios', icon: Building2, color: 'bg-red-500' }
    ];

    const activeCategory = categories.find(c => c.key === activeTab);
    const items = data[activeTab] || [];

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Datos de Referencia</h1>
                    <p className="text-muted-foreground">
                        Información base desde OpenData - Cámara de Diputados
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

            {lastSync && (
                <div className="text-sm text-muted-foreground">
                    Última sincronización: {new Date(lastSync).toLocaleString('es-CL')}
                </div>
            )}

            {/* Category Tabs */}
            <div className="flex gap-2 flex-wrap">
                {categories.map(category => (
                    <button
                        key={category.key}
                        onClick={() => setActiveTab(category.key)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeTab === category.key
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                    >
                        <category.icon className="h-4 w-4" />
                        {category.label}
                        <Badge variant="secondary">{data[category.key]?.length || 0}</Badge>
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Cargando datos...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map((item) => (
                        <Card key={`${item.category}-${item.code}`}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        {activeCategory && (
                                            <div className={`p-2 rounded-lg ${activeCategory.color}`}>
                                                <activeCategory.icon className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                        <div>
                                            <CardTitle className="text-base">{item.name}</CardTitle>
                                            <CardDescription>Código: {item.code}</CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            {item.metadata && (
                                <CardContent>
                                    <div className="text-sm space-y-1">
                                        {item.metadata.diputados && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Diputados:</span>
                                                <span className="font-medium">{item.metadata.diputados}</span>
                                            </div>
                                        )}
                                        {item.metadata.region && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Región:</span>
                                                <span className="font-medium">{item.metadata.region}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {items.length === 0 && !loading && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground mb-4">
                            No hay datos de "{activeCategory?.label}" sincronizados.
                        </p>
                        <Button onClick={handleSync} disabled={syncing}>
                            Sincronizar Ahora
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
