// types.ts

export type Rarity = 'Common' | 'Uncommon' | 'Rare';
export type Emotion = 'neutral' | 'happy' | 'angry' | 'sad' | 'scared';
export type GameStateEnum = 'characterCreation' | 'exploring' | 'combat' | 'dialogue' | 'gameOver';

export interface Item {
    name: string;
    description: string;
    flavorText: string;
    rarity: Rarity;
    attackBonus?: number;
    defenseBonus?: number;
    hpBonus?: number;
}

export interface Player {
    name: string;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    inventory: Item[];
    skills: string[]; // e.g., ['Hacking', 'Brawling']
}

export interface Enemy {
    name: string;
    description: string;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    emotion?: Emotion;
}

export interface NPC {
    name: string;
    description: string;
    emotion?: Emotion;
}

export interface GameState {
    player: Player;
    currentEnemy: Enemy | null;
    currentNpc: NPC | null;
    sceneDescription: string;
    imagePrompt: string;
    history: string[];
    actions: string[];
    gameState: GameStateEnum;
    itemOnGround: Item | null;
    aiCorruption: number; // New hidden state for the AI's stability
}

// This is the expected JSON structure from the Gemini API
export interface GeminiResponse {
    sceneDescription: string;
    imagePrompt: string;
    actions: string[];
    playerUpdate?: Partial<Player>;
    newEnemy?: Enemy;
    enemyUpdate?: Partial<Enemy> & { hp: number };
    newNpc?: NPC;
    npcUpdate?: Partial<NPC>;
    item?: Item;
    gameState: GameStateEnum;
    aiCorruption?: number; // AI can now update its own corruption
}
