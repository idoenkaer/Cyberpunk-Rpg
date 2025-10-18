// App.tsx
import React, { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import PlayerStatus from './components/PlayerStatus';
import EnemyStatus from './components/EnemyStatus';
import StoryDisplay from './components/StoryDisplay';
import StoryControls from './components/StoryControls';
import SceneBackground from './components/SceneBackground';
import RainEffect from './components/RainEffect';
import CharacterCreation from './components/CharacterCreation';
import { getNextGameState } from './services/geminiService';
import type { GameState, GeminiResponse, Player } from './types';

const INITIAL_GAME_STATE: GameState = {
    player: {
        name: 'Player',
        hp: 100,
        maxHp: 100,
        attack: 10,
        defense: 5,
        inventory: [],
        skills: [],
    },
    currentEnemy: null,
    currentNpc: null,
    sceneDescription: 'You are standing at a terminal, ready to jack into the Cyber-Saga. What is your name?',
    imagePrompt: 'A futuristic computer terminal with a glowing screen asking for a name. Cyberpunk aesthetic.',
    history: [],
    actions: ["Create Character"],
    gameState: 'characterCreation',
    itemOnGround: null,
    aiCorruption: 0,
};


function App() {
    const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
    const [isLoading, setIsLoading] = useState(false);

    const handlePlayerAction = useCallback(async (action: string) => {
        if (isLoading) return;

        setIsLoading(true);

        // Create a temporary state for the user action to appear immediately
        const currentHistory = [...gameState.history, `> ${action}`];
        setGameState(prev => ({ ...prev, history: currentHistory, itemOnGround: null }));

        const response = await getNextGameState(gameState, action);

        updateGameState(response);
        setIsLoading(false);
    }, [gameState, isLoading]);

    const handleTakeItem = useCallback(() => {
        if (!gameState.itemOnGround) return;
        
        const item = gameState.itemOnGround;
        const newPlayerState: Player = {
            ...gameState.player,
            inventory: [...gameState.player.inventory, item]
        };
        
        // Recalculate stats based on the new inventory
        const baseAttack = 10; // Assuming a base value
        const baseDefense = 5;  // Assuming a base value
        const baseMaxHp = 100;

        const attackBonus = newPlayerState.inventory.reduce((sum, i) => sum + (i.attackBonus || 0), 0);
        const defenseBonus = newPlayerState.inventory.reduce((sum, i) => sum + (i.defenseBonus || 0), 0);
        const hpBonus = newPlayerState.inventory.reduce((sum, i) => sum + (i.hpBonus || 0), 0);
        
        newPlayerState.attack = baseAttack + attackBonus;
        newPlayerState.defense = baseDefense + defenseBonus;
        newPlayerState.maxHp = baseMaxHp + hpBonus;
        newPlayerState.hp = Math.min(newPlayerState.hp + (item.hpBonus || 0), newPlayerState.maxHp);


        const newHistory = [...gameState.history, `> You took the ${item.name}.`];
        
        setGameState(prev => ({
            ...prev,
            player: newPlayerState,
            history: newHistory,
            itemOnGround: null,
        }));
    }, [gameState]);


    const updateGameState = (response: GeminiResponse) => {
        setGameState(prev => {
            const newPlayerState = {
                ...prev.player,
                ...response.playerUpdate,
            };

            const newHistory = response.sceneDescription ? [...prev.history, response.sceneDescription] : prev.history;

            let enemy = prev.currentEnemy;
            if (response.newEnemy) {
                enemy = response.newEnemy;
            } else if (response.enemyUpdate && prev.currentEnemy) {
                if (response.enemyUpdate.hp <= 0) {
                    enemy = null; // Enemy defeated
                    newHistory.push(`> You defeated the ${prev.currentEnemy.name}.`);
                } else {
                    enemy = { ...prev.currentEnemy, ...response.enemyUpdate };
                }
            }
            
            let npc = prev.currentNpc;
            if (response.newNpc) {
                npc = response.newNpc;
            } else if (response.npcUpdate && prev.currentNpc) {
                npc = { ...prev.currentNpc, ...response.npcUpdate };
            }
            
            // Ensure inventory is always an array
            if (!Array.isArray(newPlayerState.inventory)) {
                newPlayerState.inventory = prev.player.inventory || [];
            }

            return {
                ...prev,
                player: newPlayerState,
                currentEnemy: enemy,
                currentNpc: npc,
                sceneDescription: response.sceneDescription,
                imagePrompt: response.imagePrompt,
                history: newHistory,
                actions: response.actions,
                gameState: response.gameState,
                itemOnGround: response.item || null,
                aiCorruption: response.aiCorruption !== undefined ? response.aiCorruption : prev.aiCorruption,
            };
        });
    };

    const handleCharacterCreate = (name: string) => {
        const initialPlayer: Player = {
            ...INITIAL_GAME_STATE.player,
            name: name,
        };
        const firstAction = "I wake up in my dimly lit apartment. What's the situation?";
        
        setGameState({
            ...INITIAL_GAME_STATE,
            player: initialPlayer,
            history: [`> System rebooting... Welcome, ${name}.`],
            gameState: 'exploring',
        });
        
        const getInitialState = (player: Player) => ({
             ...INITIAL_GAME_STATE,
            player,
            gameState: 'exploring' as const,
        });

        setTimeout(() => {
            handlePlayerActionWrapper(getInitialState(initialPlayer), firstAction);
        }, 100);
    };

    const handlePlayerActionWrapper = async (state: GameState, action: string) => {
         if (isLoading) return;
         setIsLoading(true);
         const response = await getNextGameState(state, action);
         updateGameState(response);
         setIsLoading(false);
    }
    
    const corruptionStyle = useMemo(() => {
        const intensity = Math.min(gameState.aiCorruption / 50, 1);
        return {
            '--tw-backdrop-blur': `blur(${intensity * 4}px)`,
            '--tw-backdrop-saturate': `saturate(${100 - intensity * 50}%)`,
            'boxShadow': `inset 0 0 ${intensity * 20}px rgba(255, 0, 100, ${intensity * 0.5})`,
        };
    }, [gameState.aiCorruption]);

    const renderGameUI = () => (
        <main className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 h-[calc(100vh-81px)]">
            <div className="md:col-span-1 flex flex-col gap-4">
                <PlayerStatus player={gameState.player} />
                {gameState.currentEnemy && <EnemyStatus enemy={gameState.currentEnemy} />}
            </div>
            <div className="md:col-span-2 flex flex-col bg-black/30 border border-cyan-900/50">
                <div className="flex-grow p-4 overflow-hidden">
                    <StoryDisplay
                        history={gameState.history}
                        isLoading={isLoading}
                        itemOnGround={gameState.itemOnGround}
                        onTakeItem={handleTakeItem}
                    />
                </div>
                <StoryControls
                    actions={gameState.actions}
                    onAction={handlePlayerAction}
                    isLoading={isLoading}
                />
            </div>
            <div className="md:col-span-1">
                <SceneBackground imagePrompt={gameState.imagePrompt} />
            </div>
        </main>
    );

    return (
        <div className="bg-gray-900 text-white font-mono min-h-screen bg-cover bg-center relative">
            <RainEffect />
            <div 
                className="relative z-10 bg-black/50 min-h-screen transition-all duration-1000"
                style={corruptionStyle as React.CSSProperties}
            >
                <Header />
                {gameState.gameState === 'characterCreation' ? (
                    <CharacterCreation onCharacterCreate={handleCharacterCreate} />
                ) : (
                    renderGameUI()
                )}
                 {gameState.aiCorruption > 10 && (
                    <div className="fixed bottom-2 right-2 text-xs text-red-500/50 animate-pulse font-mono">
                        SYSTEM INSTABILITY DETECTED: {gameState.aiCorruption}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
