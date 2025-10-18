import React, { useEffect, useRef, useState } from 'react';
// Fix: Corrected module import path for types.
import type { Item } from '../types';

interface StoryDisplayProps {
    history: string[];
    isLoading: boolean;
    itemOnGround: Item | null;
    onTakeItem: () => void;
}

const rarityColorMap = {
    Common: 'border-gray-500',
    Uncommon: 'border-green-500',
    Rare: 'border-blue-500',
};

const StoryDisplay: React.FC<StoryDisplayProps> = ({ history, isLoading, itemOnGround, onTakeItem }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const endOfHistoryRef = useRef<HTMLDivElement>(null);
    const [overscroll, setOverscroll] = useState(0);
    const overscrollTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);
    
    useEffect(() => {
        return () => {
            if (overscrollTimeoutRef.current) {
                clearTimeout(overscrollTimeoutRef.current);
            }
        };
    }, []);

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        const container = scrollContainerRef.current;
        if (!container) return;

        if (container.scrollTop === 0 && e.deltaY < 0) {
            e.preventDefault();
            const newOverscroll = Math.min(overscroll + Math.abs(e.deltaY) * 0.2, 50);
            setOverscroll(newOverscroll);
            if (overscrollTimeoutRef.current) clearTimeout(overscrollTimeoutRef.current);
            overscrollTimeoutRef.current = window.setTimeout(() => setOverscroll(0), 300);
        }
    };

    const renderItemStats = (item: Item) => {
        const stats = [];
        if (item.attackBonus) stats.push(`ATK: +${item.attackBonus}`);
        if (item.defenseBonus) stats.push(`DEF: +${item.defenseBonus}`);
        if (item.hpBonus) stats.push(`HP: +${item.hpBonus}`);
        return stats.join(' | ');
    }

    return (
        <div 
            ref={scrollContainerRef}
            onWheel={handleWheel}
            className="h-full overflow-y-auto pr-4 custom-scrollbar"
        >
            <div
                style={{ transform: `translateY(${overscroll}px)` }}
                className="transition-transform duration-300 ease-out pt-4"
            >
                {history.map((text, index) => {
                    const isPlayerChoice = text.startsWith('>');
                    return (
                        <p 
                            key={index}
                            className={`whitespace-pre-wrap mb-4 ${isPlayerChoice ? 'text-fuchsia-400 italic' : 'text-gray-300'}`}
                        >
                            {text}
                        </p>
                    );
                })}
                {itemOnGround && (
                    <div className="my-4">
                        <div className={`bg-black/50 p-3 border-l-4 ${rarityColorMap[itemOnGround.rarity]}`}>
                            <p className="text-lg text-cyan-300">You found an item: {itemOnGround.name}</p>
                            <p className="text-sm text-gray-400 italic mb-2">"{itemOnGround.flavorText}"</p>
                            <p className="text-yellow-400 font-bold">{renderItemStats(itemOnGround)}</p>
                        </div>
                         <button 
                            onClick={onTakeItem}
                            className="w-full mt-2 text-lg bg-cyan-600/30 hover:bg-cyan-500/30 text-white font-bold py-1 px-4 border-b-2 border-cyan-800/50 hover:border-cyan-700/50 rounded transition-colors duration-200"
                         >
                             [ Take ]
                         </button>
                    </div>
                )}
                <div ref={endOfHistoryRef} />
            </div>
        </div>
    );
};

export default StoryDisplay;