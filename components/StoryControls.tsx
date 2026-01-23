// components/StoryControls.tsx
import React from 'react';

interface StoryControlsProps {
    actions: string[];
    onAction: (action: string) => void;
    isLoading: boolean;
}

const StoryControls: React.FC<StoryControlsProps> = ({ actions, onAction, isLoading }) => {
    return (
        <div className="p-4 border-t-4 border-cyan-900">
            <h2 className="text-xl text-cyan-400 mb-3 uppercase tracking-widest">[ Actions ]</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={() => onAction(action)}
                        disabled={isLoading}
                        className="w-full pixel-button text-center"
                    >
                        {action}
                    </button>
                ))}
                {isLoading && (
                     <div className="md:col-span-2 text-center text-cyan-400 animate-pulse py-2">
                         [ Processing... ]
                     </div>
                )}
            </div>
        </div>
    );
};

export default StoryControls;