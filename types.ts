export type Archetype = 'Runner' | 'Netrunner' | 'Street Samurai' | 'Corporate Drone' | 'Techie' | 'Fixer';
export type Faction = 'Corporate Enforcers' | 'Hacker Collective' | 'Street Ronin' | 'Police';
export type Emotion = 'neutral' | 'happy' | 'angry' | 'sad' | 'scared';

export interface Choice {
    text: string;
    response: string;
}

export interface DialogueTree {
    openingLine: string;
    choices: Choice[];
}

export interface NPC {
    name: string;
    description: string;
    dialogue: DialogueTree;
    emotion?: Emotion;
}

export interface Enemy {
    name: string;
    description: string;
    hp: number;
    maxHp: number;
    attack: number;
    emotion?: Emotion;
}

export interface PlayerState {
    archetype: Archetype;
    faction: Faction;
    hp: number;
    maxHp: number;
    credits: number;
}

export interface StorySegment {
    id: string;
    text: string;
    location: string;
    choices: string[];
    imagePrompt: string;
    npc?: NPC;
    enemy?: Enemy;
    isCombat?: boolean;
    isEnd?: boolean;
    playerUpdate?: {
        hp?: number;
        credits?: number;
    };
}

export interface GameState {
    player: PlayerState;
    currentSegment: StorySegment;
    history: string[];
    isLoading: boolean;
    error: string | null;
    isGameStarted: boolean; // Added to track game state
}

export interface ArchetypeData {
    name: Archetype;
    description: string;
}
