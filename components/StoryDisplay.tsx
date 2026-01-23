import React, { useEffect, useRef, useState } from 'react';
// Fix: Corrected import path for types module.
import type { Item } from '../types';

interface StoryDisplayProps {
    history: string[];
    isLoading: boolean;
    itemOnGround: Item | null;
    onTakeItem: () => void;
}

const rarityColorMap = {
    Common: 'pixel-border--grey',
    Uncommon: 'pixel-border--green',
    Rare: 'pixel-border',
};

const StoryDisplay: React.FC<StoryDisplayProps> = ({ history, isLoading, itemOnGround, onTakeItem }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const endOfHistoryRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

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
            className="h-full overflow-y-auto pr-4 custom-scrollbar"
        >
            <div className="pt-1">
                {history.map((text, index) => {
                    const isPlayerChoice = text.startsWith('>');
                    return (
                        <p 
                            key={index}
                            className={`whitespace-pre-wrap mb-3 ${isPlayerChoice ? 'text-fuchsia-400 italic' : 'text-gray-300'}`}
                        >
                            {text}
                        </p>
                    );
                })}
                {itemOnGround && (
                    <div className="my-4">
                        <div className={`bg-black/50 p-3 ${rarityColorMap[itemOnGround.rarity]}`}>
                            <p className="text-lg text-cyan-300">You found an item: {itemOnGround.name}</p>
                            <p className="text-sm text-gray-400 italic mb-2">"{itemOnGround.flavorText}"</p>
                            <p className="text-yellow-400 font-bold">{renderItemStats(itemOnGround)}</p>
                        </div>
                         <button 
                            onClick={onTakeItem}
                            className="w-full mt-2 pixel-button"
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