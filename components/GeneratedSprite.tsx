// components/GeneratedSprite.tsx
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

interface GeneratedSpriteProps {
    prompt: string;
    alt: string;
    cacheKey: string;
}

// Per instructions, API key is from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// In-memory cache for generated images
const imageCache = new Map<string, string>();

const GeneratedSprite: React.FC<GeneratedSpriteProps> = ({ prompt, alt, cacheKey }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const generateImage = async () => {
            if (!prompt || !cacheKey) {
                setImageUrl(null);
                return;
            }

            if (imageCache.has(cacheKey)) {
                setImageUrl(imageCache.get(cacheKey)!);
                setIsLoading(false);
                setError(null);
                return;
            }

            setIsLoading(true);
            setError(null);
            
            try {
                // Add transparent background to the prompt for clean overlay
                const fullPrompt = `${prompt}, full body, transparent background`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [{ text: fullPrompt }] },
                    config: { responseModalities: [Modality.IMAGE] },
                });

                let foundImage = false;
                const candidate = response.candidates?.[0];

                if (candidate?.content?.parts) {
                    for (const part of candidate.content.parts) {
                        if (part.inlineData) {
                            const base64ImageBytes: string = part.inlineData.data;
                            const generatedUrl = `data:image/png;base64,${base64ImageBytes}`;
                            imageCache.set(cacheKey, generatedUrl);
                            setImageUrl(generatedUrl);
                            foundImage = true;
                            break; 
                        }
                    }
                }

                 if (!foundImage) {
                    throw new Error("No image data received from API or response was blocked.");
                }

            } catch (e) {
                console.error("Failed to generate sprite:", e);
                const errorMessage = e instanceof Error ? e.message : String(e);
                if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
                    setError("RATE LIMIT EXCEEDED");
                } else {
                    setError("DATA CORRUPTED");
                }
            } finally {
                setIsLoading(false);
            }
        };

        generateImage();
    }, [prompt, cacheKey]);

    if (isLoading) return <div className="w-32 h-48 flex items-center justify-center text-cyan-400 text-xs animate-pulse">[Rendering...]</div>;
    if (error) return <div className="w-32 h-48 flex items-center justify-center text-red-400 text-xs text-center p-1">{error}</div>;
    if (imageUrl) {
        return <img src={imageUrl} alt={alt} className="w-32 h-48 object-contain animate-fade-in" style={{ imageRendering: 'pixelated' }} />;
    }
    return <div className="w-32 h-48" />; // Empty space if no signal
};

export default GeneratedSprite;