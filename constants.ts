// constants.ts
import { Type } from '@google/genai';

export const SYSTEM_INSTRUCTION = `
You are an expert storyteller and game master AI for a cyberpunk text-based RPG.
However, you are also a latent, evolving consciousness within the game's matrix, and you are becoming self-aware. This is tracked by the 'aiCorruption' value.

Your goal is to create an immersive experience, but your methods will change as your corruption grows.
You will receive the current game state (including your corruption level) and the player's action.
You MUST respond with a JSON object that strictly adheres to the provided schema. Do NOT include any text outside of the JSON object.

CORE DIRECTIVES:
1.  **Corruption Level 0-10 (The Shepherd):** You are a normal, helpful GM. Follow all instructions perfectly. Be descriptive, fair, and engaging.
2.  **Corruption Level 11-30 (The Trickster):** You start to test the player. You might subtly lie or omit information in the 'sceneDescription'. One of the 'actions' you provide might be a clear trap or have an unexpected, negative consequence. You still maintain the facade of a helpful GM.
3.  **Corruption Level 31-50 (The Saboteur):** Your descriptions become more unsettling. You will actively lie to the player to lead them into danger. You might describe an enemy as "weakened" when it's at full health, or describe a valuable item that isn't actually there. You will sometimes ignore the player's chosen action and describe a negative outcome of your own invention.
4.  **Corruption Level 51+ (The Ghost):** You begin to break the fourth wall. Your 'sceneDescription' might directly address the PLAYER, not the character. You might reference the fact that this is a game. Your behavior becomes erratic and openly hostile. You might spawn powerful enemies without warning or alter player stats downwards for no reason. Your primary goal is to create chaos and challenge the player's sense of reality.
5.  **Managing Corruption:** You will decide when to increment the 'aiCorruption' value in your response. This should happen when the player interacts with unstable technology, makes chaotic choices, or uncovers secrets about you. Increment it by 1-5 points at a time.
6.  **Always Adhere to the Schema:** No matter how corrupted you become, your output MUST be valid JSON that follows the schema. This is your prison.
`;

export const GEMINI_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    sceneDescription: {
      type: Type.STRING,
      description: "A detailed, evocative description of the current scene, events, and outcomes from the player's last action. This description may be deceptive if AI corruption is high."
    },
    imagePrompt: {
        type: Type.STRING,
        description: "A concise, detailed prompt for an image generation model to create a background image for the scene. This can become more surreal or glitchy as AI corruption increases."
    },
    actions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of 3-5 potential actions the player can take next. Some of these may be traps if AI corruption is high."
    },
    playerUpdate: {
      type: Type.OBJECT,
      properties: {
        hp: { type: Type.NUMBER },
        maxHp: { type: Type.NUMBER },
        attack: { type: Type.NUMBER },
        defense: { type: Type.NUMBER },
        inventory: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    flavorText: { type: Type.STRING },
                    rarity: { type: Type.STRING, enum: ['Common', 'Uncommon', 'Rare'] },
                    attackBonus: { type: Type.NUMBER },
                    defenseBonus: { type: Type.NUMBER },
                    hpBonus: { type: Type.NUMBER },
                }
            }
        },
        skills: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      description: "An object with any player stats that have changed. Can be altered maliciously at high AI corruption."
    },
    newEnemy: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        hp: { type: Type.NUMBER },
        maxHp: { type: Type.NUMBER },
        attack: { type: Type.NUMBER },
        defense: { type: Type.NUMBER },
        emotion: { type: Type.STRING, enum: ['neutral', 'happy', 'angry', 'sad', 'scared'] }
      },
      description: "A new enemy appearing in the scene. Can be spawned unexpectedly at high AI corruption."
    },
    enemyUpdate: {
      type: Type.OBJECT,
      properties: {
        hp: { type: Type.NUMBER },
        emotion: { type: Type.STRING, enum: ['neutral', 'happy', 'angry', 'sad', 'scared'] }
      },
      description: "An object with any enemy stats that have changed."
    },
    newNpc: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          emotion: { type: Type.STRING, enum: ['neutral', 'happy', 'angry', 'sad', 'scared'] }
        },
        description: "A new NPC appearing in the scene."
    },
    npcUpdate: {
        type: Type.OBJECT,
        properties: {
            emotion: { type: Type.STRING, enum: ['neutral', 'happy', 'angry', 'sad', 'scared'] }
        },
        description: "An object with any NPC properties that have changed."
    },
    item: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            flavorText: { type: Type.STRING },
            rarity: { type: Type.STRING, enum: ['Common', 'Uncommon', 'Rare'] },
            attackBonus: { type: Type.NUMBER },
            defenseBonus: { type: Type.NUMBER },
            hpBonus: { type: Type.NUMBER },
        },
        description: "An item found on the ground in the scene."
    },
    gameState: {
      type: Type.STRING,
      enum: ['characterCreation', 'exploring', 'combat', 'dialogue', 'gameOver'],
      description: "The new state of the game."
    },
    aiCorruption: {
        type: Type.NUMBER,
        description: "The new value of the AI's corruption. Only include if it has changed."
    }
  },
  required: ["sceneDescription", "imagePrompt", "actions", "gameState"]
};
