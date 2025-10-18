// components/SkillsPanel.tsx
import React from 'react';
import { Player } from '../types';

interface SkillsPanelProps {
    player: Player;
}

const SkillsPanel: React.FC<SkillsPanelProps> = ({ player }) => {
    return (
        <div className="bg-black/30 p-4 border border-cyan-900/50">
            <h2 className="text-xl text-cyan-300 mb-3 uppercase tracking-widest text-center">[ Skills ]</h2>
            <div className="text-center text-gray-400">
                {player.skills.length > 0 ? (
                    player.skills.map((skill, index) => (
                        <p key={index} className="font-mono text-cyan-300">{skill}</p>
                    ))
                ) : (
                    <p className="italic">No special skills acquired.</p>
                )}
            </div>
             {/* This panel can be expanded later with skill descriptions, usage, etc. */}
        </div>
    );
};

export default SkillsPanel;
