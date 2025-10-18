// services/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import type { PlayerState, GameStateUpdate } from "../types";

// Per instructions, API key is from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const model = 'gemini-2.5-pro';

const itemSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        flavorText: { type: Type.STRING },
        rarity: { type: Type.STRING, enum: ['Common', 'Uncommon', 'Rare'] },
        itemType: { type: Type.STRING, enum: ['weapon', 'head', 'chest', 'legs', 'consumable'] },
        attackBonus: { type: Type.NUMBER, nullable: true },
        defenseBonus: { type: Type.NUMBER, nullable: true },
        hpBonus: { type: Type.NUMBER, nullable: true },
    },
    required: ['name', 'description', 'flavorText', 'rarity', 'itemType']
};

const enemySchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        hp: { type: Type.NUMBER },
        maxHp: { type: Type.NUMBER },
        attack: { type: Type.NUMBER },
        defense: { type: Type.NUMBER },
        emotion: { type: Type.STRING, enum: ['neutral', 'happy', 'angry', 'sad', 'scared'], nullable: true },
    },
    required: ['name', 'description', 'hp', 'maxHp', 'attack', 'defense']
};

const dialogueSchema = {
    type: Type.OBJECT,
    properties: {
        npcName: { type: Type.STRING },
        text: { type: Type.STRING },
        emotion: { type: Type.STRING, enum: ['neutral', 'happy', 'angry', 'sad', 'scared'], nullable: true },
    },
    required: ['npcName', 'text']
};


const responseSchema = {
    type: Type.OBJECT,
    properties: {
        story: { type: Type.STRING, description: 'The next paragraph of the story. Keep it concise (2-4 sentences). Describe the scene, events, and outcomes.' },
        playerState: {
            type: Type.OBJECT,
            description: "Updates to the player's state. Only include fields that have changed. For example, if player takes damage, only include the new 'hp'. If they gain XP, only include 'xp'.",
            properties: {
                hp: { type: Type.NUMBER, nullable: true },
                credits: { type: Type.NUMBER, nullable: true },
                level: { type: Type.NUMBER, nullable: true },
                xp: { type: Type.NUMBER, nullable: true },
                skillPoints: { type: Type.NUMBER, nullable: true },
            },
        },
        enemy: { ...enemySchema, nullable: true, description: "The enemy the player is facing. If combat ends, set to null. If no combat, omit this field." },
        dialogue: { ...dialogueSchema, nullable: true, description: "Dialogue from an NPC. If no dialogue, omit this field." },
        itemOnGround: { ...itemSchema, nullable: true, description: "An item the player finds. If no item, omit this field." },
        availableActions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 3-5 actions the player can take next. Be creative and context-aware."
        },
        imagePrompt: { 
            type: Type.STRING, 
            description: "A detailed, descriptive prompt for an image generation model to create a background scene. E.g., 'A gritty, neon-lit alley in a cyberpunk city at night, rain-slicked pavement, steam rising from vents, holographic ads flickering on walls.'"
        }
    },
    required: ['story', 'playerState', 'availableActions', 'imagePrompt']
};

function buildSystemInstruction(playerState: PlayerState, history: string[]): string {
    return `
You are the Game Master for a cyberpunk text adventure called "Cyber-Saga Chronicles".
Your goal is to create an engaging, challenging, and immersive story.
You must respond ONLY with a valid JSON object that conforms to the provided schema.

Game Rules:
1.  **Storytelling**: Weave a compelling narrative. The story should react to the player's choices.
2.  **State Management**: You will be given the current player state and the story history. You must return the *changes* to the player state, not the entire state.
3.  **Actions**: Provide 3-5 relevant actions based on the current situation. Actions should be concise and clear.
4.  **Combat**: When combat begins, provide an 'enemy' object. Manage enemy and player HP based on their stats and actions. When combat ends, set 'enemy' to null.
5.  **Items & Rewards**: Occasionally reward the player with items ('itemOnGround') or currency ('credits'). Award XP for overcoming challenges.
6.  **Difficulty**: The game should be challenging but fair.
7.  **Tone**: Maintain a gritty, noir, cyberpunk tone.

Current Player State:
${JSON.stringify(playerState, null, 2)}

Recent Story History (last 5 entries):
${history.slice(-5).join('\n')}
`;
}

export const getGameUpdate = async (
    playerState: PlayerState,
    history: string[],
    playerAction: string,
): Promise<GameStateUpdate> => {
    
    const systemInstruction = buildSystemInstruction(playerState, history);
    const userPrompt = `Player action: "${playerAction}"`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.8,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        // Basic validation
        if (!parsedResponse.story || !parsedResponse.availableActions) {
            throw new Error("Invalid response structure from AI");
        }

        return parsedResponse as GameStateUpdate;

    } catch (error) {
        console.error("Error getting game update from Gemini API:", error);
        // Provide a fallback state in case of an API error
        return {
            story: "The connection to the net flickers and dies. You're momentarily disconnected. You should try to reconnect.",
            playerState: {},
            availableActions: ["Try to reconnect."],
            imagePrompt: "A screen showing a connection error, with glitch art and cyberpunk aesthetics."
        };
    }
};

export const getIntro = async (playerState: PlayerState): Promise<GameStateUpdate> => {
     const introPrompt = `
        Generate the introductory game state for a new character.
        Character Archetype: ${playerState.archetype}
        Character Faction: ${playerState.faction}
        The story should set the scene for their first adventure.
     `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ role: 'user', parts: [{ text: introPrompt }] }],
            config: {
                 systemInstruction: `You are the Game Master for a cyberpunk text adventure. 
                 Generate the starting scenario for a new character. 
                 You must respond ONLY with a valid JSON object that conforms to the provided schema.`,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.8,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as GameStateUpdate;

    } catch (error) {
        console.error("Error getting intro from Gemini API:", error);
        // Fallback intro
        return {
            story: "You wake up in your cramped apartment in the neon-drenched Sector-7. The rain outside taps a relentless rhythm against your window. Your comm-link buzzes with a new message. A new job, a new chance to earn some creds.",
            playerState: {},
            availableActions: ["Check the message on your comm-link.", "Look out the window at the street below.", "Grab your gear and head out."],
            imagePrompt: "A cramped, messy room in a cyberpunk city, with a window showing a neon-lit skyscraper in the rain."
        };
    }
};
