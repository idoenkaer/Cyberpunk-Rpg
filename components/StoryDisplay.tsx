
import React, { useEffect, useRef } from 'react';

interface StoryDisplayProps {
    history: string[];
    isLoading: boolean;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ history, isLoading }) => {
    const endOfHistoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    return (
        <div className="h-[400px] lg:h-full overflow-y-auto pr-2 custom-scrollbar">
            {history.map((text, index) => {
                const isPlayerChoice = text.startsWith('>');
                return (
                    <p 
                        key={index}
                        className={`whitespace-pre-wrap mb-4 ${isPlayerChoice ? 'text-fuchsia-400 italic' : 'text-gray-300'}`}
                    >
                        {text}
                    </p>
                );
            })}
             <div ref={endOfHistoryRef} />
        </div>
    );
};

export default StoryDisplay;
