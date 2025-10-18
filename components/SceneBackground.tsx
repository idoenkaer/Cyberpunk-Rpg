import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

interface SceneBackgroundProps {
    imagePrompt: string;
}

// Per instructions, API key is from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SceneBackground: React.FC<SceneBackgroundProps> = ({ imagePrompt }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const generateImage = async () => {
            if (!imagePrompt) return;

            setIsLoading(true);
            setError(null);
            // Don't set image to null here, to avoid flicker between images
            
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image', // Model for image generation
                    contents: {
                        parts: [{ text: imagePrompt }],
                    },
                    config: {
                        responseModalities: [Modality.IMAGE],
                    },
                });

                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64ImageBytes: string = part.inlineData.data;
                        const generatedUrl = `data:image/png;base64,${base64ImageBytes}`;
                        setImageUrl(generatedUrl);
                        break; // Assume one image
                    }
                }

            } catch (e) {
                console.error("Failed to generate scene background:", e);
                setError("Could not render scene. Connection to vision matrix failed.");
            } finally {
                setIsLoading(false);
            }
        };

        generateImage();
    }, [imagePrompt]);

    const content = () => {
        if (isLoading) {
            return <div className="text-cyan-400 animate-pulse">[Rendering Visuals...]</div>;
        }
        if (error) {
            return <div className="text-red-400 p-2 text-center">{error}</div>;
        }
        if (imageUrl) {
            return <img src={imageUrl} alt={imagePrompt} className="w-full h-full object-cover" />;
        }
        return <div className="text-gray-500">[No Visuals]</div>;
    };

    return (
        <div className="bg-black/30 border border-gray-700 w-full h-full flex items-center justify-center">
            {content()}
        </div>
    );
};

export default SceneBackground;
