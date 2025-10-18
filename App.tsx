// App.tsx
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import StoryControls from './components/StoryControls';
import StoryDisplay from './components/StoryDisplay';
import PixelArtCanvas from './components/PixelArtCanvas';
import RainEffect from './components/RainEffect';
import type { StoryState, Archetype, Faction } from './types';
import { generateInitialStory, continueStory, generateNpcForSegment } from './services/geminiService';

const App: React.FC = () => {
    const [storyState, setStoryState] = useState<StoryState>({
        archetype: 'Runner',
        faction: 'Street Ronin',
        currentSegment: null,
        history: [],
        isLoading: false,
        error: null,
    });
     const [view, setView] = useState<'character' | 'story'>('character');

    const handleStartStory = useCallback(async (archetype: Archetype, faction: Faction) => {
        setStoryState(prev => ({ ...prev, isLoading: true, error: null, archetype, faction, currentSegment: null, history: [] }));
        try {
            const initialSegment = await generateInitialStory(archetype, faction);
            
            // Randomly decide if an NPC appears in the first scene
            if (Math.random() > 0.3) {
                const npc = await generateNpcForSegment(initialSegment.text);
                initialSegment.npc = npc;
            }

            setStoryState(prev => ({
                ...prev,
                isLoading: false,
                currentSegment: initialSegment,
                history: [initialSegment]
            }));
            setView('story');

        } catch (e) {
            const error = e instanceof Error ? e.message : 'An unknown error occurred.';
            setStoryState(prev => ({ ...prev, isLoading: false, error }));
        }
    }, []);

    const handleContinueStory = useCallback(async (playerChoice: string) => {
        setStoryState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const nextSegment = await continueStory(storyState.history, playerChoice);
            
            // Randomly decide if an NPC appears
            if (Math.random() > 0.4) {
                 const npc = await generateNpcForSegment(nextSegment.text);
                 nextSegment.npc = npc;
            }

            setStoryState(prev => ({
                ...prev,
                isLoading: false,
                currentSegment: nextSegment,
                history: [...prev.history, nextSegment],
            }));

        } catch (e) {
             const error = e instanceof Error ? e.message : 'An unknown error occurred.';
            setStoryState(prev => ({ ...prev, isLoading: false, error }));
        }
    }, [storyState.history]);
    
    const isStoryStarted = !!storyState.currentSegment;

    return (
        <div className="bg-gray-900 text-white min-h-screen font-mono relative">
            <RainEffect />
            <div className="container mx-auto px-4 relative z-10 flex flex-col min-h-screen">
                <Header />
                 {!isStoryStarted ? (
                    <div className="flex-grow flex flex-col items-center justify-center">
                        <StoryControls 
                            onStart={handleStartStory}
                            onContinue={handleContinueStory}
                            isStoryStarted={isStoryStarted}
                            isLoading={storyState.isLoading}
                        />
                         {storyState.error && (
                             <div className="w-full lg:w-1/2 mx-auto p-4 mt-4 text-center text-red-500 bg-black/30 border border-red-500/50">
                                <h2 className="text-xl font-bold mb-1">[STARTUP FAILED]</h2>
                                <p>{storyState.error}</p>
                            </div>
                         )}
                    </div>
                ) : (
                    <>
                        <main className="flex flex-col lg:flex-row mt-4 flex-grow">
                             <div className="w-full lg:w-1/4 p-4 flex flex-col items-center self-start">
                               <PixelArtCanvas 
                                    archetype={storyState.archetype} 
                                    faction={storyState.faction} 
                                />
                                 <div className="mt-4 text-center bg-black/30 p-2 border border-gray-700 w-full">
                                    <p className="text-lg text-fuchsia-400">{storyState.archetype}</p>
                                    <p className="text-sm text-gray-400">{storyState.faction}</p>
                                </div>
                            </div>
                            <StoryDisplay 
                                segment={storyState.currentSegment} 
                                isLoading={storyState.isLoading}
                                error={storyState.error}
                            />
                        </main>
                         <footer className="w-full py-4">
                             <StoryControls 
                                onStart={handleStartStory}
                                onContinue={handleContinueStory}
                                isStoryStarted={isStoryStarted}
                                isLoading={storyState.isLoading}
                            />
                         </footer>
                    </>
                )}
            </div>
        </div>
    );
};

export default App;
