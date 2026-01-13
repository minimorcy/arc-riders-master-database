
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Construction, ChevronRight } from 'lucide-react';

interface Item {
    id: string;
    name: { [key: string]: string };
    imageFilename?: string;
    [key: string]: any;
}

interface LevelRequirement {
    itemId: string;
    quantity: number;
}

interface StationLevel {
    level: number;
    requirementItemIds: LevelRequirement[];
}

interface Station {
    id: string;
    name: { [key: string]: string };
    levels: StationLevel[];
    maxLevel: number;
}

interface HideoutGalleryProps {
    stations: Station[];
    allItems: Item[];
}

export default function HideoutGallery({ stations, allItems }: HideoutGalleryProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Create a lookup map for all items for fast ingredient access
    const itemMap = useMemo(() => {
        const map = new Map<string, Item>();
        allItems.forEach(i => map.set(i.id, i));
        return map;
    }, [allItems]);

    const filteredStations = useMemo(() => {
        if (!searchQuery) return stations;
        const q = searchQuery.toLowerCase();
        return stations.filter(station =>
            (station.name.es || station.name.en || '').toLowerCase().includes(q)
        );
    }, [stations, searchQuery]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-bold tracking-wide">VOLVER</span>
                </a>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar estación..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-arc-orange focus:ring-1 focus:ring-arc-orange transition-all"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                {filteredStations.map(station => (
                    <div key={station.id} className="bg-arc-card/50 border border-white/10 rounded-3xl overflow-hidden group hover:border-white/20 transition-all shadow-2xl">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-arc-card to-black/50 p-6 border-b border-white/5 flex items-center gap-4">
                            <div className="p-3 bg-arc-orange/10 rounded-xl border border-arc-orange/20 text-arc-orange">
                                <Construction className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">{station.name.es || station.name.en}</h3>
                                <div className="text-sm text-gray-400 font-mono">Niveles disponibles: {station.maxLevel}</div>
                            </div>
                        </div>

                        {/* Levels */}
                        <div className="p-6 space-y-8">
                            {station.levels.map((level, index) => (
                                <div key={level.level} className="relative">
                                    {/* Level Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-white border border-white/10 ring-4 ring-black/50 z-10">
                                            {level.level}
                                        </div>
                                        <div className="h-[1px] flex-1 bg-white/10"></div>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Requisitos Nivel {level.level}</span>
                                    </div>

                                    {/* Connector Line */}
                                    {index !== station.levels.length - 1 && (
                                        <div className="absolute left-4 top-8 bottom-[-32px] w-[1px] bg-white/10"></div>
                                    )}

                                    {/* Ingredients Grid */}
                                    <div className="ml-12 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {level.requirementItemIds.map((req) => {
                                            const item = itemMap.get(req.itemId);
                                            // Handle missing items gracefully
                                            if (!item) return (
                                                <div key={req.itemId} className="flex items-center gap-2 p-2 rounded-lg bg-black/20 border border-red-500/20 text-red-400 text-xs">
                                                    <span>Missing: {req.itemId}</span>
                                                </div>
                                            );

                                            return (
                                                <div key={req.itemId} className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 hover:border-white/10 transition-colors group/item">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-black/40 rounded flex items-center justify-center border border-white/5 overflow-hidden">
                                                            {item.imageFilename ? (
                                                                <img src={item.imageFilename} alt="" className="w-full h-full object-contain p-0.5" />
                                                            ) : (
                                                                <div className="w-2 h-2 rounded-full bg-gray-600" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-gray-400 group-hover/item:text-gray-200 transition-colors font-medium line-clamp-1">
                                                                {item.name.es || item.name.en}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="font-mono font-bold text-arc-orange ml-2">
                                                        x{req.quantity}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
