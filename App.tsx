
import React, { useState, useCallback, useEffect } from 'react';

// Components
import Header from './components/Header';
import PlayerStatus from './components/PlayerStatus';
import StoryDisplay from './components/StoryDisplay';
import StoryControls from './components/StoryControls';
import PixelArtCanvas from './components/PixelArtCanvas';
import RainEffect from './components/RainEffect';
import ProceduralMap from './components/ProceduralMap';
import NpcPortraitCanvas from './components/NpcPortraitCanvas';
import DialogueBox from './components/DialogueBox';
import EnemyPortraitCanvas from './components/EnemyPortraitCanvas';
import EnemyStatus from './components/EnemyStatus';
import SceneBackground from './components/SceneBackground';

// Types and Services
import { getNextStorySegment } from './services/geminiService';
import { INITIAL_GAME_STATE } from './constants';
import type { GameState, Archetype, Faction, PlayerState } from './types';

// Audio
const useAudio = (url: string, loop: boolean) => {
    const [audio] = useState(new Audio(url));
    const [playing, setPlaying] = useState(false);

    const toggle = () => setPlaying(!playing);

    useEffect(() => {
        audio.loop = loop;
        playing ? audio.play().catch(e => console.error("Audio play failed", e)) : audio.pause();
    }, [playing, audio, loop]);

    useEffect(() => {
        const handleEnded = () => setPlaying(false);
        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
        };
    }, [audio]);
    
    return [playing, toggle] as const;
};


const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isMuted, setIsMuted] = useState(true); // Start muted by default
    const [isTalking, setIsTalking] = useState(false);
    
    // In a real app, these would come from a public folder. Using a placeholder.
    const [musicPlaying, toggleMusic] = useAudio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', true);

    useEffect(() => {
        if (!isMuted && gameState) {
            if (!musicPlaying) {
                 (toggleMusic as () => void)();
            }
        } else {
             if (musicPlaying) {
                 (toggleMusic as () => void)();
             }
        }
    }, [isMuted, gameState, musicPlaying, toggleMusic]);

    const handleCharacterCreation = (archetype: Archetype, faction: Faction) => {
        const playerState: PlayerState = {
            archetype,
            faction,
            hp: 100,
            maxHp: 100,
            credits: 500,
        };
        setGameState({
            player: playerState,
            ...INITIAL_GAME_STATE,
        });
    };

    const handlePlayerChoice = useCallback(async (choice: string) => {
        if (!gameState || gameState.isLoading) return;

        setGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                isLoading: true,
                error: null,
                history: [...prev.history, `> ${choice}`],
            };
        });

        try {
            const nextSegment = await getNextStorySegment(gameState, choice);
            
            setGameState(prev => {
                if (!prev) return null;
                const newPlayerState = { ...prev.player };
                if (nextSegment.playerUpdate) {
                    if (nextSegment.playerUpdate.hp !== undefined) {
                        newPlayerState.hp = nextSegment.playerUpdate.hp;
                    }
                    if (nextSegment.playerUpdate.credits !== undefined) {
                        newPlayerState.credits = nextSegment.playerUpdate.credits;
                    }
                }
                
                return {
                    player: newPlayerState,
                    currentSegment: nextSegment,
                    history: [...prev.history, `> ${choice}`, nextSegment.text],
                    isLoading: false,
                    error: null,
                };
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setGameState(prev => {
                if (!prev) return null;
                return { ...prev, isLoading: false, error: errorMessage };
            });
        }
    }, [gameState]);
    
    const handleRestart = () => {
        setGameState(null);
    }
    
    if (!gameState) {
        return (
             <div className="bg-gray-900 text-gray-200 min-h-screen font-mono flex flex-col items-center justify-center p-4">
                 <RainEffect />
                 <div className="z-10 bg-black/50 p-8 border border-cyan-400/30 text-center max-w-2xl">
                    <h1 className="text-4xl font-bold text-cyan-400 tracking-widest uppercase text-flicker mb-4">Cyber-Saga Chronicles</h1>
                    <p className="mb-6 text-gray-400">The rain never stops in Neo-Kyoto. In the shadows of chrome towers, you carve out a living. Who are you?</p>
                    
                    <CharacterCreator onConfirm={handleCharacterCreation} />
                 </div>
            </div>
        )
    }

    const { player, currentSegment, history, isLoading, error } = gameState;

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen font-mono">
            <RainEffect />
            <div className="max-w-7xl mx-auto p-4 relative z-10">
                <Header isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)} />

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-4">
                        <PlayerStatus player={player} />
                        <div className="flex space-x-4">
                           <PixelArtCanvas archetype={player.archetype} faction={player.faction} />
                           <div className="flex-grow">
                             <h3 className="text-sm text-gray-500 uppercase">Location</h3>
                             <p className="text-lg text-cyan-400">{currentSegment.location}</p>
                             <div className="mt-2">
                                <ProceduralMap locationName={currentSegment.location} />
                             </div>
                           </div>
                        </div>
                         {currentSegment.enemy && <EnemyStatus enemy={currentSegment.enemy} />}
                    </div>

                    {/* Middle Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative h-[400px] lg:h-[calc(100%-250px)] bg-black/30 p-4 border border-gray-700">
                             <SceneBackground imagePrompt={currentSegment.imagePrompt} />
                             <StoryDisplay history={history} isLoading={isLoading} />
                        </div>
                        <StoryControls 
                            choices={currentSegment.choices} 
                            onChoice={handlePlayerChoice} 
                            isLoading={isLoading || isTalking} 
                            isEnd={!!currentSegment.isEnd}
                            onRestart={handleRestart}
                            error={error}
                        />
                    </div>
                </main>
                 {/* Dialogue/Enemy Overlay */}
                 {(currentSegment.npc || currentSegment.enemy) && (
                    <aside className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                        <div className="lg:col-start-2 lg:col-span-2">
                             <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1 flex items-center justify-center">
                                    {currentSegment.npc && <NpcPortraitCanvas npcName={currentSegment.npc.name} emotion={currentSegment.npc.emotion} />}
                                    {currentSegment.enemy && <EnemyPortraitCanvas enemyName={currentSegment.enemy.name} emotion={currentSegment.enemy.emotion} />}
                                </div>
                                <div className="col-span-2">
                                    {currentSegment.npc && <DialogueBox dialogue={currentSegment.npc.dialogue} onTalkStart={() => setIsTalking(true)} onTalkEnd={() => setIsTalking(false)} />}
                                </div>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
};


const CharacterCreator: React.FC<{ onConfirm: (archetype: Archetype, faction: Faction) => void }> = ({ onConfirm }) => {
    const [archetype, setArchetype] = useState<Archetype>('Runner');
    const [faction, setFaction] = useState<Faction>('Street Ronin');

    const archetypes: { name: Archetype; desc: string }[] = [
        { name: 'Runner', desc: 'A versatile operative, balancing combat, tech, and street smarts.' },
        { name: 'Netrunner', desc: 'A master of the virtual world, hacking systems and bending data to their will.' },
        { name: 'Street Samurai', desc: 'A cybernetically-enhanced warrior, living and dying by the blade.' },
        { name: 'Corporate Drone', desc: 'A cog in the machine who has decided to break the pattern.' },
        { name: 'Techie', desc: 'A brilliant engineer who can build, modify, or break any piece of hardware.' },
        { name: 'Fixer', desc: 'A well-connected broker of information, gear, and jobs.' }
    ];

    const factions: { name: Faction; desc: string }[] = [
        { name: 'Corporate Enforcers', desc: 'Loyal to the megacorps, you uphold the iron-fisted law of the powerful.' },
        { name: 'Hacker Collective', desc: 'Information wants to be free, and you\'re the one to set it loose.' },
        { name: 'Street Ronin', desc: 'Bound by a personal code of honor in a city that has none.' },
        { name: 'Police', desc: 'Trying to keep the peace on streets where peace is just a memory.' }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg text-fuchsia-400 mb-2">[ SELECT ARCHETYPE ]</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {archetypes.map(a => (
                        <button key={a.name} onClick={() => setArchetype(a.name)} className={`p-2 border-2 transition-colors ${archetype === a.name ? 'border-cyan-400 bg-cyan-900/50' : 'border-gray-700 hover:bg-gray-800'}`}>
                            {a.name}
                        </button>
                    ))}
                </div>
                <p className="text-sm text-gray-400 mt-2 h-10">{archetypes.find(a => a.name === archetype)?.desc}</p>
            </div>
            <div>
                <h3 className="text-lg text-fuchsia-400 mb-2">[ SELECT FACTION ]</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {factions.map(f => (
                        <button key={f.name} onClick={() => setFaction(f.name)} className={`p-2 border-2 transition-colors ${faction === f.name ? 'border-cyan-400 bg-cyan-900/50' : 'border-gray-700 hover:bg-gray-800'}`}>
                            {f.name}
                        </button>
                    ))}
                </div>
                <p className="text-sm text-gray-400 mt-2 h-10">{factions.find(f => f.name === faction)?.desc}</p>
            </div>
            <button onClick={() => onConfirm(archetype, faction)} className="w-full text-lg bg-cyan-600/50 hover:bg-cyan-500/50 text-white font-bold py-3 px-4 border-b-4 border-cyan-800/50 hover:border-cyan-700/50 rounded transition-colors duration-200">
                [ JACK IN ]
            </button>
        </div>
    );
}

export default App;
