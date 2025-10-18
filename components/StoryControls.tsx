
import React from 'react';

interface StoryControlsProps {
    choices: string[];
    onChoice: (choice: string) => void;
    isLoading: boolean;
    isEnd: boolean;
    onRestart: () => void;
    error: string | null;
}

const StoryControls: React.FC<StoryControlsProps> = ({ choices, onChoice, isLoading, isEnd, onRestart, error }) => {
    return (
        <div className="bg-black/30 p-4 border border-gray-700">
            {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-300">
                    <p className="font-bold">SYSTEM ERROR:</p>
                    <p>{error}</p>
                </div>
            )}

            {isEnd ? (
                <div className="text-center">
                    <p className="text-xl text-cyan-400 mb-4">-- END OF TRANSMISSION --</p>
                    <button
                        onClick={onRestart}
                        className="w-full text-lg bg-cyan-600/50 hover:bg-cyan-500/50 text-white font-bold py-2 px-4 border-b-4 border-cyan-800/50 hover:border-cyan-700/50 rounded transition-colors duration-200"
                    >
                        [ RESTART ]
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {choices.map((choice, index) => (
                        <button
                            key={index}
                            onClick={() => onChoice(choice)}
                            disabled={isLoading}
                            className="w-full text-left text-lg text-cyan-400 hover:text-cyan-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-200 group"
                        >
                            <span className="group-hover:text-white transition-colors duration-200">&gt; </span>{choice}
                        </button>
                    ))}
                </div>
            )}

            {isLoading && (
                 <div className="mt-4 text-center text-fuchsia-400 animate-pulse">
                     [CONNECTING TO THE GRID...]
                 </div>
            )}
        </div>
    );
};

export default StoryControls;
