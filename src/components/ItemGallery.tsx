import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Grid, List, ArrowUpDown, LayoutGrid, Scroll } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import categorizedData from '../data/arc_raiders_categorized.json';
import ItemCard from './ItemCard';
import questsData from '../data/quests.json';
import { useQuestStore } from '../hooks/useQuestStore';
import { useLanguage } from '../hooks/useLanguage';

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
    craftBench?: string;
    recipe?: { [key: string]: number };
    usedIn?: Array<{ id: string; name: { [key: string]: string }; bench: string | null; quantity: number | null }>;
}

interface ItemGalleryProps {
    items: Item[];
}

const CATEGORIES = [
    { id: 'all', label: '🌟 Todos', color: 'gray' },
    { id: 'priority', label: '🔥 Prioridad', color: 'red' },
    { id: 'quests', label: '📜 Misión', color: 'purple' },
    { id: 'safe', label: '♻️ Safe to Sell', color: 'green' },
    { id: 'workshop', label: '🛠️ Taller', color: 'blue' },
    { id: 'expedition', label: '🎒 Expedición', color: 'yellow' },
];

const ALPHABET = ['ALL', '#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

type ViewMode = 'grid' | 'list' | 'dense';
type SortMode = 'name' | 'rarity' | 'value';

export default function ItemGallery({ items }: ItemGalleryProps) {
    const { language, t } = useLanguage();

    const CATEGORIES = [
        { id: 'all', label: `🌟 ${t("cat.all")}`, color: 'gray' },
        { id: 'priority', label: `🔥 ${t("cat.priority")}`, color: 'red' },
        { id: 'quests', label: `📜 ${t("cat.quests")}`, color: 'purple' },
        { id: 'safe', label: `♻️ ${t("cat.safe")}`, color: 'green' },
        { id: 'workshop', label: `🛠️ ${t("cat.workshop")}`, color: 'blue' },
        { id: 'expedition', label: `🎒 ${t("cat.expedition")}`, color: 'yellow' },
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeLetter, setActiveLetter] = useState('ALL');
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [visibleCount, setVisibleCount] = useState(50);
    const [viewMode, setViewMode] = useState<ViewMode>('dense');
    const [sortBy, setSortBy] = useState<SortMode>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const { isCompleted, completedQuestIds } = useQuestStore();

    // Map Item ID -> List of Quest IDs that require it
    const itemQuestMap = useMemo(() => {
        const map = new Map<string, string[]>();
        // @ts-ignore
        questsData.forEach((q: any) => {
            if (q.requiredItemIds) {
                q.requiredItemIds.forEach((req: any) => {
                    const current = map.get(req.itemId) || [];
                    current.push(q.id);
                    map.set(req.itemId, current);
                });
            }
        });
        return map;
    }, []);

    const getItemStatus = useCallback((itemId: string): 'active' | 'completed' | 'none' => {
        const questIds = itemQuestMap.get(itemId);
        if (!questIds) return 'none';

        // If ANY quest requiring this item is NOT completed, it's active
        const hasActiveQuest = questIds.some(qid => !isCompleted(qid));
        if (hasActiveQuest) return 'active';

        // If it has quests but none are active (all completed), it's completed
        return 'completed';
    }, [itemQuestMap, isCompleted]);

    const gridClasses = useMemo(() => {
        switch (viewMode) {
            case 'grid': return "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20";
            case 'list': return "space-y-2 pb-20";
            // Windows style: Dense columns
            case 'dense': return "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-x-2 gap-y-1 pb-20";
            default: return "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20";
        }
    }, [viewMode]);

    const filteredItems = useMemo(() => {
        let result = items;

        // Category Filter
        if (activeCategory === 'quests') {
            result = result.filter(item => getItemStatus(item.id) !== 'none');
        } else if (activeCategory !== 'all') {
            // @ts-ignore - JSON structure might be inferred loosely
            const categoryItems = (categorizedData as any)[activeCategory];
            if (categoryItems) {
                const categoryIds = new Set(categoryItems.map((i: any) => i.id));
                result = result.filter(item => categoryIds.has(item.id));
            }
        }

        // Letter Filter
        if (activeLetter !== 'ALL') {
            result = result.filter(item => {
                const name = (item.name[language] || item.name.en || item.id).toUpperCase();
                const firstChar = name.charAt(0);
                if (activeLetter === '#') {
                    return !/^[A-Z]/.test(firstChar);
                }
                return firstChar === activeLetter;
            });
        }

        // Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                (item.name[language] || item.name.en || item.id).toLowerCase().includes(q)
            );
        }

        return [...result].sort((a, b) => {
            let valA: any, valB: any;

            if (sortBy === 'rarity') {
                const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
                valA = rarityOrder.indexOf((a.rarity || 'common').toLowerCase());
                valB = rarityOrder.indexOf((b.rarity || 'common').toLowerCase());
            } else if (sortBy === 'value') {
                valA = a.value || 0;
                valB = b.value || 0;
            } else {
                valA = (a.name[language] || a.name.en || a.id).toLowerCase();
                valB = (b.name[language] || b.name.en || b.id).toLowerCase();
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [items, searchQuery, activeCategory, sortBy, sortDirection, activeLetter, completedQuestIds, language, getItemStatus]);

    // Reset pagination when filters change
    React.useEffect(() => {
        setVisibleCount(50);
        // Reset letter if searching or changing category to avoid confusion
        if (searchQuery) setActiveLetter('ALL');
    }, [searchQuery, activeCategory, sortBy, sortDirection, activeLetter]);

    const toggleSort = (mode: SortMode) => {
        if (sortBy === mode) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(mode);
            setSortDirection('asc');
        }
    };

    return (
        <div className="w-full max-w-[95%] mx-auto px-4">
            {/* Sticky Compact Navbar */}
            <div className="sticky top-4 z-40 bg-arc-dark/95 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">

                {/* Left: Search & Category */}
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto flex-1">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t("search.placeholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-arc-orange focus:ring-1 focus:ring-arc-orange transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Compact Categories */}
                    <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto mask-gradient-right px-1 no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeCategory === cat.id
                                    ? 'bg-arc-orange text-white shadow-lg'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    {/* Sort */}
                    <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 border border-white/5">
                        <button
                            onClick={() => toggleSort('name')}
                            className={`px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1 ${sortBy === 'name' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {t("sort.name")} {sortBy === 'name' && <ArrowUpDown className="w-3 h-3" />}
                        </button>
                        <button
                            onClick={() => toggleSort('rarity')}
                            className={`px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1 ${sortBy === 'rarity' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {t("sort.rarity")} {sortBy === 'rarity' && <ArrowUpDown className="w-3 h-3" />}
                        </button>
                        <button
                            onClick={() => toggleSort('value')}
                            className={`px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1 ${sortBy === 'value' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {t("sort.value")} {sortBy === 'value' && <ArrowUpDown className="w-3 h-3" />}
                        </button>
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            title="Cuadrícula"
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('dense')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'dense' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            title="Compacto"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            title="Lista"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="text-xs font-mono text-gray-500 hidden md:block">
                        {filteredItems.length}
                    </div>
                </div>
            </div>

            <div className="flex gap-6 relative">
                {/* A-Z Sidebar */}
                <div className="hidden lg:flex flex-col gap-1 w-8 sticky top-32 h-[calc(100vh-10rem)] overflow-y-auto no-scrollbar pb-20">
                    {ALPHABET.map(char => (
                        <button
                            key={char}
                            onClick={() => setActiveLetter(char)}
                            className={`
                                w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all
                                ${activeLetter === char
                                    ? 'bg-arc-orange text-white shadow-lg scale-110'
                                    : 'text-gray-500 hover:text-white hover:bg-white/10'
                                }
                            `}
                        >
                            {char === 'ALL' ? '*' : char}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    {/* Render Logic */}
                    <motion.div className={gridClasses}>
                        {(() => {
                            // Helper to determine what to render
                            let itemsToRender: (Item | { type: 'header', letter: string })[] = [];

                            if (viewMode === 'dense' && sortBy === 'name') {
                                // Continuous Flow with Embedded Headers
                                let currentLetter = '';
                                filteredItems.forEach(item => {
                                    const name = (item.name[language] || item.name.en || '').toUpperCase();
                                    const char = name.charAt(0);
                                    const letter = /^[A-Z]/.test(char) ? char : '#';

                                    if (letter !== currentLetter) {
                                        itemsToRender.push({ type: 'header', letter });
                                        currentLetter = letter;
                                    }
                                    itemsToRender.push(item);
                                });
                            } else {
                                // Standard Slice for other views
                                // @ts-ignore
                                itemsToRender = filteredItems.slice(0, viewMode === 'dense' ? undefined : visibleCount);
                            }

                            return itemsToRender.map((item, index) => {
                                // Header Tile
                                if ('type' in item && item.type === 'header') {
                                    return (
                                        <div
                                            key={`header-${item.letter}`}
                                            className="flex items-center justify-center p-2 rounded bg-arc-orange/20 border border-arc-orange/50 text-arc-orange text-2xl font-black font-mono shadow-[0_0_15px_rgba(255,107,53,0.1)] select-none"
                                        >
                                            {item.letter}
                                        </div>
                                    );
                                }

                                // Standard Item Render
                                // @ts-ignore - TS knows it's an Item here
                                const realItem = item as Item;
                                const status = getItemStatus(realItem.id);

                                if (viewMode === 'grid') {
                                    return <ItemCard key={realItem.id} item={realItem} onClick={() => setSelectedItem(realItem)} isCompact={false} questStatus={status} />;
                                } else if (viewMode === 'list') {
                                    return (
                                        <div
                                            key={realItem.id}
                                            onClick={() => setSelectedItem(realItem)}
                                            className="flex items-center gap-4 bg-arc-card/30 border border-white/5 rounded-xl p-3 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer group"
                                        >
                                            <div className={`w-12 h-12 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center relative overflow-hidden flex-shrink-0`}>
                                                <div className={`absolute inset-0 opacity-20 bg-${getRarityColor(realItem.rarity)}-500/20`} />
                                                {realItem.imageFilename ? (
                                                    <img src={realItem.imageFilename} alt="" className="w-full h-full object-contain p-1" />
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                                                )}
                                                {/* Quest Marker Node */}
                                                {status !== 'none' && (
                                                    <div className={`absolute top-0.5 left-0.5 z-10 p-0.5 rounded shadow-sm ${status === 'active' ? 'bg-purple-500/90' : 'bg-gray-500/50'}`}>
                                                        <Scroll size={10} className="text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-gray-200 truncate group-hover:text-white transition-colors">
                                                        {realItem.name[language] || realItem.name.en || realItem.id}
                                                    </h4>
                                                    <div className="text-xs text-gray-500 capitalize">{realItem.type}</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded border border-white/10 uppercase tracking-wider text-${getRarityColor(realItem.rarity)}-400 bg-black/20`}>
                                                        {realItem.rarity}
                                                    </span>
                                                    <div className="text-sm font-mono font-bold text-arc-green w-16 text-right">
                                                        ${realItem.value || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } else { // Dense Tile
                                    return (
                                        <div
                                            key={realItem.id}
                                            onClick={() => setSelectedItem(realItem)}
                                            className={`
                                                flex items-center gap-2 p-2 rounded hover:bg-white/10 cursor-pointer transition-colors group
                                                border-l-[3px] border-${getRarityColor(realItem.rarity)}-500/50 hover:border-${getRarityColor(realItem.rarity)}-500
                                                bg-black/20
                                            `}
                                        >
                                            <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                                                {realItem.imageFilename ? (
                                                    <img src={realItem.imageFilename} alt="" className="w-full h-full object-contain p-0.5 opacity-80 group-hover:opacity-100 transition-opacity" />
                                                ) : (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                                                )}
                                                {/* Quest Marker Node */}
                                                {status !== 'none' && (
                                                    <div className={`absolute top-0 left-0 z-10 p-0.5 rounded-br shadow-sm ${status === 'active' ? 'bg-purple-500/90' : 'bg-gray-500/50 hover:bg-purple-500/90'}`}>
                                                        <Scroll size={8} className="text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-medium text-gray-300 truncate group-hover:text-white leading-tight">
                                                    {realItem.name[language] || realItem.name.en || realItem.id}
                                                </div>
                                                <div className="text-[10px] font-mono font-bold text-arc-green/80 group-hover:text-arc-green leading-tight">
                                                    ${realItem.value || 0}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            });
                        })()}
                    </motion.div>

                    {/* Load More Trigger (Only for non-dense views where pagination applies) */}
                    {viewMode !== 'dense' && filteredItems.length > visibleCount && (
                        <div className="flex justify-center pb-20 mt-8">
                            <button
                                onClick={() => setVisibleCount(prev => prev + 50)}
                                className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full font-bold tracking-widest border border-white/10 transition-all active:scale-95"
                            >
                                LOAD MORE ({filteredItems.length - visibleCount})
                            </button>
                        </div>
                    )}
                </div>
            </div>

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
                            className="relative w-full max-w-2xl bg-arc-card border-2 border-arc-green rounded-3xl shadow-2xl z-10 overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-arc-green to-transparent opacity-50" />

                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-red-500/80 transition-colors z-50"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>

                            <div className="overflow-y-auto flex-1 p-8 scrollbar-hide">
                                <style>{`
                                    .scrollbar-hide {
                                        -ms-overflow-style: none;
                                        scrollbar-width: thin;
                                        scrollbar-color: rgba(255, 107, 53, 0.3) transparent;
                                    }
                                    .scrollbar-hide::-webkit-scrollbar {
                                        width: 6px;
                                    }
                                    .scrollbar-hide::-webkit-scrollbar-track {
                                        background: transparent;
                                    }
                                    .scrollbar-hide::-webkit-scrollbar-thumb {
                                        background: rgba(255, 107, 53, 0.4);
                                        border-radius: 3px;
                                    }
                                    .scrollbar-hide::-webkit-scrollbar-thumb:hover {
                                        background: rgba(255, 107, 53, 0.6);
                                    }
                                `}</style>

                                <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-shrink-0 mx-auto md:mx-0">
                                    <div className={`w-48 h-48 rounded-2xl flex items-center justify-center bg-black/30 border border-white/10 relative overflow-hidden group`}>
                                        {/* Rarity Glow */}
                                        <div className={`absolute inset-0 opacity-20 blur-xl bg-${getRarityColor(selectedItem.rarity)}`} />
                                        {selectedItem.imageFilename ? (
                                            <img
                                                src={selectedItem.imageFilename}
                                                alt={selectedItem.name[language] || selectedItem.name.en}
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
                                        {selectedItem.name[language] || selectedItem.name.en || selectedItem.id}
                                    </h2>

                                    <div className="space-y-4 text-gray-300 leading-relaxed">
                                        <p className="text-lg italic opacity-90 border-l-4 border-arc-orange pl-4 bg-white/5 py-2 rounded-r-lg">
                                            {selectedItem.description[language] || selectedItem.description.en || 'No description available.'}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('sort.value')}</div>
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

                                        {/* Recipe/Ingredients Section */}
                                        {selectedItem.recipe && typeof selectedItem.recipe === 'object' && Object.keys(selectedItem.recipe).length > 0 && (
                                            <div className="col-span-2">
                                                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">
                                                    Ingredientes {selectedItem.craftBench && `(${selectedItem.craftBench})`}
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-2">
                                                    {Object.entries(selectedItem.recipe).map(([ingredientId, qty]: [string, any]) => {
                                                        const ingredient = items.find(it => it.id === ingredientId);
                                                        const ingredientName = ingredient?.name ? (ingredient.name[language] || ingredient.name.en || ingredientId) : ingredientId;
                                                        const ingredientRarity = ingredient?.rarity || 'Common';
                                                        const rarityColor = ingredient ? getRarityColor(ingredient.rarity) : 'gray';
                                                        return (
                                                            <button
                                                                key={ingredientId}
                                                                onClick={() => ingredient ? setSelectedItem(ingredient) : null}
                                                                className={`relative group rounded-lg overflow-hidden border-2 border-${rarityColor}-500/30 hover:border-${rarityColor}-500/80 bg-black/30 hover:bg-black/50 transition-all duration-300 flex flex-col h-32`}
                                                            >
                                                                {/* Image Container */}
                                                                <div className="flex-1 flex items-center justify-center bg-black/40 overflow-hidden relative">
                                                                    {ingredient?.imageFilename ? (
                                                                        <img
                                                                            src={ingredient.imageFilename}
                                                                            alt={ingredientName}
                                                                            className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-4 h-4 rounded-full bg-gray-600" />
                                                                    )}
                                                                </div>

                                                                {/* Info Bottom */}
                                                                <div className="p-2 bg-black/60 border-t border-white/5 space-y-1">
                                                                    <div className="text-[10px] font-bold text-gray-200 line-clamp-2 leading-tight">
                                                                        {ingredientName}
                                                                    </div>
                                                                    <div className="flex items-center gap-1 justify-between">
                                                                        <div className="text-[10px] text-arc-green font-bold bg-arc-green/10 px-1.5 py-0.5 rounded font-mono">
                                                                            ×{qty}
                                                                        </div>
                                                                        <div className="text-[10px] text-gray-300 bg-black/40 px-1.5 py-0.5 rounded uppercase font-mono">
                                                                            {ingredientRarity.slice(0, 3)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Used In Section */}
                                        {selectedItem.usedIn && selectedItem.usedIn.length > 0 && (
                                            <div className="col-span-2">
                                                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">
                                                    Usado Para ({selectedItem.usedIn.length})
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-2">
                                                    {selectedItem.usedIn.map((u: any) => {
                                                        const target = items.find(it => it.id === u.id);
                                                        const localizedName = u.name ? (u.name[language] || u.name.en || u.id) : u.id;
                                                        const rarityColor = target ? getRarityColor(target.rarity) : 'gray';
                                                        return (
                                                            <button
                                                                key={u.id}
                                                                onClick={() => target ? setSelectedItem(target) : null}
                                                                className={`relative group rounded-lg overflow-hidden border-2 border-${rarityColor}-500/30 hover:border-${rarityColor}-500/80 bg-black/30 hover:bg-black/50 transition-all duration-300 flex flex-col h-32`}
                                                            >
                                                                {/* Image Container */}
                                                                <div className="flex-1 flex items-center justify-center bg-black/40 overflow-hidden relative">
                                                                    {target?.imageFilename ? (
                                                                        <img
                                                                            src={target.imageFilename}
                                                                            alt={localizedName}
                                                                            className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-4 h-4 rounded-full bg-gray-600" />
                                                                    )}
                                                                </div>

                                                                {/* Info Bottom */}
                                                                <div className="p-2 bg-black/60 border-t border-white/5 space-y-1">
                                                                    <div className="text-[10px] font-bold text-gray-200 line-clamp-2 leading-tight">
                                                                        {localizedName}
                                                                    </div>
                                                                    <div className="flex items-center gap-1 flex-wrap">
                                                                        {u.bench && typeof u.bench === 'string' && (
                                                                            <div className="text-[10px] text-gray-300 bg-black/40 px-1.5 py-0.5 rounded uppercase font-mono border border-white/10">
                                                                                {u.bench.split('_')[0]}
                                                                            </div>
                                                                        )}
                                                                        {u.quantity != null && (
                                                                            <div className="text-[10px] text-arc-green font-bold bg-arc-green/10 px-1.5 py-0.5 rounded font-mono">
                                                                                ×{u.quantity}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        </div>
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
