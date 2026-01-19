import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
    Position,
    Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import questsData from '../data/quests.json';
import { X, LayoutGrid, List } from 'lucide-react';
import QuestList from './QuestList';

// --- Types ---
type Quest = {
    id: string;
    name: Record<string, string>;
    trader: string;
    description?: Record<string, string>;
    objectives?: Record<string, string>[];
    rewardItemIds?: { itemId: string; quantity: number }[];
    nextQuestIds?: string[];
};

// --- Layout Helper ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    dagreGraph.setGraph({ rankdir: 'LR' }); // Left to Right layout

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: Position.Left,
            sourcePosition: Position.Right,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

// --- Custom Node ---
const QuestNode = ({ data }: { data: { label: string; trader: string } }) => {
    // Color coding by trader
    const getBorderColor = (trader: string) => {
        switch (trader) {
            case 'Celeste': return '#3b82f6'; // blue
            case 'Shani': return '#10b981'; // green
            case 'Tian Wen': return '#ef4444'; // red
            case 'Lance': return '#f59e0b'; // amber
            default: return '#71717a'; // gray
        }
    };

    return (
        <div
            className="px-4 py-3 rounded-lg shadow-lg bg-zinc-900 border-2 min-h-[60px] flex flex-col justify-center w-[240px] hover:scale-105 transition-transform cursor-pointer"
            style={{ borderColor: getBorderColor(data.trader) }}
        >
            <Handle type="target" position={Position.Left} className="!bg-zinc-400" />
            <div className="font-bold text-sm text-zinc-100 line-clamp-2">{data.label}</div>
            <div className="text-xs text-zinc-400">{data.trader}</div>
            <Handle type="source" position={Position.Right} className="!bg-zinc-400" />
        </div>
    );
};

const nodeTypes = {
    quest: QuestNode,
};

// --- Main Component ---
export default function QuestTree() {
    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
    const [viewMode, setViewMode] = useState<'tree' | 'list'>('list');

    // Auto-switch to list on mobile
    useEffect(() => {
        if (window.innerWidth < 768) {
            setViewMode('list');
        }
    }, []);

    // 1. Process Data into Nodes and Edges
    const layoutedElements = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];
        const createdEdges = new Set<string>();

        (questsData as Quest[]).forEach((quest) => {
            // Create Node
            // Prefer Spanish, fallback to English, then ID
            const label = quest.name.es || quest.name.en || quest.id;

            nodes.push({
                id: quest.id,
                type: 'quest',
                data: {
                    label: label,
                    trader: quest.trader,
                    originalData: quest // Store full quest data for click handler
                },
                position: { x: 0, y: 0 }, // Initial position, will be computed
            });

            // Create Edges
            if (quest.nextQuestIds) {
                quest.nextQuestIds.forEach((nextId) => {
                    // Check if target node actually exists in our data to avoid dangling edges
                    const targetExists = (questsData as Quest[]).some(q => q.id === nextId);
                    if (targetExists) {
                        const edgeId = `${quest.id}-${nextId}`;
                        if (!createdEdges.has(edgeId)) {
                            edges.push({
                                id: edgeId,
                                source: quest.id,
                                target: nextId,
                                type: 'smoothstep',
                                animated: false,
                                style: { stroke: '#52525b' }
                            });
                            createdEdges.add(edgeId);
                        }
                    }
                });
            }
        });

        return getLayoutedElements(nodes, edges);
    }, []);

    const { nodes: initialNodes, edges: initialEdges } = layoutedElements;

    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        const questData = (node.data.originalData as Quest);
        setSelectedQuest(questData);
    }, []);

    return (
        <div className="flex flex-col h-[80vh] gap-4 relative">
            {/* View Switcher */}
            <div className="flex justify-end gap-2 absolute top-4 right-4 z-40 md:static md:mb-0">
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-1 flex items-center">
                    <button
                        onClick={() => setViewMode('tree')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'tree' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
                        title="Vista de Árbol"
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
                        title="Vista de Lista"
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-hidden rounded-xl border border-zinc-700 bg-black/40 backdrop-blur-sm">
                {viewMode === 'tree' ? (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        fitView
                        colorMode="dark"
                        minZoom={0.1}
                    >
                        <Controls />
                        <MiniMap
                            nodeColor={(n) => {
                                switch (n.data.trader) {
                                    case 'Celeste': return '#3b82f6';
                                    case 'Shani': return '#10b981';
                                    case 'Tian Wen': return '#ef4444';
                                    case 'Lance': return '#f59e0b';
                                    default: return '#71717a';
                                }
                            }}
                            maskColor="rgba(0, 0, 0, 0.6)"
                            className='!bg-zinc-900 border !border-zinc-700'
                        />
                        <Background gap={16} size={1} color="#3f3f46" />
                    </ReactFlow>
                ) : (
                    <QuestList onSelectQuest={setSelectedQuest} />
                )}
            </div>

            {/* Details Sidebar / Modal (Responsive) */}
            {selectedQuest && (
                <div className="fixed inset-0 z-50 md:absolute md:inset-y-0 md:right-0 md:w-[400px] bg-zinc-950 md:bg-zinc-900 md:border-l border-zinc-700 p-6 shadow-2xl overflow-y-auto animate-slide-in-right">
                    <button
                        onClick={() => setSelectedQuest(null)}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="mt-8 md:mt-4 space-y-6 pb-10">
                        <div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full border border-opacity-20
                        ${selectedQuest.trader === 'Celeste' ? 'bg-blue-500/10 border-blue-500 text-blue-400' :
                                    selectedQuest.trader === 'Shani' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' :
                                        selectedQuest.trader === 'Tian Wen' ? 'bg-red-500/10 border-red-500 text-red-400' :
                                            selectedQuest.trader === 'Lance' ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-gray-500/10 border-gray-500 text-gray-400'
                                }`}>
                                {selectedQuest.trader.toUpperCase()}
                            </span>
                            <h2 className="text-2xl font-bold mt-3 text-white">
                                {selectedQuest.name.es || selectedQuest.name.en}
                            </h2>
                        </div>

                        {selectedQuest.description && (
                            <div className="text-zinc-300 text-sm leading-relaxed">
                                {selectedQuest.description.es || selectedQuest.description.en}
                            </div>
                        )}

                        {selectedQuest.objectives && selectedQuest.objectives.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Objetivos</h3>
                                <ul className="space-y-2">
                                    {selectedQuest.objectives.map((obj, idx) => (
                                        <li key={idx} className="flex gap-3 text-sm text-zinc-300 bg-zinc-800/50 p-3 rounded-lg border border-zinc-800">
                                            <span className="text-arc-orange font-bold">{idx + 1}.</span>
                                            <span>{obj.es || obj.en}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {selectedQuest.rewardItemIds && selectedQuest.rewardItemIds.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Recompensas</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {selectedQuest.rewardItemIds.map((reward, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                                            <span className="text-sm text-zinc-300 font-mono capitalize">{reward.itemId.replace(/_/g, ' ')}</span>
                                            <span className="text-sm font-bold text-white bg-zinc-700 px-2 py-1 rounded">x{reward.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
