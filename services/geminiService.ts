// services/geminiService.ts

import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION, GEMINI_RESPONSE_SCHEMA } from '../constants';
import type { GameState, GeminiResponse } from '../types';

// Per instructions, API key is from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export async function getNextGameState(currentState: GameState, playerAction: string): Promise<GeminiResponse> {
    const model = 'gemini-2.5-flash';

    const prompt = `
        Current State: ${JSON.stringify(currentState)}
        Player Action: "${playerAction}"
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: 'application/json',
                responseSchema: GEMINI_RESPONSE_SCHEMA,
                temperature: 0.8, // Slightly increased temperature for more unpredictable AI behavior
            },
        });
        
        const jsonText = response.text.trim();
        const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/);
        const parsableText = jsonMatch ? jsonMatch[1] : jsonText;

        const parsedResponse = JSON.parse(parsableText) as GeminiResponse;
        return parsedResponse;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return {
            sceneDescription: "A critical error has occurred in the simulation matrix. The world glitches around you, colors bleeding into static. The connection is unstable. The AI itself seems to be laughing.",
            imagePrompt: "A glitch art effect, with datamoshing and pixel sorting over a cyberpunk city. Red error messages in a distorted font are overlaid. A faint, menacing digital face is visible in the static.",
            actions: ["Restart"],
            gameState: "gameOver",
        };
    }
}
