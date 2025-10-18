// components/StoryDisplay.tsx
import React from 'react';
import type { StorySegment } from '../types';
import DialogueBox from './DialogueBox';
import NpcPortraitCanvas from './NpcPortraitCanvas';
import ProceduralMap from './ProceduralMap';

interface StoryDisplayProps {
    segment: StorySegment | null;
    isLoading: boolean;
    error: string | null;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ segment, isLoading, error }) => {
    if (isLoading && !segment) {
        return (
            <div className="w-full lg:w-3/4 p-4 flex flex-col items-center justify-center text-center h-96">
                 <div className="loader"></div>
                 <p className="mt-4 text-cyan-400 animate-pulse">Connecting to the AI storyteller...</p>
                 <style jsx>{`
                    .loader {
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #00ffff;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                 `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full lg:w-3/4 p-4 text-center text-red-500 bg-black/30 border border-red-500/50">
                <h2 className="text-2xl font-bold mb-2">[SYSTEM ERROR]</h2>
                <p>{error}</p>
            </div>
        );
    }
    
    if (!segment) {
        return (
            <div className="w-full lg:w-3/4 p-4 text-center text-gray-400 h-96 flex items-center justify-center">
                <p>Select your archetype and faction to begin your story.</p>
            </div>
        );
    }

    return (
        <div className="w-full lg:w-3/4 p-4 space-y-4">
            <div className="bg-black/30 p-4 border border-gray-700">
                <p className="whitespace-pre-wrap text-lg text-gray-300 leading-relaxed">{segment.text}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {segment.npc && (
                    <div className="md:col-span-2">
                        <DialogueBox dialogue={segment.npc.dialogue} />
                    </div>
                )}
                 {segment.npc && (
                    <div className="flex flex-col items-center justify-center bg-black/30 p-2 border border-gray-700">
                        <NpcPortraitCanvas description={segment.npc.description} />
                         <p className="text-sm text-center text-gray-400 mt-2">{segment.npc.name}</p>
                         <p className="text-xs text-center text-gray-500 italic">"{segment.npc.description}"</p>
                    </div>
                )}
            </div>

             {segment.location && (
                <div className="bg-black/30 p-4 border border-gray-700">
                    <h3 className="text-xl text-amber-400 mb-2">Location: {segment.location.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <p className="md:col-span-2 text-gray-400 italic">{segment.location.description}</p>
                        <ProceduralMap locationName={segment.location.name} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryDisplay;
