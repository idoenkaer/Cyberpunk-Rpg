// components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="w-full p-4 border-b border-cyan-400/20 text-center">
            <h1 className="text-3xl font-bold text-cyan-400 tracking-widest uppercase" style={{ textShadow: '0 0 5px #00ffff' }}>
                Cyber-Saga Chronicles
            </h1>
            <p className="text-gray-400 text-sm">An AI-Powered Text Adventure</p>
        </header>
    );
};

export default Header;
