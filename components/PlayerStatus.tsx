// components/PlayerStatus.tsx
import React from 'react';
import type { Player } from '../types';
import GeneratedPortrait from './GeneratedPortrait';

interface PlayerStatusProps {
    player: Player;
}

const HealthBar: React.FC<{ value: number, max: number }> = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="pixel-health-bar pixel-health-bar--player">
            <div style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const Stat: React.FC<{ label: string, value: number | string }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="font-mono text-cyan-300">{value}</span>
    </div>
);

const PlayerStatus: React.FC<PlayerStatusProps> = ({ player }) => {
    const portraitPrompt = `A pixel art portrait of a cyberpunk character named '${player.name}'. 16-bit, head and shoulders view, gritty, neon-lit background.`;

    return (
        <div className="bg-black/50 p-4 pixel-border flex flex-col items-center w-full sm:w-auto md:max-w-xs">
            <GeneratedPortrait 
                prompt={portraitPrompt}
                alt={`Portrait of ${player.name}`}
                cacheKey={`player-${player.name}`}
            />
            <h2 className="text-xl text-cyan-300 mt-3 mb-2 uppercase tracking-widest">{player.name}</h2>
            <div className="space-y-2 text-gray-300 w-full">
                <div>
                    <span className="mb-1 block text-center">HEALTH: {player.hp}/{player.maxHp}</span>
                    <HealthBar value={player.hp} max={player.maxHp} />
                </div>
                <div className="pt-2">
                    <Stat label="Attack" value={player.attack} />
                    <Stat label="Defense" value={player.defense} />
                </div>
                <div className="pt-2">
                    <h3 className="text-cyan-400 uppercase tracking-widest text-center mb-1">[ Inventory ]</h3>
                    <div className="text-center text-gray-400 text-sm h-16 overflow-y-auto custom-scrollbar-thin">
                        {player.inventory.length > 0 ? (
                            player.inventory.map((item, index) => (
                                <p key={index}>{item.name}</p>
                            ))
                        ) : (
                            <p className="italic">Empty</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerStatus;