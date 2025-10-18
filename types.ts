// types.ts
export type Archetype = 'Runner' | 'Netrunner' | 'Street Samurai' | 'Corporate Drone' | 'Techie' | 'Fixer';
export type Faction = 'Corporate Enforcers' | 'Hacker Collective' | 'Street Ronin' | 'Police';

export interface ArchetypeData {
    name: Archetype;
    description: string;
    baseStats: {
        hp: number;
        attack: number;
        defense: number;
    };
}

export type Rarity = 'Common' | 'Uncommon' | 'Rare';
export type ItemType = 'weapon' | 'head' | 'chest' | 'legs' | 'consumable';
export type ItemSlot = 'weapon' | 'head' | 'chest' | 'legs';

export interface Item {
    name: string;
    description: string;
    flavorText: string;
    rarity: Rarity;
    itemType: ItemType;
    attackBonus?: number;
    defenseBonus?: number;
    hpBonus?: number;
}

export interface Skill {
    name: string;
    description: string;
    effect: string; // Describes what the skill does mechanically
}

export interface PlayerState {
    archetype: Archetype;
    faction: Faction;
    hp: number;
    credits: number;
    level: number;
    xp: number;
    skillPoints: number;
    unlockedSkills: string[]; // array of skill names
    inventory: Item[];
    equippedItems: {
        weapon: Item | null;
        head: Item | null;
        chest: Item | null;
        legs: Item | null;
    };
}

export type Emotion = 'neutral' | 'happy' | 'angry' | 'sad' | 'scared';

export interface Enemy {
    name: string;
    description: string;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    emotion?: Emotion;
}

export interface Dialogue {
    npcName: string;
    text: string;
    emotion?: Emotion;
}

// The main state object returned by the Gemini API
export interface GameStateUpdate {
    story: string; // The next part of the story text
    playerState: Partial<PlayerState>; // Changes to the player's state
    enemy?: Enemy | null; // An enemy if combat starts, or null to end combat
    dialogue?: Dialogue | null;
    itemOnGround?: Item | null; // An item found in the world
    availableActions: string[]; // A list of choices for the player
    imagePrompt: string; // A prompt for the scene background generator
}
