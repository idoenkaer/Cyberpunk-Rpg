
import React, { useEffect, useRef, useState } from 'react';

interface StoryDisplayProps {
    history: string[];
    isLoading: boolean;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ history, isLoading }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const endOfHistoryRef = useRef<HTMLDivElement>(null);
    const [overscroll, setOverscroll] = useState(0);
    const overscrollTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);
    
    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (overscrollTimeoutRef.current) {
                clearTimeout(overscrollTimeoutRef.current);
            }
        };
    }, []);

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // If at the top and scrolling up
        if (container.scrollTop === 0 && e.deltaY < 0) {
            e.preventDefault();
            
            // Apply some resistance to the scroll
            const newOverscroll = Math.min(overscroll + Math.abs(e.deltaY) * 0.2, 50);
            setOverscroll(newOverscroll);

            if (overscrollTimeoutRef.current) {
                clearTimeout(overscrollTimeoutRef.current);
            }
            
            overscrollTimeoutRef.current = window.setTimeout(() => {
                setOverscroll(0);
            }, 300);
        }
    };

    return (
        <div 
            ref={scrollContainerRef}
            onWheel={handleWheel}
            className="h-full overflow-y-auto pr-4 custom-scrollbar"
        >
            <div
                style={{ transform: `translateY(${overscroll}px)` }}
                className="transition-transform duration-300 ease-out pt-16" // Added top padding
            >
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
        </div>
    );
};

export default StoryDisplay;
