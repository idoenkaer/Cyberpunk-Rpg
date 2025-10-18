
import React from 'react';
import type { PlayerState } from '../types';

interface PlayerStatusProps {
    player: PlayerState;
}

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


const PlayerStatus: React.FC<PlayerStatusProps> = ({ player }) => {
    return (
        <div className="bg-black/30 p-4 border border-gray-700">
            <h2 className="text-lg text-cyan-400 mb-3 uppercase tracking-widest">Status</h2>
            <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                    <span>ARCHETYPE:</span>
                    <span className="text-white font-bold">{player.archetype}</span>
                </div>
                <div className="flex justify-between">
                    <span>FACTION:</span>
                    <span className="text-white font-bold">{player.faction}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span>CREDITS:</span>
                    <span className="text-yellow-400 font-bold">¥{player.credits}</span>
                </div>
                <div className="pt-2">
                    <span className="mb-1 block">HEALTH: {player.hp}/{player.maxHp}</span>
                    <HealthBar value={player.hp} max={player.maxHp} />
                </div>
            </div>
        </div>
    );
};

export default PlayerStatus;
