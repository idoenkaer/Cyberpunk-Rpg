// types.ts

export type Archetype = 'Runner' | 'Netrunner' | 'Street Samurai' | 'Corporate Drone';

export type Faction = 'Corporate Enforcers' | 'Hacker Collective' | 'Street Ronin' | 'Police';

export interface DialogueChoice {
    text: string;
    response: string;
}

export interface DialogueTree {
    openingLine: string;
    choices: DialogueChoice[];
}

export interface StorySegment {
    id: string;
    text: string;
    npc?: Npc;
    location?: Location;
}

export interface Npc {
    name: string;
    description: string;
    dialogue: DialogueTree;
}

export interface Location {
    name: string;
    description: string;
}

export interface StoryState {
    archetype: Archetype;
    faction: Faction;
    currentSegment: StorySegment | null;
    history: StorySegment[];
    isLoading: boolean;
    error: string | null;
}
