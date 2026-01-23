// components/CharacterCreation.tsx
import React, { useState, useEffect } from 'react';
import GeneratedSprite from './GeneratedSprite';

interface CharacterCreationProps {
    onCharacterCreate: (name: string) => void;
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCharacterCreate }) => {
    const [name, setName] = useState('');
    const [debouncedName, setDebouncedName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            if (name.trim().length > 1) {
                setDebouncedName(name.trim());
            } else {
                setDebouncedName('');
            }
        }, 500); // Wait 500ms after user stops typing

        return () => {
            clearTimeout(handler);
        };
    }, [name]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters long.');
            return;
        }
        onCharacterCreate(name.trim());
    };

    const spritePrompt = debouncedName 
        ? `A full body pixel art sprite of a cyberpunk character named '${debouncedName}'. 16-bit, standing pose, facing forward.` 
        : '';

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="pixel-border bg-black/70 p-4 sm:p-8 text-center w-full max-w-md mx-auto md:max-w-2xl animate-fade-in">
                <h1 className="text-3xl font-bold text-cyan-400 tracking-widest uppercase text-flicker mb-4">
                    Enter Deksamnu
                </h1>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-4 sm:mt-8">
                    <div className="flex-shrink-0">
                        {debouncedName ? (
                            <GeneratedSprite 
                                prompt={spritePrompt}
                                alt={`Preview of ${debouncedName}`}
                                cacheKey={`char-creation-sprite-${debouncedName}`}
                            />
                        ) : (
                            <div className="w-32 h-48 flex items-center justify-center text-gray-600 border-2 border-dashed border-gray-700">
                                {name.trim().length > 1 ? '[Initializing ID...]' : '[Awaiting ID]'}
                            </div>
                        )}
                    </div>

                    <div className="w-full text-left">
                        <p className="text-gray-400 mb-4 sm:mb-6 text-center md:text-left text-sm sm:text-base">
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
                                className="w-full bg-gray-900/50 border-2 border-cyan-700/50 focus:border-cyan-500 text-white placeholder-gray-500 text-center text-lg p-3 transition-colors duration-200 focus:outline-none focus:bg-gray-800/50"
                                maxLength={20}
                                autoFocus
                            />
                            {error && <p className="text-red-400 mt-2 text-sm text-center">{error}</p>}
                            <button
                                type="submit"
                                disabled={!name.trim()}
                                className="w-full mt-4 sm:mt-6 pixel-button text-xl py-3"
                            >
                                [ Begin Transmission ]
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterCreation;