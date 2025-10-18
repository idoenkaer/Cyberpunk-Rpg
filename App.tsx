
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { INITIAL_GAME_STATE } from './constants';
import type { GameState } from './types';
import { getNextStorySegment } from './services/geminiService';

import Header from './components/Header';
import StoryDisplay from './components/StoryDisplay';
import StoryControls from './components/StoryControls';
import PlayerStatus from './components/PlayerStatus';
import PixelArtCanvas from './components/PixelArtCanvas';
import RainEffect from './components/RainEffect';
import ProceduralMap from './components/ProceduralMap';
import DialogueBox from './components/DialogueBox';
import NpcPortraitCanvas from './components/NpcPortraitCanvas';
import EnemyStatus from './components/EnemyStatus';
import EnemyPortraitCanvas from './components/EnemyPortraitCanvas';


function App() {
    const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
    const [isMuted, setIsMuted] = useState(true);
    const [isNpcTalking, setIsNpcTalking] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const ambienceNodesRef = useRef<{ noiseSource?: AudioBufferSourceNode, humOscillator?: OscillatorNode, gainNode?: GainNode }>({});

    // Initialize AudioContext
    useEffect(() => {
        if (!audioContextRef.current) {
            try {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.warn("Web Audio API is not supported in this browser.");
            }
        }
    }, []);

    const playUiSound = useCallback(() => {
        const context = audioContextRef.current;
        if (!context || isMuted) return;
        if (context.state === 'suspended') {
            context.resume().catch(e => console.error("Audio context resume failed:", e));
        }

        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, context.currentTime);
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.1);
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.1);
    }, [isMuted]);

    const startAmbience = useCallback(() => {
        const context = audioContextRef.current;
        if (!context || ambienceNodesRef.current.gainNode) return;
        if (context.state === 'suspended') {
            context.resume().catch(e => console.error("Audio context resume failed:", e));
        }

        const gainNode = context.createGain();
        gainNode.gain.setValueAtTime(0, context.currentTime);

        const humOscillator = context.createOscillator();
        humOscillator.type = 'sine';
        humOscillator.frequency.setValueAtTime(50, context.currentTime);

        const bufferSize = context.sampleRate * 2;
        const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const noiseSource = context.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        const bandpass = context.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 800;
        bandpass.Q.value = 0.5;

        humOscillator.connect(gainNode);
        noiseSource.connect(bandpass);
        bandpass.connect(gainNode);
        gainNode.connect(context.destination);

        humOscillator.start();
        noiseSource.start();
        gainNode.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 1);

        ambienceNodesRef.current = { noiseSource, humOscillator, gainNode };
    }, []);
    
    const stopAmbience = useCallback(() => {
        const nodes = ambienceNodesRef.current;
        const context = audioContextRef.current;
        if (nodes.gainNode && context) {
            try {
                nodes.gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.5);
                
                setTimeout(() => {
                    if (ambienceNodesRef.current.gainNode) { 
                        nodes.humOscillator?.stop();
                        nodes.noiseSource?.stop();
                        nodes.gainNode?.disconnect();
                        ambienceNodesRef.current = {};
                    }
                }, 550);
            } catch (e) {
                console.error("Error stopping ambience:", e);
                // Force cleanup if ramp fails
                nodes.humOscillator?.stop();
                nodes.noiseSource?.stop();
                nodes.gainNode?.disconnect();
                ambienceNodesRef.current = {};
            }
        }
    }, []);

    useEffect(() => {
        if (isMuted) {
            stopAmbience();
        } else {
            startAmbience();
        }
    }, [isMuted, startAmbience, stopAmbience]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAmbience();
        };
    }, [stopAmbience]);


    const handlePlayerChoice = useCallback(async (choice: string) => {
        if (gameState.isLoading || gameState.currentSegment.isEnd) return;
        
        playUiSound();

        setGameState(prev => ({
            ...prev,
            isLoading: true,
            history: [...prev.history, `> ${choice}`],
        }));

        try {
            const nextSegment = await getNextStorySegment(gameState, choice);
            
            setGameState(prev => {
                const newPlayerState = { ...prev.player };
                if (nextSegment.playerUpdate) {
                    if (nextSegment.playerUpdate.hp !== undefined) {
                        newPlayerState.hp = nextSegment.playerUpdate.hp;
                    }
                    if (nextSegment.playerUpdate.credits !== undefined) {
                        newPlayerState.credits = nextSegment.playerUpdate.credits;
                    }
                }

                // If combat and enemy exists, player might lose HP from enemy attack
                if (prev.currentSegment.isCombat && prev.currentSegment.enemy) {
                    newPlayerState.hp -= prev.currentSegment.enemy.attack || 5;
                }
                
                // Clamp HP
                if (newPlayerState.hp < 0) newPlayerState.hp = 0;

                return {
                    ...prev,
                    player: newPlayerState,
                    currentSegment: nextSegment,
                    history: [...prev.history, `> ${choice}`, nextSegment.text],
                    isLoading: false,
                    error: null,
                };
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setGameState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, [gameState, playUiSound]);
    
    const handleRestart = () => {
        playUiSound();
        setGameState(INITIAL_GAME_STATE);
    }
    
    const { player, currentSegment, history, isLoading, error } = gameState;

    return (
        <div className="bg-gray-900 text-gray-200 font-mono min-h-screen flex flex-col items-center p-4 selection:bg-cyan-400/30">
            <RainEffect />
            <Header isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)} />
            
            <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 flex-grow">
                {/* Left Column */}
                <aside className="lg:col-span-1 space-y-4 flex flex-col">
                   <PlayerStatus player={player} />
                   <div className="bg-black/30 p-4 border border-gray-700 flex flex-col items-center">
                       <h2 className="text-lg text-cyan-400 mb-2 uppercase tracking-widest">Player Avatar</h2>
                       <PixelArtCanvas archetype={player.archetype} faction={player.faction} />
                   </div>
                   <div className="bg-black/30 p-4 border border-gray-700 flex flex-col items-center">
                        <h2 className="text-lg text-cyan-400 mb-2 uppercase tracking-widest">{currentSegment.location}</h2>
                        <ProceduralMap locationName={currentSegment.location} />
                   </div>
                   {currentSegment.enemy && (
                        <>
                           <EnemyStatus enemy={currentSegment.enemy} />
                           <div className="bg-black/30 p-4 border border-gray-700 flex flex-col items-center">
                                <h2 className="text-lg text-red-400 mb-2 uppercase tracking-widest">Enemy</h2>
                                <EnemyPortraitCanvas enemyName={currentSegment.enemy.name} />
                           </div>
                        </>
                   )}
                </aside>

                {/* Center Column */}
                <div className={`lg:col-span-${currentSegment.npc ? '1' : '2'} flex flex-col`}>
                    <div className="bg-black/30 p-4 border border-gray-700 flex-grow">
                        <StoryDisplay history={history} isLoading={isLoading} />
                    </div>
                     <div className="mt-4">
                         <StoryControls 
                             choices={currentSegment.choices}
                             onChoice={handlePlayerChoice}
                             isLoading={isLoading}
                             isEnd={!!currentSegment.isEnd}
                             onRestart={handleRestart}
                             error={error}
                         />
                     </div>
                </div>

                {/* Right Column (for NPC interaction) */}
                {currentSegment.npc && !currentSegment.isCombat && (
                     <aside className="lg:col-span-1 space-y-4 flex flex-col">
                         <div className="bg-black/30 p-4 border border-gray-700 flex flex-col items-center">
                             <h2 className="text-lg text-fuchsia-400 mb-2 uppercase tracking-widest">{currentSegment.npc.name}</h2>
                            <NpcPortraitCanvas npcName={currentSegment.npc.name} isTalking={isNpcTalking} />
                            <p className="text-center text-sm text-gray-400 mt-2 italic">{currentSegment.npc.description}</p>
                         </div>
                         <div className="flex-grow">
                            <DialogueBox 
                                dialogue={currentSegment.npc.dialogue} 
                                onTalkStart={() => setIsNpcTalking(true)}
                                onTalkEnd={() => setIsNpcTalking(false)}
                            />
                         </div>
                     </aside>
                )}
            </main>
        </div>
    );
}

export default App;
