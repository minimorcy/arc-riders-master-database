import React, { useState, useMemo } from 'react';
import { Search, CheckCircle, Circle } from 'lucide-react';
import questsData from '../data/quests.json';
import { useQuestStore } from '../hooks/useQuestStore';

type Quest = {
    id: string;
    name: Record<string, string>;
    trader: string;
    description?: Record<string, string>;
    objectives?: Record<string, string>[];
    rewardItemIds?: { itemId: string; quantity: number }[];
    nextQuestIds?: string[];
};

interface QuestListProps {
    onSelectQuest: (quest: Quest) => void;
}

export default function QuestList({ onSelectQuest }: QuestListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const { isCompleted, toggleQuest } = useQuestStore();

    const filteredQuests = useMemo(() => {
        const lowerTerm = searchTerm.toLowerCase();
        return (questsData as Quest[]).filter(q => {
            const name = (q.name.es || q.name.en || q.id).toLowerCase();
            return name.includes(lowerTerm) || q.trader.toLowerCase().includes(lowerTerm);
        });
    }, [searchTerm]);

    // Calculate Quest Depths for sorting
    const questDepths = useMemo(() => {
        const depths: Record<string, number> = {};
        const allQuests = questsData as Quest[];

        // Initialize all with 0
        allQuests.forEach(q => depths[q.id] = 0);

        // Map id -> quest to fast lookup
        const questMap = new Map(allQuests.map(q => [q.id, q]));

        let changed = true;
        let iterations = 0;
        while (changed && iterations < 100) {
            changed = false;
            iterations++;
            allQuests.forEach(q => {
                if (q.nextQuestIds) {
                    q.nextQuestIds.forEach(nextId => {
                        if (depths[nextId] <= depths[q.id]) {
                            depths[nextId] = depths[q.id] + 1;
                            changed = true;
                        }
                    });
                }
            });
        }
        return depths;
    }, []);

    // Group by Trader and Sort
    const groupedQuests = useMemo(() => {
        const groups: Record<string, Quest[]> = {};
        const sortedFiltered = [...filteredQuests].sort((a, b) => {
            const depthA = questDepths[a.id] || 0;
            const depthB = questDepths[b.id] || 0;
            return depthA - depthB;
        });

        sortedFiltered.forEach(q => {
            const trader = q.trader || 'Unknown';
            if (!groups[trader]) groups[trader] = [];
            groups[trader].push(q);
        });
        return groups;
    }, [filteredQuests, questDepths]);

    const getTraderColor = (trader: string) => {
        switch (trader) {
            case 'Celeste': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
            case 'Shani': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
            case 'Tian Wen': return 'text-red-400 border-red-500/30 bg-red-500/10';
            case 'Lance': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
            default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
        }
    };

    return (
        <div className="h-full flex flex-col bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-700 overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-zinc-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Buscar misión o comerciante..."
                        className="w-full bg-zinc-950/50 border border-zinc-700 text-zinc-100 text-sm rounded-lg pl-9 pr-4 py-2 focus:ring-1 focus:ring-arc-orange focus:border-arc-orange outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {Object.entries(groupedQuests).map(([trader, quests]) => (
                    <div key={trader}>
                        <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 px-2 ${getTraderColor(trader).split(' ')[0]}`}>
                            {trader}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {quests.map(quest => {
                                const completed = isCompleted(quest.id);
                                return (
                                    <div
                                        key={quest.id}
                                        className={`flex items-center gap-2 p-2 rounded-lg border bg-zinc-900 transition-all ${getTraderColor(trader)} border-opacity-30 bg-opacity-0 hover:bg-opacity-100 ${completed ? 'opacity-50' : ''}`}
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleQuest(quest.id);
                                            }}
                                            className={`flex-shrink-0 transition-colors ${completed ? 'text-green-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                                            title={completed ? "Marcar como pendiente" : "Marcar como completada"}
                                        >
                                            {completed ? <CheckCircle size={18} /> : <Circle size={18} />}
                                        </button>
                                        <button
                                            onClick={() => onSelectQuest(quest)}
                                            className="flex-1 text-left"
                                        >
                                            <div className={`font-bold text-sm text-zinc-200 ${completed ? 'line-through text-zinc-500' : ''}`}>
                                                {quest.name.es || quest.name.en || quest.id}
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {filteredQuests.length === 0 && (
                    <div className="text-center py-10 text-zinc-500">
                        No se encontraron misiones.
                    </div>
                )}
            </div>
        </div>
    );
}
