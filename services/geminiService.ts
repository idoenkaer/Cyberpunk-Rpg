// FIX: Removed file marker comments that were causing compilation errors.
import { GoogleGenAI, Type } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../constants';
import type { GameState, StorySegment } from '../types';

// Per instructions, API key is from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: 'A unique identifier for this story segment, like "market-ambush" or "data-heist-start".' },
        text: { type: Type.STRING, description: 'The main narrative text describing the current scene, events, and atmosphere.' },
        location: { type: Type.STRING, description: 'The name of the current location, e.g., "The Glitch Bar" or "Zentai Corp Tower".' },
        choices: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'An array of 2-4 strings, representing the actions the player can take next.'
        },
        imagePrompt: { type: Type.STRING, description: 'A concise prompt for an AI image generator to create a pixel art scene.' },
        isCombat: { type: Type.BOOLEAN, description: 'Set to true if this segment is a combat encounter.' },
        isEnd: { type: Type.BOOLEAN, description: 'Set to true if this is a game over or conclusion screen.' },
        npc: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                emotion: { type: Type.STRING, description: "The NPC's current emotion: 'neutral', 'happy', 'angry', 'sad', or 'scared'." },
                dialogue: {
                    type: Type.OBJECT,
                    properties: {
                        openingLine: { type: Type.STRING },
                        choices: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    response: { type: Type.STRING }
                                },
                                required: ['text', 'response']
                            }
                        }
                    },
                    required: ['openingLine', 'choices']
                }
            },
            required: ['name', 'description', 'dialogue'],
            // Note: NPC itself is not required for a segment
        },
        enemy: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                hp: { type: Type.INTEGER },
                maxHp: { type: Type.INTEGER },
                attack: { type: Type.INTEGER },
                emotion: { type: Type.STRING, description: "The enemy's current emotion: 'neutral', 'angry', or 'scared'." }
            },
            required: ['name', 'description', 'hp', 'maxHp', 'attack']
        },
        playerUpdate: {
            type: Type.OBJECT,
            properties: {
                hp: { type: Type.INTEGER, description: "The player's new HP, if it changed." },
                credits: { type: Type.INTEGER, description: "The player's new credit amount, if it changed." }
            }
        }
    },
    required: ['id', 'text', 'location', 'choices', 'imagePrompt']
};


export const getNextStorySegment = async (currentState: GameState, playerChoice: string): Promise<StorySegment> => {
    try {
        const model = 'gemini-2.5-pro'; 

        const prompt = `
            PREVIOUS STORY:
            ${currentState.history.slice(-3).join('\n---\n')}

            CURRENT GAME STATE:
            Player: { archetype: ${currentState.player.archetype}, faction: ${currentState.player.faction}, hp: ${currentState.player.hp}, credits: ${currentState.player.credits} }
            Location: ${currentState.currentSegment.location}
            
            PLAYER'S ACTION: "${playerChoice}"

            Generate the next story segment, ensuring the player's character (archetype, faction) is the focus of the narrative and visuals.
        `;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
                temperature: 0.8,
            }
        });
        
        const jsonText = response.text.trim();
        
        // Hardened error handling for JSON parsing
        try {
            const nextSegment = JSON.parse(jsonText) as StorySegment;
            return nextSegment;
        } catch (parseError) {
             console.error("Failed to parse AI response as JSON:", jsonText);
             throw new Error("AI returned invalid data format. Please try again.");
        }

    } catch (error) {
        console.error("Error generating story segment:", error);
        if (error instanceof Error && error.message.includes("invalid data format")) {
            throw error;
        }
        throw new Error("Failed to generate the next part of the story. The AI might be offline or the response was invalid.");
    }
};
