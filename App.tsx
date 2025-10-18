import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState } from './types';
import { INITIAL_GAME_STATE } from './constants';
import { getNextStorySegment } from './services/geminiService';

// Import components directly from the components directory
import Header from './components/Header';
import PlayerStatus from './components/PlayerStatus';
import StoryDisplay from './components/StoryDisplay';
import StoryControls from './components/StoryControls';
import SceneBackground from './components/SceneBackground';
import PixelArtCanvas from './components/PixelArtCanvas';
import ProceduralMap from './components/ProceduralMap';
import NpcPortraitCanvas from './components/NpcPortraitCanvas';
import EnemyPortraitCanvas from './components/EnemyPortraitCanvas';
import DialogueBox from './components/DialogueBox';
import EnemyStatus from './components/EnemyStatus';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
    const [isMuted, setIsMuted] = useState(true);
    
    // Web Audio API state
    const audioContextRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const ambienceGainRef = useRef<GainNode | null>(null);

    // Initialize Audio Context
    const initializeAudio = () => {
        if (!audioContextRef.current) {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = context;
            
            masterGainRef.current = context.createGain();
            masterGainRef.current.connect(context.destination);
            
            ambienceGainRef.current = context.createGain();
            ambienceGainRef.current.connect(masterGainRef.current);

            // Create ambient sound
            const noise = context.createBufferSource();
            const bufferSize = context.sampleRate * 2;
            const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            noise.buffer = buffer;
            noise.loop = true;
            
            const bandpass = context.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.value = 400;
            bandpass.Q.value = 0.5;

            const lowpass = context.createBiquadFilter();
            lowpass.type = 'lowpass';
            lowpass.frequency.value = 150;

            noise.connect(bandpass).connect(lowpass).connect(ambienceGainRef.current);
            noise.start();
        }
    };
    
    useEffect(() => {
        // Ensure audio context is resumed after user interaction
        const resumeAudio = () => {
             if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            document.removeEventListener('click', resumeAudio);
        };
        document.addEventListener('click', resumeAudio);
        
        return () => document.removeEventListener('click', resumeAudio);
    }, []);

    const playClickSound = useCallback(() => {
        if (isMuted || !audioContextRef.current) return;
        const context = audioContextRef.current;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, context.currentTime);
        gain.gain.setValueAtTime(0.1, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.1);
        oscillator.connect(gain).connect(masterGainRef.current!);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.1);
    }, [isMuted]);

    const handleToggleMute = () => {
        initializeAudio();
        setIsMuted(prev => {
            const nextMuted = !prev;
            if (masterGainRef.current) {
                 masterGainRef.current.gain.setValueAtTime(nextMuted ? 0 : 1, audioContextRef.current!.currentTime);
            }
             if (ambienceGainRef.current) {
                ambienceGainRef.current.gain.setTargetAtTime(nextMuted ? 0 : 0.05, audioContextRef.current!.currentTime, 0.5);
            }
            return nextMuted;
        });
    };

    const handleChoice = useCallback(async (choice: string) => {
        playClickSound();
        const stateWithChoice = {
            ...gameState,
            history: [...gameState.history, `> ${choice}`],
        };

        setGameState(prevState => ({
            ...prevState,
            isLoading: true,
            error: null,
            history: [...prevState.history, `> ${choice}`],
        }));

        try {
            const nextSegment = await getNextStorySegment(stateWithChoice, choice);

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
    }, [gameState, playClickSound]);

    const handleRestart = useCallback(() => {
        playClickSound();
        setGameState(INITIAL_GAME_STATE);
    }, [playClickSound]);
    
    const { player, currentSegment, history, isLoading, error } = gameState;

    return (
        <div className="bg-black/80 text-white font-mono h-screen flex flex-col items-center p-2 sm:p-4 lg:p-8 overflow-hidden">
            <div className="w-full max-w-7xl mx-auto border-2 border-cyan-400/30 shadow-2xl shadow-cyan-500/10 bg-gray-900/50 backdrop-blur-sm h-full flex flex-col">
                <Header isMuted={isMuted} onToggleMute={handleToggleMute} />
                <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 flex-1 overflow-hidden">
                    {/* Left Column */}
                    <div className="lg:col-span-3 space-y-4 overflow-y-auto custom-scrollbar">
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
                    <div className="lg:col-span-3 space-y-4 overflow-y-auto custom-scrollbar">
                        {currentSegment.npc && !currentSegment.isCombat && (
                            <div className="space-y-4">
                                <div className="flex flex-col items-center space-y-2 bg-black/30 p-4 border border-gray-700">
                                    <NpcPortraitCanvas npcName={currentSegment.npc.name} emotion={currentSegment.npc.emotion} />
                                     <div className="text-center">
                                        <p className="text-lg text-cyan-400">{currentSegment.npc.name}</p>
                                        <p className="text-sm text-gray-400 italic">{currentSegment.npc.description}</p>
                                    </div>
                                </div>
                                <DialogueBox dialogue={currentSegment.npc.dialogue} onTalkStart={() => {}} onTalkEnd={() => {}} />
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
                        <div className="sticky top-0">
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
    );
};

export default App;