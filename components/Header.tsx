// components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="w-full p-4 border-b-4 border-cyan-900 text-center relative">
            <h1 className="text-3xl font-bold text-cyan-400 tracking-widest uppercase text-flicker">
                Deksamnu
            </h1>
            <p className="text-gray-400 text-sm">An AI-Powered Text Adventure</p>
        </header>
    );
};

export default Header;