
export type Archetype = 'Runner' | 'Netrunner' | 'Street Samurai' | 'Corporate Drone';
export type Faction = 'Corporate Enforcers' | 'Hacker Collective' | 'Street Ronin' | 'Police';

export interface Choice {
    text: string;
    response: string; // This is what the NPC says if you choose this.
}

export interface DialogueTree {
    openingLine: string;
    choices: Choice[];
}

export interface NPC {
    name: string;
    description: string;
    dialogue: DialogueTree;
}

export interface Enemy {
    name: string;
    description: string;
    hp: number;
    maxHp: number;
    attack: number;
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
}
