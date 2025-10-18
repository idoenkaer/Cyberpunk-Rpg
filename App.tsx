import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import RainEffect from './components/RainEffect';
import PixelArtCanvas from './components/PixelArtCanvas';
import PlayerStatus from './components/PlayerStatus';
import ProceduralMap from './components/ProceduralMap';
import StoryDisplay from './components/StoryDisplay';
import StoryControls from './components/StoryControls';
import SceneBackground from './components/SceneBackground';
import DialogueBox from './components/DialogueBox';
import NpcPortraitCanvas from './components/NpcPortraitCanvas';
import EnemyStatus from './components/EnemyStatus';
import EnemyPortraitCanvas from './components/EnemyPortraitCanvas';
import { getNextStorySegment } from './services/geminiService';
import { INITIAL_GAME_STATE } from './constants';
import type { GameState } from './types';

// Placeholder audio URLs - in a real project, these would be imported assets
const AMBIENT_URL = 'https://www.soundjay.com/nature/sounds/rain-07.mp3';
const TYPING_URL = 'https://www.soundjay.com/communication/sounds/typewriter-1.mp3';
const CHOICE_URL = 'https://www.soundjay.com/buttons/sounds/button-20.mp3';
const ERROR_URL = 'https://www.soundjay.com/buttons/sounds/button-10.mp3';

function App() {
    const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
    const [isMuted, setIsMuted] = useState(true);
    const [isTalking, setIsTalking] = useState(false);

    const ambientAudioRef = useRef<HTMLAudioElement>(null);
    const effectAudioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const ambient = ambientAudioRef.current;
        if (ambient) {
            ambient.loop = true;
            ambient.volume = 0.2;
            if (!isMuted && ambient.paused) {
                ambient.play().catch(e => console.error("Audio play failed:", e));
            } else if (isMuted) {
                ambient.pause();
            }
        }
    }, [isMuted]);
    
    const playSound = (src: string, loop = false) => {
        if (!isMuted && effectAudioRef.current) {
            effectAudioRef.current.src = src;
            effectAudioRef.current.loop = loop;
            effectAudioRef.current.play().catch(e => console.error("Audio effect failed:", e));
        }
    };
    
    const stopSound = () => {
         if (effectAudioRef.current) {
            effectAudioRef.current.pause();
            effectAudioRef.current.currentTime = 0;
        }
    }

    const handleChoice = useCallback(async (choice: string) => {
        setGameState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
            history: [...prev.history, `> ${choice}`]
        }));
        playSound(CHOICE_URL);

        try {
            const nextSegment = await getNextStorySegment(gameState, choice);

            setGameState(prev => {
                const newPlayerState = { ...prev.player };
                if (nextSegment.playerUpdate?.hp !== undefined) {
                    newPlayerState.hp = nextSegment.playerUpdate.hp;
                }
                if (nextSegment.playerUpdate?.credits !== undefined) {
                    newPlayerState.credits = nextSegment.playerUpdate.credits;
                }

                return {
                    ...prev,
                    isLoading: false,
                    currentSegment: nextSegment,
                    player: newPlayerState,
                    history: [...prev.history, `> ${choice}`, nextSegment.text],
                };
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            playSound(ERROR_URL);
            setGameState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, [gameState]);

    const handleRestart = () => {
        setGameState(INITIAL_GAME_STATE);
    };

    const onToggleMute = () => {
        setIsMuted(prev => !prev);
    };
    
    const onTalkStart = useCallback(() => {
        setIsTalking(true);
        playSound(TYPING_URL, true);
    }, []);

    const onTalkEnd = useCallback(() => {
        setIsTalking(false);
        stopSound();
    }, []);

    const { player, currentSegment, history, isLoading, error } = gameState;

    return (
        <>
            <RainEffect />
            <audio ref={ambientAudioRef} src={AMBIENT_URL} />
            <audio ref={effectAudioRef} src={CHOICE_URL} />
            <div className="bg-black/50 text-white font-mono min-h-screen flex flex-col items-center p-4">
                <Header isMuted={isMuted} onToggleMute={onToggleMute} />
                <main className="w-full max-w-7xl mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4 flex-grow">
                    
                    {/* Left Column */}
                    <aside className="lg:col-span-1 space-y-4 flex flex-col">
                        <PixelArtCanvas archetype={player.archetype} faction={player.faction} />
                        <PlayerStatus player={player} />
                        <div className="bg-black/30 p-4 border border-gray-700 flex flex-col items-center">
                            <h2 className="text-lg text-cyan-400 mb-2 uppercase tracking-widest">Map</h2>
                            <ProceduralMap locationName={currentSegment.location} />
                            <p className="mt-2 text-sm text-gray-400">{currentSegment.location}</p>
                        </div>
                    </aside>

                    {/* Middle Column */}
                    <section className="lg:col-span-2 flex flex-col h-[80vh] lg:h-auto">
                         <div className="flex-grow overflow-hidden bg-black/30 p-4 border border-gray-700">
                             <StoryDisplay history={history} isLoading={isLoading} />
                         </div>
                         <div className="mt-4">
                             <StoryControls 
                                choices={currentSegment.choices} 
                                onChoice={handleChoice} 
                                isLoading={isLoading} 
                                isEnd={!!currentSegment.isEnd} 
                                onRestart={handleRestart}
                                error={error}
                             />
                         </div>
                    </section>

                    {/* Right Column */}
                    <aside className="lg:col-span-1 space-y-4 flex flex-col">
                         <div className="h-48">
                            <SceneBackground imagePrompt={currentSegment.imagePrompt} />
                         </div>

                        {currentSegment.npc && !currentSegment.isCombat && (
                            <>
                                <NpcPortraitCanvas npcName={currentSegment.npc.name} emotion={currentSegment.npc.emotion} />
                                <div className="flex-grow">
                                     <DialogueBox dialogue={currentSegment.npc.dialogue} onTalkStart={onTalkStart} onTalkEnd={onTalkEnd} />
                                </div>
                            </>
                        )}

                        {currentSegment.enemy && currentSegment.isCombat && (
                            <>
                                <EnemyPortraitCanvas enemyName={currentSegment.enemy.name} emotion={currentSegment.enemy.emotion} />
                                <EnemyStatus enemy={currentSegment.enemy} />
                            </>
                        )}
                    </aside>

                </main>
            </div>
        </>
    );
}

export default App;
