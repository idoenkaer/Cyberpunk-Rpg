// components/CharacterCreation.tsx
import React, { useState } from 'react';

interface CharacterCreationProps {
    onCharacterCreate: (name: string) => void;
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCharacterCreate }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters long.');
            return;
        }
        onCharacterCreate(name.trim());
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-black border border-cyan-400/30 p-8 rounded-lg shadow-2xl shadow-cyan-500/10 text-center w-full max-w-md animate-fade-in">
                <h1 className="text-3xl font-bold text-cyan-400 tracking-widest uppercase text-flicker mb-4">
                    Enter the Cyber-Saga
                </h1>
                <p className="text-gray-400 mb-6">
                    The neon-drenched streets of Neo-Kyoto await.
                    Who are you in this world of chrome and shadows?
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (error) setError('');
                        }}
                        placeholder="Enter Your Name"
                        className="w-full bg-gray-900/50 border-2 border-cyan-700/50 focus:border-cyan-500 text-white placeholder-gray-500 text-center text-lg p-3 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        maxLength={20}
                        autoFocus
                    />
                    {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full mt-6 text-xl bg-cyan-600/30 hover:bg-cyan-500/30 text-white font-bold py-3 px-4 border-b-4 border-cyan-800/50 hover:border-cyan-700/50 rounded transition-all duration-200 disabled:bg-gray-700/50 disabled:cursor-not-allowed disabled:border-gray-600 transform hover:scale-105"
                    >
                        [ Begin Transmission ]
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CharacterCreation;
