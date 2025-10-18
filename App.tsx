// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CharacterCreation from './components/CharacterCreation';
import StoryDisplay from './components/StoryDisplay';
import StoryControls from './components/StoryControls';
import PlayerStatus from './components/PlayerStatus';
import SkillsPanel from './components/SkillsPanel';
import EnemyStatus from './components/EnemyStatus';
import SceneBackground from './components/SceneBackground';
import RainEffect from './components/RainEffect';

import { getIntro, getGameUpdate } from './services/geminiService';
import { ARCHETYPES } from './constants';

import type { PlayerState, Archetype, Faction, GameStateUpdate, Enemy, Item, Skill } from './types';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<'creation' | 'playing'>('creation');
    const [player, setPlayer] = useState<PlayerState | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [availableActions, setAvailableActions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [enemy, setEnemy] = useState<Enemy | null>(null);
    const [itemOnGround, setItemOnGround] = useState<Item | null>(null);
    const [imagePrompt, setImagePrompt] = useState('');

    const applyGameStateUpdate = useCallback((update: GameStateUpdate) => {
        setHistory(prev => [...prev, update.story]);
        
        if (update.playerState) {
            setPlayer(prev => {
                if (!prev) return null;
                const updatedPlayer = { ...prev };
                
                // Merge partial state
                for (const key in update.playerState) {
                    if (Object.prototype.hasOwnProperty.call(update.playerState, key)) {
                        const typedKey = key as keyof PlayerState;
                        (updatedPlayer as any)[typedKey] = (update.playerState as any)[typedKey];
                    }
                }
                return updatedPlayer;
            });
        }
        
        setEnemy(update.enemy === undefined ? enemy : update.enemy);
        setItemOnGround(update.itemOnGround === undefined ? itemOnGround : update.itemOnGround);
        setAvailableActions(update.availableActions);
        setImagePrompt(update.imagePrompt);

    }, [enemy, itemOnGround]);


    const handleStartGame = useCallback(async (archetype: Archetype, faction: Faction) => {
        setIsLoading(true);
        const archetypeData = ARCHETYPES.find(a => a.name === archetype)!;
        const initialPlayerState: PlayerState = {
            archetype,
            faction,
            hp: archetypeData.baseStats.hp,
            credits: 50,
            level: 1,
            xp: 0,
            skillPoints: 1,
            unlockedSkills: [],
            inventory: [],
            equippedItems: { weapon: null, head: null, chest: null, legs: null },
        };
        setPlayer(initialPlayerState);

        const introState = await getIntro(initialPlayerState);
        applyGameStateUpdate(introState);

        setGameState('playing');
        setIsLoading(false);
    }, [applyGameStateUpdate]);
    
    const handlePlayerAction = useCallback(async (action: string) => {
        if (!player) return;
        
        setIsLoading(true);
        const currentHistory = [...history, `> ${action}`];
        setHistory(currentHistory);
        setAvailableActions([]);
        setItemOnGround(null);

        const update = await getGameUpdate(player, currentHistory, action);
        applyGameStateUpdate(update);

        setIsLoading(false);
    }, [player, history, applyGameStateUpdate]);

    const handleTakeItem = useCallback(() => {
        if (!itemOnGround || !player) return;
        setPlayer(prev => prev ? ({ ...prev, inventory: [...prev.inventory, itemOnGround] }) : null);
        setItemOnGround(null);
    }, [itemOnGround, player]);
    
    const getComputedStats = useCallback(() => {
        if (!player) return { attack: 0, defense: 0, maxHp: 0 };
        const baseStats = ARCHETYPES.find(a => a.name === player.archetype)!.baseStats;
        let attack = baseStats.attack;
        let defense = baseStats.defense;
        let maxHp = baseStats.hp;

        Object.values(player.equippedItems).forEach(item => {
            if (item) {
                attack += item.attackBonus ?? 0;
                defense += item.defenseBonus ?? 0;
                maxHp += item.hpBonus ?? 0;
            }
        });
        
        return { attack, defense, maxHp };
    }, [player]);

    const handleEquipItem = useCallback((item: Item) => {
        if (!player || item.itemType === 'consumable') return;

        const slot = item.itemType as keyof PlayerState['equippedItems'];
        
        setPlayer(prev => {
            if (!prev) return null;
            const newEquipped = { ...prev.equippedItems };
            const newInventory = [...prev.inventory];
            
            const currentItem = newEquipped[slot];
            if(currentItem) {
                newInventory.push(currentItem);
            }

            newEquipped[slot] = item;
            const itemIndex = newInventory.findIndex(i => i.name === item.name);
            if(itemIndex > -1) {
                newInventory.splice(itemIndex, 1);
            }
            
            return { ...prev, equippedItems: newEquipped, inventory: newInventory };
        });

    }, [player]);

    const handleUnlockSkill = useCallback((skill: Skill) => {
        if (!player || player.skillPoints < 1) return;
        setPlayer(prev => prev ? ({
            ...prev,
            skillPoints: prev.skillPoints - 1,
            unlockedSkills: [...prev.unlockedSkills, skill.name]
        }) : null);
    }, [player]);


    const renderGame = () => {
        if (!player) return null;
        const stats = getComputedStats();
        return (
            <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-6 gap-4 overflow-hidden">
                {/* Left Panel */}
                <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-4">
                    <PlayerStatus player={player} stats={stats} onEquipItem={handleEquipItem} />
                </div>

                {/* Center Panel */}
                <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-4 h-[calc(100vh-150px)]">
                    <div className="h-1/2">
                       <SceneBackground imagePrompt={imagePrompt} />
                    </div>
                    <div className="flex-1 flex flex-col bg-black/30 border border-gray-700">
                        <StoryDisplay 
                            history={history} 
                            isLoading={isLoading} 
                            itemOnGround={itemOnGround}
                            onTakeItem={handleTakeItem}
                        />
                         <StoryControls 
                            actions={availableActions} 
                            onAction={handlePlayerAction} 
                            isLoading={isLoading} 
                        />
                    </div>
                </div>
                
                {/* Right Panel */}
                <div className="lg:col-span-1 xl:col-span-2 flex flex-col gap-4">
                    {enemy && <EnemyStatus enemy={enemy} />}
                    <SkillsPanel player={player} onUnlockSkill={handleUnlockSkill} />
                </div>
            </main>
        );
    };

    return (
        <div className="bg-black text-white font-mono min-h-screen flex flex-col relative overflow-hidden">
            <RainEffect />
            <div className="z-10 flex flex-col h-screen">
                 <Header />
                 {gameState === 'creation' ? (
                     <CharacterCreation onStartGame={handleStartGame} />
                 ) : (
                     renderGame()
                 )}
            </div>
        </div>
    );
};

export default App;
