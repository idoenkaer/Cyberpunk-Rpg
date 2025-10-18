// services/geminiService.ts
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import type { Archetype, Faction, StorySegment, Npc } from '../types';
import { INITIAL_PROMPT, STORY_CONTINUATION_PROMPT, NPC_GENERATION_PROMPT } from '../constants';

// Ensure the API key is available from environment variables
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

// Fix: Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const storySegmentSchema = {
    type: Type.OBJECT,
    properties: {
        text: {
            type: Type.STRING,
            description: "The main narrative text for the current story segment. A single descriptive paragraph.",
        },
        location: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The name of the current location." },
                description: { type: Type.STRING, description: "A brief, one-sentence description of the location." },
            },
            required: ['name', 'description'],
        },
    },
    required: ['text', 'location'],
};

const npcSchema = {
    type: Type.OBJECT,
    properties: {
        name: {
            type: Type.STRING,
            description: "The NPC's name."
        },
        description: {
            type: Type.STRING,
            description: "A one-sentence physical description of the NPC."
        },
        dialogue: {
            type: Type.OBJECT,
            properties: {
                openingLine: {
                    type: Type.STRING,
                    description: "The first thing the NPC says to the player."
                },
                choices: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING, description: "The player's dialogue option." },
                            response: { type: Type.STRING, description: "The NPC's response to that option." }
                        },
                        required: ["text", "response"]
                    }
                }
            },
            required: ["openingLine", "choices"]
        }
    },
    required: ["name", "description", "dialogue"]
};


export const generateInitialStory = async (archetype: Archetype, faction: Faction): Promise<StorySegment> => {
    const prompt = `${INITIAL_PROMPT}\n\nArchetype: ${archetype}\nFaction: ${faction}`;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: storySegmentSchema
            },
        });
        
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);

        return {
            id: crypto.randomUUID(),
            text: data.text,
            location: data.location,
        };

    } catch (error) {
        console.error("Error generating initial story:", error);
        throw new Error("Failed to start the story. The AI is offline.");
    }
};

export const generateNpcForSegment = async (storyText: string): Promise<Npc> => {
     const prompt = `${NPC_GENERATION_PROMPT}\n\nCurrent Scene: ${storyText}`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: npcSchema
            },
        });
        
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);

        return data as Npc;

    } catch (error) {
        console.error("Error generating NPC:", error);
        throw new Error("Failed to create a character. The AI is distracted.");
    }
};

export const continueStory = async (history: StorySegment[], playerChoice: string): Promise<StorySegment> => {
    const context = history.map(seg => seg.text).join('\n\n');
    const prompt = `${STORY_CONTINUATION_PROMPT}\n\nStory so far:\n${context}\n\nPlayer's last action: ${playerChoice}`;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: storySegmentSchema
            },
        });
        
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        
        return {
            id: crypto.randomUUID(),
            text: data.text,
            location: data.location,
        };
    } catch (error)
        console.error("Error continuing story:", error);
        throw new Error("Failed to continue the story. The AI has lost the thread.");
    }
};
