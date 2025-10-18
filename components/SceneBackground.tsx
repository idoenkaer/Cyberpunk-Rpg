
import React, { useEffect, useRef } from 'react';

interface SceneBackgroundProps {
    imagePrompt: string;
}

const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash);
};

const mulberry32 = (a: number) => {
    return () => {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

const PALETTE = {
    sky: ['#0d1a2f', '#1a202c', '#2c3e50'],
    building: ['#1f2937', '#374151', '#4b5563'],
    light: ['#f000f0', '#00ffff', '#ff0000', '#ffff00', '#00ff00']
};

const SceneBackground: React.FC<SceneBackgroundProps> = ({ imagePrompt }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const seed = simpleHash(imagePrompt);
        const rand = mulberry32(seed);

        const { width, height } = canvas;
        
        // Background Gradient
        const skyColor = PALETTE.sky[Math.floor(rand() * PALETTE.sky.length)];
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, skyColor);
        gradient.addColorStop(1, '#111827');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Stars/Drones
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${rand() * 0.5})`;
            ctx.fillRect(rand() * width, rand() * height * 0.6, 1, 1);
        }

        // Buildings
        const buildingCount = 5 + Math.floor(rand() * 10);
        for (let i = 0; i < buildingCount; i++) {
            const buildingWidth = (0.1 + rand() * 0.3) * width;
            const buildingHeight = (0.3 + rand() * 0.6) * height;
            const x = rand() * width;
            const y = height - buildingHeight;
            
            const buildingColor = PALETTE.building[Math.floor(rand() * PALETTE.building.length)];
            ctx.fillStyle = buildingColor;
            ctx.fillRect(x, y, buildingWidth, buildingHeight);
            
            // Windows
            const windowCount = Math.floor(rand() * 50);
            for(let j = 0; j < windowCount; j++) {
                if (rand() > 0.3) continue;
                const lightColor = PALETTE.light[Math.floor(rand() * PALETTE.light.length)];
                ctx.fillStyle = lightColor;
                const winX = x + 4 + rand() * (buildingWidth - 8);
                const winY = y + 4 + rand() * (buildingHeight - 8);
                ctx.fillRect(winX, winY, 2, 2);
            }
        }
        
    }, [imagePrompt]);

    return (
        <canvas
            ref={canvasRef}
            width="400"
            height="400"
            className="absolute top-0 left-0 w-full h-full -z-10 opacity-20"
            aria-hidden="true"
        />
    );
};

export default SceneBackground;
