// components/GeneratedPortrait.tsx
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

interface GeneratedPortraitProps {
    prompt: string;
    alt: string;
    cacheKey: string;
}

// Per instructions, API key is from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// In-memory cache for generated images
const imageCache = new Map<string, string>();

const GeneratedPortrait: React.FC<GeneratedPortraitProps> = ({ prompt, alt, cacheKey }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const generateImage = async () => {
            if (!prompt || !cacheKey) return;

            if (imageCache.has(cacheKey)) {
                setImageUrl(imageCache.get(cacheKey)!);
                setIsLoading(false);
                setError(null);
                return;
            }

            setIsLoading(true);
            setError(null);
            
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: {
                        parts: [{ text: prompt }],
                    },
                    config: {
                        responseModalities: [Modality.IMAGE],
                    },
                });

                let foundImage = false;
                const candidate = response.candidates?.[0];

                if (candidate && candidate.content && candidate.content.parts) {
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
                console.error("Failed to generate portrait:", e);
                const errorMessage = e instanceof Error ? e.message : String(e);
                if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
                    setError("RATE LIMIT EXCEEDED");
                } else {
                    setError("VISUAL LINK FAILED");
                }
            } finally {
                setIsLoading(false);
            }
        };

        generateImage();
    }, [prompt, cacheKey]);

    const content = () => {
        if (isLoading) {
            return <div className="text-cyan-400 text-xs animate-pulse text-center p-2">[Rendering ID...]</div>;
        }
        if (error) {
            return <div className="text-red-400 text-xs text-center p-2">{error}</div>;
        }
        if (imageUrl) {
            return <img src={imageUrl} alt={alt} className="w-36 h-36 object-cover" style={{ imageRendering: 'pixelated' }} />;
        }
        return <div className="w-36 h-36 bg-black flex items-center justify-center text-gray-500 text-xs text-center p-2">[No Signal]</div>;
    };

    return (
        <div className="w-36 h-36 bg-black/50 pixel-border flex items-center justify-center">
            {content()}
        </div>
    );
};

export default GeneratedPortrait;