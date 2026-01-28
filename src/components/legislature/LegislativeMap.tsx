"use client"

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox access token here
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

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
}

export function LegislativeMap({ data, onRegionSelect }: LegislativeMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Initialize map
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/dark-v11', // Premium dark style
            center: [-71.5, -35.6751], // Center of Chile
            zoom: 4,
            projection: { name: 'mercator' }
        });

        mapRef.current = map;

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.on('load', () => {
            updateMarkers();
        });

        return () => {
            markersRef.current.forEach(m => m.remove());
            map.remove();
        };
    }, []);

    // Update markers when data changes
    useEffect(() => {
        if (mapRef.current && mapRef.current.loaded()) {
            updateMarkers();
        }
    }, [data]);

    const updateMarkers = () => {
        if (!mapRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        data.forEach(region => {
            if (!region.coords) return;

            // Create custom HTML element for marker
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.width = '30px';
            el.style.height = '30px';
            el.style.borderRadius = '50%';
            el.style.backgroundColor = 'rgba(6, 182, 212, 0.2)'; // cyan-500/20
            el.style.border = '2px solid rgb(6, 182, 212)'; // cyan-500
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.cursor = 'pointer';
            el.style.boxShadow = '0 0 15px rgba(6, 182, 212, 0.5)';
            el.style.transition = 'all 0.3s ease';

            el.innerHTML = `<span style="color: white; font-size: 10px; font-weight: bold;">${region.count}</span>`;

            el.addEventListener('mouseenter', () => {
                el.style.transform = 'scale(1.2)';
                el.style.backgroundColor = 'rgba(6, 182, 212, 0.4)';
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'scale(1)';
                el.style.backgroundColor = 'rgba(6, 182, 212, 0.2)';
            });

            el.onclick = () => {
                mapRef.current?.flyTo({
                    center: [region.coords.lng, region.coords.lat],
                    zoom: 7,
                    essential: true
                });
                onRegionSelect(region);
            };

            const marker = new mapboxgl.Marker(el)
                .setLngLat([region.coords.lng, region.coords.lat])
                .addTo(mapRef.current!);

            markersRef.current.push(marker);
        });
    };

    if (!mapboxgl.accessToken) {
        return (
            <div className="w-full h-full bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center p-8 text-center">
                <div className="max-w-md space-y-4">
                    <p className="text-slate-400">
                        Mapbox access token is missing. Please add
                        <code className="mx-2 px-1.5 py-0.5 bg-white/5 rounded text-cyan-400">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code>
                        to your <code className="px-1.5 py-0.5 bg-white/5 rounded text-white">.env.local</code>.
                    </p>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <p className="text-xs text-amber-500">
                            You can get a free token at <a href="https://mapbox.com" target="_blank" className="underline">mapbox.com</a>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative rounded-2xl overflow-hidden border border-white/10">
            <div ref={mapContainerRef} className="absolute inset-0" />

            {/* Legend Overlay */}
            <div className="absolute top-4 left-4 bg-[#030712]/80 backdrop-blur-md p-4 rounded-xl border border-white/10 pointer-events-none">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Distribución</h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                        <span className="text-xs text-white">Representantes</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
