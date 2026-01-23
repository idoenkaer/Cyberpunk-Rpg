
// components/DialogueBox.tsx
import React from 'react';
import type { NPC, DialogueEntry } from '../types';
import GeneratedPortrait from './GeneratedPortrait';
import ConversationLog from './ConversationLog';

interface DialogueBoxProps {
    npc: NPC;
    conversationHistory: DialogueEntry[];
    actions: string[];
    onAction: (action: string) => void;
    isLoading: boolean;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({ npc, conversationHistory, actions, onAction, isLoading }) => {
    const portraitPrompt = `A pixel art portrait of a cyberpunk NPC named '${npc.name}', who is a ${npc.description}. Current emotion: ${npc.emotion || 'neutral'}. 16-bit, head and shoulders view, gritty, neon-lit background.`;
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-20 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-lg mx-auto md:max-w-4xl bg-black/80 pixel-border flex flex-col md:flex-row gap-4 p-4 md:p-6 h-[80vh] md:h-[600px]">
                <div className="flex-shrink-0 flex flex-col items-center justify-start">
                    <GeneratedPortrait 
                        prompt={portraitPrompt}
                        alt={`Portrait of ${npc.name}`}
                        cacheKey={`npc-portrait-${npc.name}-${npc.emotion || 'neutral'}`}
                    />
                    <div className="mt-3 text-center">
                         <h2 className="text-xl text-cyan-300 uppercase tracking-widest">{npc.name}</h2>
                         <p className="text-xs text-gray-400 italic max-w-[150px]">{npc.description}</p>
                    </div>
                </div>
                
                <div className="flex flex-col flex-grow overflow-hidden h-full">
                    {/* Conversation History Area */}
                    <div className="flex-grow p-2 mb-4 border-2 border-cyan-900/30 bg-black/40 custom-scrollbar overflow-y-auto relative">
                        <ConversationLog entries={conversationHistory} />
                    </div>

                    {/* Controls Area */}
                    <div className="flex-shrink-0">
                        <h3 className="text-sm text-cyan-500 mb-2 uppercase tracking-widest border-b border-cyan-900/50 pb-1">[ Response Protocols ]</h3>
                        <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto custom-scrollbar-thin pr-2">
                            {actions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => onAction(action)}
                                    disabled={isLoading}
                                    className="w-full text-left pixel-button text-sm py-2"
                                >
                                    {action}
                                </button>
                            ))}
                            {isLoading && (
                                <div className="text-center text-cyan-400 animate-pulse py-2 text-sm">
                                    [ Encrypting transmission... ]
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DialogueBox;
