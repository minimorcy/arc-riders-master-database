import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, Construction, Grid, List, Layers, ArrowUpDown } from 'lucide-react';

interface Item {
    id: string;
    name: { [key: string]: string };
    imageFilename?: string;
    rarity?: string;
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

type ViewMode = 'grid' | 'list' | 'materials';
type SortMode = 'name' | 'level' | 'rarity'; // Rarity only for materials view

export default function HideoutGallery({ stations, allItems }: HideoutGalleryProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<SortMode>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Create a lookup map for all items for fast ingredient access
    const itemMap = useMemo(() => {
        const map = new Map<string, Item>();
        allItems.forEach(i => map.set(i.id, i));
        return map;
    }, [allItems]);

    const filteredStations = useMemo(() => {
        let result = stations;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(station =>
                (station.name.es || station.name.en || '').toLowerCase().includes(q)
            );
        }

        return [...result].sort((a, b) => {
            let valA, valB;
            if (sortBy === 'level') {
                valA = a.maxLevel;
                valB = b.maxLevel;
            } else {
                valA = (a.name.es || a.name.en || '').toLowerCase();
                valB = (b.name.es || b.name.en || '').toLowerCase();
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    }, [stations, searchQuery, sortBy, sortDirection]);

    const aggregatedMaterials = useMemo(() => {
        if (viewMode !== 'materials') return [];

        const materials = new Map<string, { item: Item, totalQuantity: number, stations: string[] }>();

        // Only include filtered stations behavior or ALL stations? 
        // Typically "Materials needed" implies specifically for what is shown or all.
        // Let's iterate ALL stations to give a "Master List", filtering by search on Item Name instead.

        stations.forEach(station => {
            station.levels.forEach(level => {
                level.requirementItemIds.forEach(req => {
                    const existing = materials.get(req.itemId);
                    if (existing) {
                        existing.totalQuantity += req.quantity;
                        if (!existing.stations.includes(station.id)) {
                            existing.stations.push(station.id);
                        }
                    } else {
                        const item = itemMap.get(req.itemId);
                        if (item) {
                            materials.set(req.itemId, {
                                item,
                                totalQuantity: req.quantity,
                                stations: [station.id]
                            });
                        }
                    }
                });
            });
        });

        let result = Array.from(materials.values());

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(m =>
                (m.item.name.es || m.item.name.en || '').toLowerCase().includes(q)
            );
        }

        return result.sort((a, b) => {
            let valA: any = '', valB: any = '';

            if (sortBy === 'rarity') {
                const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
                valA = rarityOrder.indexOf((a.item.rarity || 'common').toLowerCase());
                valB = rarityOrder.indexOf((b.item.rarity || 'common').toLowerCase());
            } else if (sortBy === 'level') {
                // misuse level for quantity in materials view
                valA = a.totalQuantity;
                valB = b.totalQuantity;
            } else {
                valA = (a.item.name.es || a.item.name.en || '').toLowerCase();
                valB = (b.item.name.es || b.item.name.en || '').toLowerCase();
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    }, [stations, itemMap, viewMode, searchQuery, sortBy, sortDirection]);


    const toggleSort = (mode: SortMode) => {
        if (sortBy === mode) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(mode);
            setSortDirection('asc');
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4">
            {/* Header & Controls - Compact Version */}
            <div className="sticky top-4 z-40 bg-arc-dark/95 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                            <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                        </a>

                        {/* View Toggles */}
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                title="Cuadrícula"
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                title="Lista Compacta"
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('materials')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'materials' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                title="Todos los Materiales"
                            >
                                <Layers className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Sort Controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => toggleSort('name')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${sortBy === 'name' ? 'bg-arc-orange/20 border-arc-orange text-arc-orange' : 'bg-transparent border-white/10 text-gray-500 hover:text-gray-300'}`}
                            >
                                Nombre
                                {sortBy === 'name' && <ArrowUpDown className="w-3 h-3" />}
                            </button>

                            {viewMode === 'materials' ? (
                                <button
                                    onClick={() => toggleSort('rarity')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${sortBy === 'rarity' ? 'bg-arc-orange/20 border-arc-orange text-arc-orange' : 'bg-transparent border-white/10 text-gray-500 hover:text-gray-300'}`}
                                >
                                    Rareza
                                    {sortBy === 'rarity' && <ArrowUpDown className="w-3 h-3" />}
                                </button>
                            ) : (
                                <button
                                    onClick={() => toggleSort('level')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${sortBy === 'level' ? 'bg-arc-orange/20 border-arc-orange text-arc-orange' : 'bg-transparent border-white/10 text-gray-500 hover:text-gray-300'}`}
                                >
                                    Nivel
                                    {sortBy === 'level' && <ArrowUpDown className="w-3 h-3" />}
                                </button>
                            )}
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={viewMode === 'materials' ? "Buscar material..." : "Buscar estación..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-arc-orange focus:ring-1 focus:ring-arc-orange transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'materials' ? (
                // Materials View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                    {aggregatedMaterials.map((entry) => (
                        <div key={entry.item.id} className="bg-arc-card/30 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-white/20 transition-all group">
                            <div className={`w-12 h-12 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center relative overflow-hidden`}>
                                <div className={`absolute inset-0 opacity-20 bg-${entry.item.rarity ? getRarityColor(entry.item.rarity) : 'gray'}-500/20`} />
                                {entry.item.imageFilename ? (
                                    <img src={entry.item.imageFilename} alt="" className="w-full h-full object-contain p-1" />
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-200 truncate group-hover:text-white transition-colors">
                                    {entry.item.name.es || entry.item.name.en}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-wider text-${entry.item.rarity ? getRarityColor(entry.item.rarity) : 'gray'}-400`}>
                                        {entry.item.rarity || 'Common'}
                                    </span>
                                    <span className="text-xs text-gray-500">en {entry.stations.length} estaciones</span>
                                </div>
                            </div>
                            <div className="text-xl font-mono font-bold text-arc-orange">
                                x{entry.totalQuantity}
                            </div>
                        </div>
                    ))}
                    {aggregatedMaterials.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            No se encontraron materiales.
                        </div>
                    )}
                </div>
            ) : viewMode === 'list' ? (
                // Compact List View
                <div className="space-y-2 pb-20">
                    {filteredStations.map(station => (
                        <div key={station.id} className="bg-arc-card/30 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-4 md:w-1/3">
                                <div className="p-2 bg-arc-orange/10 rounded-lg text-arc-orange">
                                    <Construction className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{station.name.es || station.name.en}</h3>
                                    <div className="text-xs text-gray-500 font-mono">Max Nivel: {station.maxLevel}</div>
                                </div>
                            </div>

                            <div className="flex-1 flex gap-2 overflow-x-auto pb-2 md:pb-0 mask-gradient-right">
                                {station.levels.flatMap(l => l.requirementItemIds).slice(0, 6).map((req, idx) => {
                                    const item = itemMap.get(req.itemId);
                                    if (!item) return null;
                                    return (
                                        <div key={`${station.id}-${req.itemId}-${idx}`} className="flex-shrink-0 w-8 h-8 bg-black/40 rounded border border-white/5 p-0.5" title={`${item.name.es} x${req.quantity}`}>
                                            {item.imageFilename && <img src={item.imageFilename} className="w-full h-full object-contain" />}
                                        </div>
                                    )
                                })}
                                {station.levels.reduce((acc, l) => acc + l.requirementItemIds.length, 0) > 6 && (
                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-xs text-gray-500">
                                        +{station.levels.reduce((acc, l) => acc + l.requirementItemIds.length, 0) - 6}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Grid View (Existing but refined)
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
            )}
        </div>
    );
}

function getRarityColor(rarity: string) {
    if (!rarity) return 'gray';
    switch (rarity.toLowerCase()) {
        case 'common': return 'gray';
        case 'uncommon': return 'green';
        case 'rare': return 'blue';
        case 'epic': return 'purple';
        case 'legendary': return 'orange';
        default: return 'gray';
    }
}
