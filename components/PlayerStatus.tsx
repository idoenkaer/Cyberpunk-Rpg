import React from 'react';
// Fix: Corrected module import path for types.
import type { PlayerState, Item } from '../types';

interface PlayerStatusProps {
    player: PlayerState;
    stats: { attack: number, defense: number, maxHp: number };
    onEquipItem: (item: Item) => void;
}

const rarityColorMap = {
    Common: 'text-gray-400 border-gray-600',
    Uncommon: 'text-green-400 border-green-700',
    Rare: 'text-blue-400 border-blue-700',
};

const HealthBar: React.FC<{ value: number, max: number }> = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-gray-700/50 rounded-full h-4 border border-gray-600">
            <div 
                className="bg-green-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

const PlayerStatus: React.FC<PlayerStatusProps> = ({ player, stats, onEquipItem }) => {
    const renderEquippedItem = (slot: keyof typeof player.equippedItems) => {
        const item = player.equippedItems[slot];
        const rarity = item ? rarityColorMap[item.rarity] : 'text-gray-500 border-gray-700';
        return (
            <div className="flex justify-between items-center text-sm">
                <span className="uppercase">{slot}:</span>
                <span className={`font-bold p-1 border-b-2 ${rarity}`}>
                    {item ? item.name : 'Empty'}
                </span>
            </div>
        );
    };
    
    return (
        <div className="bg-black/30 p-4 border border-gray-700 flex-1 flex flex-col">
            {/* Core Stats */}
            <h2 className="text-lg text-cyan-400 mb-3 uppercase tracking-widest">Status</h2>
            <div className="space-y-2 text-gray-300">
                <div className="flex justify-between"><span>ARCHETYPE:</span><span className="text-white font-bold">{player.archetype}</span></div>
                <div className="flex justify-between"><span>FACTION:</span><span className="text-white font-bold">{player.faction}</span></div>
                <div className="flex justify-between items-center"><span>CREDITS:</span><span className="text-yellow-400 font-bold">¥{player.credits}</span></div>
                <div className="pt-2">
                    <span className="mb-1 block">HEALTH: {player.hp}/{stats.maxHp}</span>
                    <HealthBar value={player.hp} max={stats.maxHp} />
                </div>
                <div className="flex justify-between pt-2"><span>ATTACK:</span><span className="text-white font-bold">{stats.attack}</span></div>
                <div className="flex justify-between"><span>DEFENSE:</span><span className="text-white font-bold">{stats.defense}</span></div>
            </div>

            {/* Equipment */}
            <h2 className="text-lg text-cyan-400 mt-4 mb-2 uppercase tracking-widest">Loadout</h2>
            <div className="space-y-2 bg-black/20 p-2 border border-gray-800">
                {renderEquippedItem('weapon')}
                {renderEquippedItem('head')}
                {renderEquippedItem('chest')}
                {renderEquippedItem('legs')}
            </div>
            
            {/* Inventory */}
            <h2 className="text-lg text-cyan-400 mt-4 mb-2 uppercase tracking-widest">Inventory</h2>
            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
                {player.inventory.length > 0 ? player.inventory.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-black/20 p-1 border-l-2 border-gray-700">
                        <span className={`${rarityColorMap[item.rarity].split(' ')[0]}`}>{item.name}</span>
                        {item.itemType !== 'consumable' && (
                             <button onClick={() => onEquipItem(item)} className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-0.5 rounded">
                                 Equip
                             </button>
                        )}
                    </div>
                )) : <p className="text-gray-500 italic text-sm">-- Empty --</p>}
            </div>
        </div>
    );
};

export default PlayerStatus;