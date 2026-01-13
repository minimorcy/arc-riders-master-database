
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Settings2, Grid3X3, StretchHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import categorizedData from '../data/arc_raiders_categorized.json';
import ItemCard from './ItemCard';

interface Item {
    id: string;
    name: { [key: string]: string };
    description: { [key: string]: string };
    rarity: string;
    type: string;
    value?: number;
    weightKg?: number;
    imageFilename?: string;
    foundIn?: string;
    recyclesInto?: any;
    salvagesInto?: any;
    craftBench?: any;
}

interface ItemGalleryProps {
    items: Item[];
}

const CATEGORIES = [
    { id: 'all', label: '🌟 Todos', color: 'gray' },
    { id: 'priority', label: '🔥 Prioridad', color: 'red' },
    { id: 'safe', label: '♻️ Safe to Sell', color: 'green' },
    { id: 'workshop', label: '🛠️ Taller', color: 'blue' },
    { id: 'expedition', label: '🎒 Expedición', color: 'yellow' },
];

export default function ItemGallery({ items }: ItemGalleryProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [visibleCount, setVisibleCount] = useState(50);
    const [isCompact, setIsCompact] = useState(false);

    const gridClasses = isCompact
        ? "grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3 pb-20"
        : "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20";

    const filteredItems = useMemo(() => {
        let result = items;

        // Category Filter
        if (activeCategory !== 'all') {
            // @ts-ignore - JSON structure might be inferred loosely
            const categoryItems = (categorizedData as any)[activeCategory];
            if (categoryItems) {
                const categoryIds = new Set(categoryItems.map((i: any) => i.id));
                result = result.filter(item => categoryIds.has(item.id));
            }
        }

        // Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                (item.name.es || item.name.en || '').toLowerCase().includes(q)
            );
        }

        return result;
    }, [items, searchQuery, activeCategory]);

    // Reset pagination when filters change
    React.useEffect(() => {
        setVisibleCount(50);
    }, [searchQuery, activeCategory]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4">
            {/* Controls */}
            <div className="sticky top-4 z-40 bg-arc-dark/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar objetos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-arc-orange focus:ring-1 focus:ring-arc-orange transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 justify-center w-full md:w-auto">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeCategory === cat.id
                                    ? 'bg-gradient-to-r from-arc-orange to-arc-orange-light text-white shadow-lg scale-105'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 hover:-translate-y-0.5'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsCompact(!isCompact)}
                            className={`p-2 rounded-lg transition-all ${isCompact ? 'bg-arc-orange text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                            title={isCompact ? "Vista Normal" : "Vista Compacta"}
                        >
                            {isCompact ? <Grid3X3 className="w-5 h-5" /> : <StretchHorizontal className="w-5 h-5" />}
                        </button>

                        <div className="text-gray-400 text-sm font-mono bg-black/30 px-4 py-2 rounded-lg border border-white/5">
                            {filteredItems.length} ITEMS
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <motion.div
                className={gridClasses}
            >
                {filteredItems.slice(0, visibleCount).map((item) => (
                    <ItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} isCompact={isCompact} />
                ))}
            </motion.div>

            {/* Load More Trigger */}
            {filteredItems.length > visibleCount && (
                <div className="flex justify-center pb-20">
                    <button
                        onClick={() => setVisibleCount(prev => prev + 50)}
                        className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full font-bold tracking-widest border border-white/10 transition-all active:scale-95"
                    >
                        LOAD MORE ({filteredItems.length - visibleCount})
                    </button>
                </div>
            )}

            {/* Modal - Rendered via Portal to escape parent transforms */}
            {selectedItem && typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedItem(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            layoutId={`card-${selectedItem.id}`}
                            className="relative w-full max-w-2xl bg-arc-card border-2 border-arc-green rounded-3xl p-8 shadow-2xl z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-arc-green to-transparent opacity-50" />

                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-red-500/80 transition-colors z-50"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>

                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-shrink-0 mx-auto md:mx-0">
                                    <div className={`w-48 h-48 rounded-2xl flex items-center justify-center bg-black/30 border border-white/10 relative overflow-hidden group`}>
                                        {/* Rarity Glow */}
                                        <div className={`absolute inset-0 opacity-20 blur-xl bg-${getRarityColor(selectedItem.rarity)}`} />
                                        {selectedItem.imageFilename ? (
                                            <img
                                                src={selectedItem.imageFilename}
                                                alt={selectedItem.name.es || selectedItem.name.en}
                                                className="w-40 h-40 object-contain relative z-10 drop-shadow-2xl"
                                            />
                                        ) : (
                                            <div className="w-40 h-40 flex items-center justify-center text-gray-500 relative z-10">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className={`mt-4 text-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-black/40 border border-white/10 text-${getRarityColor(selectedItem.rarity)}-400`}>
                                        {selectedItem.rarity}
                                    </div>
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4 font-heading">
                                        {selectedItem.name.es || selectedItem.name.en}
                                    </h2>

                                    <div className="space-y-4 text-gray-300 leading-relaxed">
                                        <p className="text-lg italic opacity-90 border-l-4 border-arc-orange pl-4 bg-white/5 py-2 rounded-r-lg">
                                            {selectedItem.description.es || selectedItem.description.en}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Valor</div>
                                                <div className="text-xl font-bold text-arc-green">${selectedItem.value}</div>
                                            </div>
                                            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Peso</div>
                                                <div className="text-xl font-bold text-white">{selectedItem.weightKg} kg</div>
                                            </div>
                                            {selectedItem.foundIn && (
                                                <div className="bg-black/40 p-3 rounded-xl border border-white/5 col-span-2">
                                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Ubicación</div>
                                                    <div className="text-lg font-medium text-arc-orange-light">{selectedItem.foundIn}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}

function getRarityColor(rarity: string) {
    switch (rarity) {
        case 'Common': return 'gray';
        case 'Uncommon': return 'green';
        case 'Rare': return 'blue';
        case 'Epic': return 'purple';
        case 'Legendary': return 'orange';
        default: return 'gray';
    }
}
