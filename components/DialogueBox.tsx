
import React, { useState, useEffect } from 'react';
import type { DialogueTree } from '../types';

interface DialogueBoxProps {
    dialogue: DialogueTree;
    onTalkStart: () => void;
    onTalkEnd: () => void;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({ dialogue, onTalkStart, onTalkEnd }) => {
    // FIX: Moved guard clause to the top to prevent crash on invalid props.
    if (!dialogue || !dialogue.openingLine) {
        return null;
    }

    const [currentResponse, setCurrentResponse] = useState<string | null>(null);
    const [typedText, setTypedText] = useState('');

    const textToDisplay = currentResponse || dialogue.openingLine;

    // Reset the dialogue state when a new NPC is loaded
    useEffect(() => {
        setCurrentResponse(null);
    }, [dialogue]);
    
    // Typewriter effect
    useEffect(() => {
        if (textToDisplay) {
            onTalkStart();
            setTypedText('');
            let i = 0;
            const interval = setInterval(() => {
                setTypedText(prev => textToDisplay.slice(0, prev.length + 1));
                i++;
                if (i >= textToDisplay.length) {
                    clearInterval(interval);
                    onTalkEnd();
                }
            }, 30); // 30ms per character
            return () => {
                clearInterval(interval);
                onTalkEnd(); // Ensure it ends if component unmounts
            };
        }
    }, [textToDisplay, onTalkStart, onTalkEnd]);

    const handleChoice = (response: string) => {
        setCurrentResponse(response);
    };
    
    const handleReset = () => {
        setCurrentResponse(null);
    }

    return (
        <div className="bg-black/30 p-4 border border-gray-700 h-full flex flex-col justify-between">
            <p className="whitespace-pre-wrap text-lg text-gray-300 mb-4 min-h-[100px]">
                <span className="text-cyan-400 font-bold">"</span>
                {typedText}
                <span className="text-cyan-400 font-bold">"</span>
            </p>
            <div className="border-t border-gray-700 pt-4">
                {currentResponse ? (
                     <button 
                        onClick={handleReset}
                        className="w-full text-left text-lg text-fuchsia-400 hover:text-fuchsia-300 transition-colors duration-200"
                    >
                        &gt; [Back to choices]
                    </button>
                ) : (
                    <div className="space-y-2">
                        {dialogue.choices.map((choice, index) => (
                            <button 
                                key={index}
                                onClick={() => handleChoice(choice.response)}
                                className="w-full text-left text-lg text-fuchsia-400 hover:text-fuchsia-300 transition-colors duration-200"
                            >
                                &gt; {choice.text}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DialogueBox;