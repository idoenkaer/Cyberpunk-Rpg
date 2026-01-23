// components/GameView.tsx
import React from 'react';
import SceneBackground from './SceneBackground';
import GeneratedSprite from './GeneratedSprite';
import type { Player, Enemy, NPC } from '../types';

interface GameViewProps {
    imagePrompt: string;
    player: Player;
    enemy: Enemy | null;
    npc: NPC | null;
}

const GameView: React.FC<GameViewProps> = ({ imagePrompt, player, enemy, npc }) => {
    const playerSpritePrompt = `A full body pixel art sprite of a cyberpunk character named '${player.name}'. 16-bit, standing animation frame.`;
    const enemySpritePrompt = enemy ? `A full body pixel art sprite of a ${enemy.name}, a ${enemy.description}. 16-bit, standing animation frame.` : '';
    const npcSpritePrompt = npc ? `A full body pixel art sprite of ${npc.name}, a ${npc.description}. 16-bit, standing animation frame.` : '';

    return (
        <div className="w-full h-full relative overflow-hidden">
            <div className="absolute inset-0">
                <SceneBackground imagePrompt={imagePrompt} />
            </div>
            
            <div className="absolute bottom-1/4 inset-x-0 flex justify-center items-end" style={{gap: '15vw'}}>
                 {/* NPC or Enemy on the left */}
                 {(npc || enemy) && (
                     <div className="transform scale-x-[-1]">
                        <GeneratedSprite 
                            prompt={npc ? npcSpritePrompt : enemySpritePrompt}
                            alt={npc ? npc.name : enemy!.name}
                            cacheKey={`sprite-${npc ? npc.name : enemy!.name}`}
                        />
                     </div>
                 )}

                {/* Player on the right */}
                <GeneratedSprite 
                    prompt={playerSpritePrompt}
                    alt={player.name}
                    cacheKey={`player-sprite-${player.name}`}
                />
            </div>
        </div>
    );
};

export default GameView;
