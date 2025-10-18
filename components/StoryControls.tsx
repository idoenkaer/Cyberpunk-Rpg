// components/StoryControls.tsx
import React, { useState } from 'react';
import type { Archetype, Faction } from '../types';
import { ARCHETYPES, FACTIONS } from '../constants';

interface StoryControlsProps {
    onStart: (archetype: Archetype, faction: Faction) => void;
    onContinue: (choice: string) => void;
    isStoryStarted: boolean;
    isLoading: boolean;
}

const StoryControls: React.FC<StoryControlsProps> = ({ onStart, onContinue, isStoryStarted, isLoading }) => {
    const [selectedArchetype, setSelectedArchetype] = useState<Archetype>('Runner');
    const [selectedFaction, setSelectedFaction] = useState<Faction>('Street Ronin');
    const [playerInput, setPlayerInput] = useState('');

    const handleStart = () => {
        if (!isLoading) {
            onStart(selectedArchetype, selectedFaction);
        }
    };
    
    const handleContinue = () => {
        if (playerInput.trim() && !isLoading) {
            onContinue(playerInput.trim());
            setPlayerInput('');
        }
    }

    if (isStoryStarted) {
        return (
            <div className="w-full lg:w-3/4 mx-auto p-4 space-y-4">
                 <div className="bg-black/30 p-4 border border-gray-700 space-y-2">
                    <label htmlFor="player-action" className="block text-lg text-cyan-400">What do you do?</label>
                    <textarea 
                        id="player-action"
                        rows={3}
                        value={playerInput}
                        onChange={(e) => setPlayerInput(e.target.value)}
                        className="w-full bg-gray-900 text-gray-300 border border-gray-600 p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="e.g., 'Look for cover' or 'Approach the stranger'"
                        disabled={isLoading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleContinue();
                            }
                        }}
                    />
                    <button 
                        onClick={handleContinue}
                        disabled={isLoading || !playerInput.trim()}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Thinking...' : 'Act'}
                    </button>
                 </div>
            </div>
        );
    }


    return (
        <div className="w-full lg:w-1/2 mx-auto p-4 space-y-4">
            <div className="bg-black/30 p-4 border border-gray-700 space-y-4">
                <h2 className="text-xl text-center text-cyan-400">Create Your Character</h2>
                <div>
                    <label htmlFor="archetype-select" className="block mb-1 text-gray-300">Archetype</label>
                    <select 
                        id="archetype-select" 
                        value={selectedArchetype}
                        onChange={(e) => setSelectedArchetype(e.target.value as Archetype)}
                        className="w-full bg-gray-900 text-gray-300 border border-gray-600 p-2"
                    >
                        {ARCHETYPES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="faction-select" className="block mb-1 text-gray-300">Faction</label>
                    <select 
                        id="faction-select" 
                        value={selectedFaction}
                        onChange={(e) => setSelectedFaction(e.target.value as Faction)}
                        className="w-full bg-gray-900 text-gray-300 border border-gray-600 p-2"
                    >
                        {FACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                 <button 
                    onClick={handleStart}
                    disabled={isLoading}
                    className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-3 px-4 text-lg transition-colors duration-200 disabled:bg-gray-600"
                >
                    {isLoading ? 'Waking up...' : 'Enter the City'}
                </button>
            </div>
        </div>
    );
};

export default StoryControls;
