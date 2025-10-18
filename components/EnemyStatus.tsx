import React from 'react';
// Fix: Corrected module import path for types.
import type { Enemy } from '../types';
import EnemyPortraitCanvas from './EnemyPortraitCanvas';

interface EnemyStatusProps {
    enemy: Enemy;
}

const HealthBar: React.FC<{ value: number, max: number }> = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-gray-700/50 rounded-full h-4 border border-gray-600">
            <div 
                className="bg-red-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

const EnemyStatus: React.FC<EnemyStatusProps> = ({ enemy }) => {
    return (
        <div className="bg-black/30 p-4 border border-red-900/50 flex flex-col items-center">
            <EnemyPortraitCanvas enemyName={enemy.name} emotion={enemy.emotion} />
            <h2 className="text-lg text-red-400 mt-3 mb-2 uppercase tracking-widest">{enemy.name}</h2>
            <div className="space-y-2 text-gray-300 w-full">
                <p className="text-sm text-gray-400 italic pt-1 text-center">{enemy.description}</p>
                <div className="pt-2">
                    <span className="mb-1 block text-center">INTEGRITY: {enemy.hp}/{enemy.maxHp}</span>
                    <HealthBar value={enemy.hp} max={enemy.maxHp} />
                </div>
            </div>
        </div>
    );
};

export default EnemyStatus;