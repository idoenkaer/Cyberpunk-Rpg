// components/CharacterCreation.tsx
import React, { useState } from 'react';
import type { Archetype, Faction, ArchetypeData } from '../types';
import { ARCHETYPES, FACTIONS } from '../constants';
import PixelArtCanvas from './PixelArtCanvas';

interface CharacterCreationProps {
    onStartGame: (archetype: Archetype, faction: Faction) => void;
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onStartGame }) => {
    const [selectedArchetype, setSelectedArchetype] = useState<Archetype>('Runner');
    const [selectedFaction, setSelectedFaction] = useState<Faction>('Street Ronin');

    const selectedArchetypeData = ARCHETYPES.find(a => a.name === selectedArchetype);

    return (
        <main className="p-4 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Column: Selections & Info */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl text-cyan-400 mb-2 uppercase tracking-widest">[ SELECT ARCHETYPE ]</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {ARCHETYPES.map(({ name }) => (
                            <button
                                key={name}
                                onClick={() => setSelectedArchetype(name)}
                                className={`p-2 border-2 transition-colors duration-200 ${selectedArchetype === name ? 'bg-cyan-500/30 border-cyan-400' : 'bg-black/30 border-gray-700 hover:bg-cyan-500/10'}`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-black/30 p-4 border border-gray-700">
                    <h3 className="text-xl text-cyan-400 mb-2">{selectedArchetypeData?.name}</h3>
                    <p className="text-gray-300">{selectedArchetypeData?.description}</p>
                </div>

                <div>
                    <h2 className="text-2xl text-cyan-400 mb-2 uppercase tracking-widest">[ SELECT FACTION ]</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {FACTIONS.map((faction) => (
                             <button
                                key={faction}
                                onClick={() => setSelectedFaction(faction)}
                                className={`p-2 border-2 transition-colors duration-200 text-sm ${selectedFaction === faction ? 'bg-cyan-500/30 border-cyan-400' : 'bg-black/30 border-gray-700 hover:bg-cyan-500/10'}`}
                            >
                                {faction}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Character Preview & Start Button */}
            <div className="flex flex-col items-center justify-center space-y-8">
                <div className="border-4 border-cyan-400/20 p-2">
                     <PixelArtCanvas archetype={selectedArchetype} faction={selectedFaction} />
                </div>
                <button
                    onClick={() => onStartGame(selectedArchetype, selectedFaction)}
                    className="w-full max-w-sm text-2xl bg-cyan-600/50 hover:bg-cyan-500/50 text-white font-bold py-3 px-6 border-b-4 border-cyan-800/50 hover:border-cyan-700/50 rounded transition-colors duration-200 animate-pulse"
                >
                    [ JACK IN ]
                </button>
            </div>
        </main>
    );
};

export default CharacterCreation;
