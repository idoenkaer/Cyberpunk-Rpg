
import React from 'react';
import type { Enemy } from '../types';

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
        <div className="bg-black/30 p-4 border border-red-900/50">
            <h2 className="text-lg text-red-400 mb-3 uppercase tracking-widest">Hostile Detected</h2>
            <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                    <span>ENTITY:</span>
                    <span className="text-white font-bold">{enemy.name}</span>
                </div>
                <p className="text-sm text-gray-400 italic pt-1">{enemy.description}</p>
                <div className="pt-2">
                    <span className="mb-1 block">INTEGRITY: {enemy.hp}/{enemy.maxHp}</span>
                    <HealthBar value={enemy.hp} max={enemy.maxHp} />
                </div>
            </div>
        </div>
    );
};

export default EnemyStatus;
