import React, { useState, useCallback } from 'react';
import type { GameState } from './types';
import { INITIAL_GAME_STATE } from './constants';
import { getNextStorySegment } from './services/geminiService';

// Import components
import Header from './components/Header';
import PlayerStatus from './components/PlayerStatus';
import StoryDisplay from './components/StoryDisplay';
import StoryControls from './components/StoryControls';
import SceneBackground from './components/SceneBackground';
import PixelArtCanvas from './components/PixelArtCanvas';
import RainEffect from './components/RainEffect';
import ProceduralMap from './components/ProceduralMap';
import NpcPortraitCanvas from './components/NpcPortraitCanvas';
import EnemyPortraitCanvas from './components/EnemyPortraitCanvas';
import DialogueBox from './components/DialogueBox';
import EnemyStatus from './components/EnemyStatus';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
    // Dummy state and handler for Header mute button
    const [isMuted, setIsMuted] = useState(true);
    const handleToggleMute = () => setIsMuted(prev => !prev);
    
    // Dummy handlers for DialogueBox typewriter effect
    const handleTalkStart = useCallback(() => {}, []);
    const handleTalkEnd = useCallback(() => {}, []);

    const handleChoice = useCallback(async (choice: string) => {
        // Create the state for the API call based on the *next* state,
        // not the currently rendered state which is stale.
        const stateWithChoice = {
            ...gameState,
            history: [...gameState.history, `> ${choice}`],
        };

        // Update the UI to show loading and the player's choice.
        setGameState(prevState => ({
            ...prevState,
            isLoading: true,
            error: null,
            history: [...prevState.history, `> ${choice}`],
        }));

        try {
            // Use the state that includes the latest choice for the API call.
            const nextSegment = await getNextStorySegment(stateWithChoice, choice);

            // Update the UI with the result from the API.
            setGameState(prevState => {
                const newPlayerState = { ...prevState.player };
                if (nextSegment.playerUpdate) {
                    if (nextSegment.playerUpdate.hp !== undefined) {
                        newPlayerState.hp = nextSegment.playerUpdate.hp;
                    }
                    if (nextSegment.playerUpdate.credits !== undefined) {
                        newPlayerState.credits = nextSegment.playerUpdate.credits;
                    }
                }
                
                // Handle game over if HP drops to 0 or below
                if (newPlayerState.hp <= 0 && !nextSegment.isEnd) {
                    nextSegment.isEnd = true;
                    nextSegment.text = `${nextSegment.text}\n\nYour vision fades to black. Your journey ends here.`;
                    nextSegment.choices = ["Restart"];
                }

                return {
                    player: newPlayerState,
                    currentSegment: nextSegment,
                    history: [...prevState.history, nextSegment.text],
                    isLoading: false,
                    error: null,
                };
            });
        } catch (error: any) {
            setGameState(prevState => ({
                ...prevState,
                isLoading: false,
                error: error.message || 'An unknown error occurred.',
            }));
        }
    }, [gameState]);

    const handleRestart = useCallback(() => {
        setGameState(INITIAL_GAME_STATE);
    }, []);
    
    const { player, currentSegment, history, isLoading, error } = gameState;

    return (
        <>
            <RainEffect />
            <div className="bg-black/80 text-white font-mono min-h-screen flex flex-col items-center p-2 sm:p-4 lg:p-8 selection:bg-cyan-400 selection:text-black">
                <div className="w-full max-w-7xl mx-auto border-2 border-cyan-400/30 shadow-2xl shadow-cyan-500/10 bg-gray-900/50 backdrop-blur-sm">
                    <Header isMuted={isMuted} onToggleMute={handleToggleMute} />
                    <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
                        {/* Left Column */}
                        <div className="lg:col-span-3 space-y-4">
                            <PlayerStatus player={player} />
                            <div className="flex flex-col items-center space-y-4 bg-black/30 p-4 border border-gray-700">
                                <PixelArtCanvas archetype={player.archetype} faction={player.faction} />
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">LOCATION:</p>
                                    <p className="text-lg text-cyan-400">{currentSegment.location}</p>
                                </div>
                                <ProceduralMap locationName={currentSegment.location} />
                            </div>
                        </div>

                        {/* Middle Column */}
                        <div className="lg:col-span-6 flex flex-col gap-4">
                           <div className="aspect-[4/3]">
                                <SceneBackground imagePrompt={currentSegment.imagePrompt} />
                           </div>
                           <StoryDisplay history={history} isLoading={isLoading} />
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-3 space-y-4">
                            {currentSegment.npc && !currentSegment.isCombat && (
                                <div className="space-y-4">
                                    <div className="flex flex-col items-center space-y-2 bg-black/30 p-4 border border-gray-700">
                                        <NpcPortraitCanvas npcName={currentSegment.npc.name} emotion={currentSegment.npc.emotion} />
                                         <div className="text-center">
                                            <p className="text-lg text-cyan-400">{currentSegment.npc.name}</p>
                                            <p className="text-sm text-gray-400 italic">{currentSegment.npc.description}</p>
                                        </div>
                                    </div>
                                    <DialogueBox dialogue={currentSegment.npc.dialogue} onTalkStart={handleTalkStart} onTalkEnd={handleTalkEnd} />
                                </div>
                            )}
                            {currentSegment.isCombat && currentSegment.enemy && (
                                <div className="space-y-4">
                                    <EnemyStatus enemy={currentSegment.enemy} />
                                    <div className="flex flex-col items-center bg-black/30 p-4 border border-red-900/50">
                                        <EnemyPortraitCanvas enemyName={currentSegment.enemy.name} emotion={currentSegment.enemy.emotion} />
                                    </div>
                                </div>
                            )}
                            <div className="sticky top-4">
                                <StoryControls
                                    choices={currentSegment.choices}
                                    onChoice={handleChoice}
                                    isLoading={isLoading}
                                    isEnd={!!currentSegment.isEnd}
                                    onRestart={handleRestart}
                                    error={error}
                                />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default App;
