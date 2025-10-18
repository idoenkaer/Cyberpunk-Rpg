// components/StoryControls.tsx
import React from 'react';

interface StoryControlsProps {
    actions: string[];
    onAction: (action: string) => void;
    isLoading: boolean;
}

const StoryControls: React.FC<StoryControlsProps> = ({ actions, onAction, isLoading }) => {
    return (
        <div className="p-4 border-t border-cyan-400/20">
            <h2 className="text-xl text-cyan-400 mb-3 uppercase tracking-widest">[ Actions ]</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={() => onAction(action)}
                        disabled={isLoading}
                        className="w-full text-lg bg-cyan-600/30 hover:bg-cyan-500/30 text-white font-bold py-2 px-4 border-b-2 border-cyan-800/50 hover:border-cyan-700/50 rounded transition-colors duration-200 disabled:bg-gray-700/50 disabled:cursor-not-allowed disabled:border-gray-600"
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
