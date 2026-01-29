"use client"

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getPartyColor, PARTY_COLORS } from '@/lib/constants/party-colors';

interface RegionData {
    region: string;
    count: number;
    senators: number;
    deputies: number;
    coords: { lat: number; lng: number };
    parliamentarians: any[];
}

interface LegislativeMapProps {
    data: RegionData[];
    onRegionSelect: (region: RegionData | null) => void;
    viewMode?: 'default' | 'party';
    chamberFilter?: 'all' | 'senado' | 'camara';
}

export function LegislativeMap({ data, onRegionSelect, viewMode = 'default', chamberFilter = 'all' }: LegislativeMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Initialize map
        const map = L.map(mapContainerRef.current, {
            center: [-35.6751, -71.5], // Center of Chile
            zoom: 5,
            zoomControl: false,
            attributionControl: false
        });

        mapRef.current = map;

        // Add OpenStreetMap Voyager (Dark Mode feel) or CartoDB Dark Matter
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // Add zoom control at top right
        L.control.zoom({ position: 'topright' }).addTo(map);

        updateMarkers();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update markers when data or view mode changes
    useEffect(() => {
        if (mapRef.current) {
            updateMarkers();
        }
    }, [data, viewMode, chamberFilter]);

    const updateMarkers = () => {
        if (!mapRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        data.forEach(region => {
            if (!region.coords) return;

            // Filter by chamber
            const filteredParliamentarians = region.parliamentarians.filter((p: any) => {
                if (chamberFilter === 'all') return true;
                return p.camara === chamberFilter;
            });

            const count = filteredParliamentarians.length;
            if (count === 0) return; // Skip regions with no parliamentarians after filtering

            // Determine marker color based on view mode
            let markerColor = 'rgb(6, 182, 212)'; // Default cyan

            if (viewMode === 'party' && filteredParliamentarians.length > 0) {
                // Get dominant party/ideology
                const partyCounts: Record<string, number> = {};
                filteredParliamentarians.forEach((p: any) => {
                    const color = getPartyColor(p.partido);
                    partyCounts[color] = (partyCounts[color] || 0) + 1;
                });

                // Find most common color
                const dominantColor = Object.entries(partyCounts)
                    .sort((a, b) => b[1] - a[1])[0][0];
                markerColor = dominantColor;
            }

            // Create custom icon with dynamic color
            const customIcon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: `
                    <div style="
                        width: 30px; 
                        height: 30px; 
                        border-radius: 50%; 
                        background-color: ${markerColor}33; 
                        border: 2px solid ${markerColor}; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        box-shadow: 0 0 15px ${markerColor}80;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">
                        <span style="color: white; font-size: 10px; font-weight: bold;">${count}</span>
                    </div>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            const marker = L.marker([region.coords.lat, region.coords.lng], { icon: customIcon })
                .addTo(mapRef.current!)
                .on('click', (e) => {
                    mapRef.current?.flyTo([region.coords.lat, region.coords.lng], 7, {
                        animate: true,
                        duration: 1.5
                    });
                    onRegionSelect(region);
                });

            markersRef.current.push(marker);
        });
    };

    return (
        <div className="w-full h-full relative rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
            <div ref={mapContainerRef} className="absolute inset-0 z-0" />

            {/* Custom Styles for Leaflet */}
            <style jsx global>{`
                .leaflet-container {
                    background: #0a0a0a !important;
                }
                .leaflet-bar {
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    background: rgba(15,23,42,0.8) !important;
                    backdrop-filter: blur(8px);
                }
                .leaflet-bar a {
                    color: #94a3b8 !important;
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255,255,255,0.1) !important;
                }
                .leaflet-bar a:hover {
                    color: white !important;
                    background: rgba(255,255,255,0.05) !important;
                }
                .custom-leaflet-marker:hover div {
                    transform: scale(1.2);
                    background-color: rgba(6, 182, 212, 0.4) !important;
                }
            `}</style>

            {/* Legend Overlay */}
            <div className="absolute top-4 left-4 z-[1000] bg-[#030712]/80 backdrop-blur-md p-4 rounded-xl border border-white/10 pointer-events-none">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Distribución</h4>
                <div className="space-y-2">
                    {viewMode === 'default' ? (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                            <span className="text-xs text-white">Representantes</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PARTY_COLORS.PS }} />
                                <span className="text-xs text-white">Izq</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PARTY_COLORS.DC }} />
                                <span className="text-xs text-white">Centro</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PARTY_COLORS.RN }} />
                                <span className="text-xs text-white">Der</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
