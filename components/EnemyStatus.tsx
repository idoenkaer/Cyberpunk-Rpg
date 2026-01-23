import React from 'react';
// Fix: Corrected import path for types module.
import type { Enemy } from '../types';

interface EnemyStatusProps {
    enemy: Enemy;
}

const HealthBar: React.FC<{ value: number, max: number }> = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="pixel-health-bar pixel-health-bar--enemy">
            <div style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const EnemyStatus: React.FC<EnemyStatusProps> = ({ enemy }) => {
    return (
        <div className="bg-black/50 p-4 pixel-border pixel-border--red w-full sm:w-auto md:max-w-xs">
            <h2 className="text-lg text-red-400 mt-1 mb-2 uppercase tracking-widest text-center">{enemy.name}</h2>
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