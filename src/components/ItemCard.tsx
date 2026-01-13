import React from 'react';
import { motion } from 'framer-motion';

interface Item {
    id: string;
    name: { [key: string]: string };
    rarity: string;
    imageFilename?: string;
    value?: number;
    weightKg?: number;
    type: string;
}

interface ItemCardProps {
    item: Item;
    onClick: () => void;
    isCompact?: boolean;
}

const RARITY_STYLES = {
    'Common': {
        border: 'border-slate-600/30',
        hoverBorder: 'hover:border-slate-500',
        glow: 'hover:shadow-slate-500/20',
        bg: 'from-slate-900/40',
        text: 'text-slate-400',
        indicator: 'bg-slate-500'
    },
    'Uncommon': {
        border: 'border-emerald-500/30',
        hoverBorder: 'hover:border-emerald-400',
        glow: 'hover:shadow-emerald-500/20',
        bg: 'from-emerald-900/20',
        text: 'text-emerald-400',
        indicator: 'bg-emerald-500'
    },
    'Rare': {
        border: 'border-blue-500/30',
        hoverBorder: 'hover:border-blue-400',
        glow: 'hover:shadow-blue-500/20',
        bg: 'from-blue-900/20',
        text: 'text-blue-400',
        indicator: 'bg-blue-500'
    },
    'Epic': {
        border: 'border-purple-500/40',
        hoverBorder: 'hover:border-purple-400',
        glow: 'hover:shadow-purple-500/30',
        bg: 'from-purple-900/30',
        text: 'text-purple-400',
        indicator: 'bg-purple-500'
    },
    'Legendary': {
        border: 'border-orange-500/50',
        hoverBorder: 'hover:border-orange-400',
        glow: 'hover:shadow-orange-500/40',
        bg: 'from-orange-900/30',
        text: 'text-orange-400',
        indicator: 'bg-orange-500'
    }
};

export default function ItemCard({ item, onClick, isCompact = false }: ItemCardProps) {
    const styles = RARITY_STYLES[item.rarity as keyof typeof RARITY_STYLES] || RARITY_STYLES['Common'];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "50px" }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={onClick}
            className={`relative group bg-gradient-to-b ${styles.bg} to-[#151b33] rounded-xl cursor-pointer overflow-hidden border-2 ${styles.border} ${styles.hoverBorder} transition-all duration-300 shadow-lg hover:shadow-2xl ${styles.glow} ${isCompact ? 'p-2' : 'p-3'}`}
        >
            {/* Rarity Indicator Top Right */}
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/10 to-transparent -mr-8 -mt-8 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />

            {/* Image Container */}
            <div className={`relative aspect-square flex items-center justify-center bg-black/20 rounded-lg group-hover:bg-black/40 transition-colors ${isCompact ? 'mb-2 p-1' : 'mb-3 p-2'}`}>
                {item.imageFilename ? (
                    <img
                        src={item.imageFilename}
                        alt={item.name.es || item.name.en}
                        loading="lazy"
                        className="w-full h-full object-contain filter drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width={isCompact ? "32" : "48"} height={isCompact ? "32" : "48"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="space-y-1 text-center">
                <h3 className={`font-bold leading-tight text-gray-100 line-clamp-2 flex items-center justify-center ${isCompact ? 'text-xs h-8' : 'text-sm md:text-base h-10'}`}>
                    {item.name.es || item.name.en}
                </h3>
                {!isCompact && (
                    <div className="flex items-center justify-center gap-2 text-xs">
                        <span className={`font-mono ${styles.text} font-bold uppercase`}>
                            {item.rarity === 'Common' ? 'Común' : item.rarity}
                        </span>
                    </div>
                )}
                <div className={`text-arc-green font-mono font-bold ${isCompact ? 'text-xs' : 'text-sm'}`}>
                    ${item.value || 0}
                </div>
            </div>

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
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

function getRarityBorderColor(rarity: string) {
    switch (rarity) {
        case 'Common': return 'border-gray-500';
        case 'Uncommon': return 'border-green-500';
        case 'Rare': return 'border-blue-500';
        case 'Epic': return 'border-purple-500';
        case 'Legendary': return 'border-orange-500';
        default: return 'border-gray-500';
    }
}
