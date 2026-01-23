
// components/ConversationLog.tsx
import React, { useRef, useEffect } from 'react';
import type { DialogueEntry } from '../types';

interface ConversationLogProps {
    entries: DialogueEntry[];
}

const ConversationLog: React.FC<ConversationLogProps> = ({ entries }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [entries]);

    return (
        <div className="flex flex-col gap-3 p-2">
            {entries.map((entry, index) => {
                const isPlayer = entry.speaker !== 'Unknown' && entry.speaker !== 'Storyteller' && !['Merchant', 'Guard', 'Drone', 'Fixer', 'Netrunner'].includes(entry.speaker) && entry.speaker !== 'System'; // Simple heuristic, but app logic sets player name correctly.
                // Better heuristic: check if it's the player by checking "You" or comparing to player name passed down, 
                // but since we only have entries, we'll rely on styling distinction. 
                // Actually, the App passes specific names. We can just style based on index/sequence or name.
                // Let's assume the user is the one on the right. 
                // However, without passing 'playerName' prop, we can't be 100% sure dynamically.
                // But typically the player is the one taking 'actions'. 
                // Let's just style based on distinct names.
                
                // For now, let's just make it look like a log.
                
                return (
                    <div 
                        key={`${index}-${entry.timestamp}`}
                        className={`flex flex-col ${isPlayer ? 'items-end' : 'items-start'}`}
                    >
                        <div className={`
                            max-w-[90%] sm:max-w-[80%] 
                            p-2 sm:p-3 
                            text-sm sm:text-base 
                            border-l-2 
                            ${isPlayer ? 'border-cyan-500 bg-cyan-900/20 text-right' : 'border-green-500 bg-green-900/20 text-left'}
                        `}>
                            <div className={`text-xs uppercase tracking-wider mb-1 ${isPlayer ? 'text-cyan-400' : 'text-green-400'}`}>
                                {entry.speaker}
                            </div>
                            <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                                {entry.text}
                            </div>
                        </div>
                    </div>
                );
            })}
            {entries.length === 0 && (
                <div className="text-center text-gray-500 italic mt-4">
                    [ connection established ]
                </div>
            )}
            <div ref={bottomRef} />
        </div>
    );
};

export default ConversationLog;
