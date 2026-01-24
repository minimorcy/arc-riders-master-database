import React, { useState, useMemo } from 'react';
import { Search, CheckCircle, Circle } from 'lucide-react';
import questsData from '../data/quests.json';
import { useQuestStore } from '../hooks/useQuestStore';
import { useLanguage } from '../hooks/useLanguage';

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
    const { language, t } = useLanguage();

    const filteredQuests = useMemo(() => {
        const lowerTerm = searchTerm.toLowerCase();
        return (questsData as Quest[]).filter(q => {
            const name = (q.name[language] || q.name.en || q.id).toLowerCase();
            return name.includes(lowerTerm) || q.trader.toLowerCase().includes(lowerTerm);
        });
    }, [searchTerm, language]);

    // Calculate Quest Sequence Order for sorting (strict topological order)
    const questOrder = useMemo(() => {
        const order: Record<string, number> = {};
        const allQuests = questsData as Quest[];

        // Build adjacency list
        const inDegree: Record<string, number> = {};
        const graph: Record<string, string[]> = {};

        allQuests.forEach(q => {
            inDegree[q.id] = 0;
            graph[q.id] = [];
        });

        allQuests.forEach(q => {
            if (q.nextQuestIds) {
                q.nextQuestIds.forEach(nextId => {
                    if (graph[q.id]) {
                        graph[q.id].push(nextId);
                    }
                    if (inDegree[nextId] !== undefined) {
                        inDegree[nextId]++;
                    }
                });
            }
        });

        // Kahn's algorithm for topological sort
        const queue: string[] = [];
        const sorted: string[] = [];

        // Find items with no prerequisites
        Object.keys(inDegree).forEach(id => {
            if (inDegree[id] === 0) {
                queue.push(id);
            }
        });

        // Sort initial queue for stable results
        queue.sort();

        while (queue.length > 0) {
            const current = queue.shift()!;
            sorted.push(current);

            const neighbors = graph[current] || [];
            // Sort neighbors before adding to queue to keep order consistent
            neighbors.sort();

            neighbors.forEach(nextId => {
                inDegree[nextId]--;
                if (inDegree[nextId] === 0) {
                    queue.push(nextId);
                }
            });
        }

        // Map IDs to their sequence index
        sorted.forEach((id, index) => {
            order[id] = index;
        });

        // Fallback for any orphans
        allQuests.forEach(q => {
            if (order[q.id] === undefined) {
                order[q.id] = 9999;
            }
        });

        return order;
    }, []);

    // Group by Trader and Sort within each group
    const groupedQuests = useMemo(() => {
        const groups: Record<string, Quest[]> = {};

        // First, group by trader
        filteredQuests.forEach(q => {
            const trader = q.trader || 'Unknown';
            if (!groups[trader]) groups[trader] = [];
            groups[trader].push(q);
        });

        // Then, sort each group by unique sequence order
        Object.keys(groups).forEach(trader => {
            groups[trader].sort((a, b) => {
                const orderA = questOrder[a.id] ?? 9999;
                const orderB = questOrder[b.id] ?? 9999;
                return orderA - orderB;
            });
        });

        return groups;
    }, [filteredQuests, questOrder]);

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
            <div className="p-2 border-b border-zinc-700/50 bg-black/20">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder={t("search.placeholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700/50 rounded-lg py-1.5 pl-9 pr-3 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors placeholder-zinc-600"
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
                                            title={completed ? t("quest.mark.pending") : t("quest.mark.completed")}
                                        >
                                            {completed ? <CheckCircle size={18} /> : <Circle size={18} />}
                                        </button>
                                        <button
                                            onClick={() => onSelectQuest(quest)}
                                            className="flex-1 text-left"
                                        >
                                            <div className={`font-bold text-sm text-zinc-200 ${completed ? 'line-through text-zinc-500' : ''}`}>
                                                {quest.name[language] || quest.name.en || quest.id}
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
