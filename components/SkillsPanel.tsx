// components/SkillsPanel.tsx
import React from 'react';
// Fix: Corrected module import paths for types and constants.
import type { PlayerState, Skill } from '../types';
import { SKILL_TREES } from '../constants';

interface SkillsPanelProps {
    player: PlayerState;
    onUnlockSkill: (skill: Skill) => void;
}

const SkillsPanel: React.FC<SkillsPanelProps> = ({ player, onUnlockSkill }) => {
    const archetypeSkills = SKILL_TREES[player.archetype];

    const xpForNextLevel = player.level * 100;
    const xpProgress = xpForNextLevel > 0 ? (player.xp / xpForNextLevel) * 100 : 0;

    return (
        <div className="bg-black/30 p-4 border border-gray-700 h-full flex flex-col">
            <h2 className="text-lg text-cyan-400 mb-2 uppercase tracking-widest">Intellect</h2>
            <div className="space-y-2 text-gray-300 mb-4">
                <div className="flex justify-between"><span>LEVEL:</span><span className="text-white font-bold">{player.level}</span></div>
                <div>
                    <span className="text-sm">XP: {player.xp} / {xpForNextLevel}</span>
                    <div className="w-full bg-gray-700/50 rounded-full h-2.5 border border-gray-600 mt-1">
                        <div className="bg-fuchsia-500 h-full rounded-full" style={{ width: `${xpProgress}%` }}></div>
                    </div>
                </div>
                <div className="flex justify-between pt-1"><span>SKILL POINTS:</span><span className="text-yellow-400 font-bold">{player.skillPoints}</span></div>
            </div>

            <h2 className="text-lg text-cyan-400 mt-2 mb-2 uppercase tracking-widest">Skill Tree</h2>
            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                {archetypeSkills.map((skill) => {
                    const isUnlocked = player.unlockedSkills.includes(skill.name);
                    const canUnlock = player.skillPoints > 0;
                    return (
                        <div key={skill.name} className={`p-2 border-l-4 ${isUnlocked ? 'border-cyan-400 bg-cyan-900/20' : 'border-gray-600 bg-black/20'}`}>
                            <div className="flex justify-between items-center">
                                <h3 className={`font-bold ${isUnlocked ? 'text-cyan-300' : 'text-gray-400'}`}>{skill.name}</h3>
                                {!isUnlocked && (
                                    <button
                                        onClick={() => onUnlockSkill(skill)}
                                        disabled={!canUnlock}
                                        className="text-xs bg-gray-600 hover:bg-cyan-600 disabled:bg-gray-800 disabled:cursor-not-allowed px-2 py-0.5 rounded transition-colors"
                                    >
                                        Unlock (1)
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{skill.description}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SkillsPanel;