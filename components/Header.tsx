// components/Header.tsx
import React from 'react';

interface HeaderProps {
    isMuted: boolean;
    onToggleMute: () => void;
}

const Header: React.FC<HeaderProps> = ({ isMuted, onToggleMute }) => {
    return (
        <header className="w-full p-4 border-b border-cyan-400/20 text-center relative">
            <h1 className="text-3xl font-bold text-cyan-400 tracking-widest uppercase text-flicker">
                Cyber-Saga Chronicles
            </h1>
            <p className="text-gray-400 text-sm">An AI-Powered Text Adventure</p>
            <button
                onClick={onToggleMute}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMuted ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l-4-4m0 4l4-4" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    )}
                </svg>
            </button>
        </header>
    );
};

export default Header;