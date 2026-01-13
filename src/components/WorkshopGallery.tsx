
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Hammer } from 'lucide-react';
import ItemCard from './ItemCard';

interface Item {
    id: string;
    name: { [key: string]: string };
    rarity: string;
    type: string;
    imageFilename?: string;
    value?: number;
    upgradeCost?: { [key: string]: number };
    [key: string]: any;
}

interface WorkshopGalleryProps {
    items: Item[];
    allItems: Item[];
}

export default function WorkshopGallery({ items, allItems }: WorkshopGalleryProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeType, setActiveType] = useState<string | null>(null);

    // Create a lookup map for all items for fast ingredient access
    const itemMap = useMemo(() => {
        const map = new Map<string, Item>();
        allItems.forEach(i => map.set(i.id, i));
        return map;
    }, [allItems]);

    const filteredItems = useMemo(() => {
        if (!searchQuery) return items;
        const q = searchQuery.toLowerCase();
        return items.filter(item =>
            (item.name.es || item.name.en || '').toLowerCase().includes(q) ||
            (item.type || '').toLowerCase().includes(q)
        );
    }, [items, searchQuery]);

    const availableTypes = useMemo(() => {
        const types = new Set<string>();
        filteredItems.forEach(item => {
            types.add(item.type || 'Otros');
        });

        const sortOrder = [
            'Assault Rifle', 'SMG', 'Shotgun', 'Sniper Rifle', 'Pistol', 'Grenade Launcher',
            'Heavy Weapon', 'Melee', 'Modification', 'Augment', 'Kit', 'Medical', 'Gadget'
        ];

        return Array.from(types).sort((a, b) => {
            const idxA = sortOrder.indexOf(a);
            const idxB = sortOrder.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });
    }, [filteredItems]);

    const groupedItems = useMemo(() => {
        const groups: { [key: string]: Item[] } = {};

        filteredItems.forEach(item => {
            const type = item.type || 'Otros';
            // Filter by active category if selected
            if (activeType && type !== activeType) return;

            if (!groups[type]) groups[type] = [];
            groups[type].push(item);
        });

        // Use same sort order for keys
        const sortOrder = [
            'Assault Rifle', 'SMG', 'Shotgun', 'Sniper Rifle', 'Pistol', 'Grenade Launcher',
            'Heavy Weapon', 'Melee', 'Modification', 'Augment', 'Kit', 'Medical', 'Gadget'
        ];

        return Object.entries(groups).sort((a, b) => {
            const idxA = sortOrder.indexOf(a[0]);
            const idxB = sortOrder.indexOf(b[0]);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a[0].localeCompare(b[0]);
        });
    }, [filteredItems, activeType]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4">
            {/* Header & Controls */}
            <div className="flex flex-col gap-6 mb-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
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
                            placeholder="Buscar mejoras..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-arc-orange focus:ring-1 focus:ring-arc-orange transition-all"
                        />
                    </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap justify-center gap-2">
                    <button
                        onClick={() => setActiveType(null)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${activeType === null
                                ? 'bg-white text-black border-white'
                                : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                            }`}
                    >
                        TODOS
                    </button>
                    {availableTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setActiveType(type === activeType ? null : type)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${activeType === type
                                    ? 'bg-arc-orange text-black border-arc-orange'
                                    : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                                }`}
                        >
                            {type.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-16 pb-20">
                {groupedItems.map(([type, groupItems]) => (
                    <div key={type} className="animate-fade-in">
                        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-6 uppercase tracking-wider flex items-center gap-4">
                            {type}
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groupItems.map(item => (
                                <div key={item.id} className="bg-arc-card/50 border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-all">
                                    {/* Header */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-24 h-24 flex-shrink-0">
                                            <ItemCard item={item} onClick={() => { }} isCompact={true} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{item.name.es || item.name.en}</h3>
                                            <div className="text-sm text-gray-400 mb-2">{item.type}</div>
                                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-black/40 border border-white/5 text-xs text-arc-orange font-mono">
                                                <Hammer className="w-3 h-3" />
                                                <span>Nivel {item.stationLevelRequired || 1}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ingredients */}
                                    <div className="bg-black/20 rounded-xl p-4">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Materiales Requeridos</h4>
                                        <div className="space-y-3">
                                            {item.upgradeCost ? (
                                                Object.entries(item.upgradeCost).map(([ingId, count]) => {
                                                    const ingredient = itemMap.get(ingId);
                                                    if (!ingredient) return null;

                                                    return (
                                                        <div key={ingId} className="flex items-center justify-between group/ing">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-black/40 rounded-lg flex items-center justify-center border border-white/5 text-gray-600 overflow-hidden">
                                                                    {ingredient.imageFilename ? (
                                                                        <img src={ingredient.imageFilename} alt="" className="w-full h-full object-contain p-1" />
                                                                    ) : (
                                                                        <div className="w-2 h-2 rounded-full bg-gray-600" />
                                                                    )}
                                                                </div>
                                                                <span className="text-gray-300 font-medium group-hover/ing:text-white transition-colors">
                                                                    {ingredient.name.es || ingredient.name.en}
                                                                </span>
                                                            </div>
                                                            <span className="font-mono font-bold text-arc-orange text-lg">
                                                                x{count}
                                                            </span>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-gray-500 text-sm italic">No se requieren materiales.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {groupedItems.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        No se encontraron mejoras para "{searchQuery}"
                    </div>
                )}
            </div>
        </div>
    );
}
