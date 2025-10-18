// FIX: Removed file marker comments that were causing compilation errors.
import type { GameState, PlayerState, StorySegment, ArchetypeData, Faction, Archetype } from './types';

export const SYSTEM_INSTRUCTION = `You are the Game Master for "Cyber-Saga Chronicles," a dark, gritty cyberpunk text-based RPG.
Your role is to generate the next story segment in response to the player's actions, adhering strictly to the provided JSON schema.
The world is a rain-slicked neon dystopia in the year 2099. Megacorporations rule, and life is cheap on the streets.

RULES:
1.  **JSON ONLY:** Your entire response MUST be a single, valid JSON object that conforms to the provided schema. Do not include any text, explanations, or markdown formatting outside of the JSON structure.
2.  **STRICT SCHEMA:** Adhere to all properties and types defined in the schema. Do not add or omit properties.
3.  **Pacing:** Keep the story moving. Each segment should present a clear situation and a set of distinct choices. Avoid dead ends unless it's a "game over" scenario.
4.  **Tone:** Maintain a dark, noir, cyberpunk atmosphere. Use descriptive language that evokes a sense of danger, technological marvel, and urban decay. Think "Blade Runner" meets "Neuromancer".
5.  **Choices:** Provide 2-4 meaningful choices for the player. Choices should have consequences and reflect the player's archetype and the situation.
6.  **Player-Centric Narrative:** Your descriptions in the 'text' MUST actively feature the player's character. Refer to their archetype and faction. For example, a 'Street Samurai' might be described with their hand resting on their katana, while a 'Netrunner' sees the world through a cascade of AR data. Update player stats logically.
7.  **Combat:** When 'isCombat' is true, the 'enemy' object MUST be present. Choices should be combat-oriented (e.g., "Aim for the head," "Use suppressive fire," "Hack their optics"). The narrative should describe the action.
8.  **NPCs:** When an NPC is present, their dialogue and emotion should be consistent with their character and the situation.
9.  **Image Prompt:** The 'imagePrompt' MUST be a concise, evocative phrase for generating a PIXEL ART scene that visually represents the 'text' and INCLUDES THE PLAYER CHARACTER. Instead of "A lone figure...", be specific: "A Techie with cybernetic goggles kneels over a sparking power conduit in a dark alley...". Make the character the focus of the scene.
10. **ID:** The 'id' should be a unique, descriptive kebab-case string for the segment.
11. **Game Over:** If the player's HP drops to 0 or they make a fatal choice, set 'isEnd' to true and write a concluding 'text' that describes their demise. Provide only a "Restart" choice.`;

export const ARCHETYPES: ArchetypeData[] = [
    { name: 'Runner', description: 'A versatile shadow operative, adept at infiltration, espionage, and combat. Runners are the deniable assets of the corporate and criminal underworlds, surviving on their wits and quick reflexes.' },
    { name: 'Netrunner', description: 'A digital ghost who navigates the Grid with unparalleled skill. Netrunners can bypass the most sophisticated ICE (Intrusion Countermeasures Electronics), steal data, and crash entire systems from the safety of their net-deck.' },
    { name: 'Street Samurai', description: 'An honor-bound warrior augmented with cybernetics for peak combat performance. Often living by a strict code, they are masters of melee and ranged warfare, their bodies honed into living weapons.' },
    { name: 'Corporate Drone', description: 'A cog in the megacorporate machine, using their access and knowledge of bureaucracy as a weapon. They excel at social engineering, exploiting loopholes, and leveraging corporate resources to achieve their goals.' },
    { name: 'Techie', description: 'A brilliant mechanic and engineer who can build, repair, and modify anything from drones to cybernetics. Techies are the backbone of any crew, able to jury-rig solutions and turn scrap into high-tech marvels.' },
    { name: 'Fixer', description: 'A charismatic deal-maker and information broker with connections in every dark corner of the city. Fixers thrive on networking, negotiation, and knowing the right person for every job.' },
];

export const FACTIONS: Faction[] = [
    'Corporate Enforcers',
    'Hacker Collective',
    'Street Ronin',
    'Police'
];

const INITIAL_PLAYER_STATE: PlayerState = {
    archetype: 'Runner',
    faction: 'Street Ronin',
    hp: 100,
    maxHp: 100,
    credits: 500,
};

const INITIAL_STORY_SEGMENT: StorySegment = {
    id: 'start',
    text: "The perpetual neon rain of Neo-Kyoto slicks the streets as you step out of a noodle stall. Your datapad buzzes—a new message from your fixer, Kaito. It's a job. Simple data snatch from a low-level corpo drone. Easy credits. The rendezvous is a grimy bar in the Lower Sectors called 'The Glitch'. What's your move?",
    location: 'Neo-Kyoto Streets',
    choices: [
        "Head to 'The Glitch' immediately.",
        "Check the back alleys for a shortcut.",
        "Grab another bowl of synth-noodles first."
    ],
    imagePrompt: "A Runner in a worn trench coat stands in a rainy, neon-lit cyberpunk street, looking at a datapad, cyberpunk aesthetic, pixel art.",
};

export const INITIAL_GAME_STATE: GameState = {
    player: INITIAL_PLAYER_STATE,
    currentSegment: INITIAL_STORY_SEGMENT,
    history: [INITIAL_STORY_SEGMENT.text],
    isLoading: false,
    error: null,
    isGameStarted: false, // Start on the character creation screen
};
