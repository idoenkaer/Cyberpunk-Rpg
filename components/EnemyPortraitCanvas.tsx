
import React, { useRef, useEffect } from 'react';

interface EnemyPortraitCanvasProps {
    enemyName: string;
}

// Simple hash function to create a seed from the enemy name
const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

// Mulberry32 PRNG
const mulberry32 = (a: number) => {
    return () => {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

const PALETTE = {
    body: ['#6b7280', '#4a4a4a', '#374151', '#2c3645'],
    glow: ['#ff0000', '#f000f0', '#00ffff', '#ffff00'],
    armor: ['#95a5a6', '#7f8c8d', '#a0a0b0', '#808090'],
    weapon: ['#c0392b', '#bdc3c7', '#3d4a5e']
};

const EnemyPortraitCanvas: React.FC<EnemyPortraitCanvasProps> = ({ enemyName }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const size = 128;
    const resolution = 32;
    const scale = size / resolution;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.imageSmoothingEnabled = false;

        const seed = simpleHash(enemyName);
        const rand = mulberry32(seed);

        const bodyColor = PALETTE.body[Math.floor(rand() * PALETTE.body.length)];
        const glowColor = PALETTE.glow[Math.floor(rand() * PALETTE.glow.length)];
        const armorColor = PALETTE.armor[Math.floor(rand() * PALETTE.armor.length)];
        const isDrone = rand() > 0.5;

        ctx.clearRect(0, 0, size, size);

        // Background
        ctx.fillStyle = `rgba(255, 0, 0, ${0.05 + rand() * 0.1})`;
        ctx.fillRect(0, 0, size, size);

        if (isDrone) {
            // Floating drone body
            ctx.fillStyle = bodyColor;
            ctx.fillRect(8 * scale, 10 * scale, 16 * scale, 12 * scale);
            
            // Armor plating
            ctx.fillStyle = armorColor;
            ctx.fillRect(6 * scale, 12 * scale, 20 * scale, 2 * scale);
            ctx.fillRect(10 * scale, 8 * scale, 12 * scale, 2 * scale);

            // Optical sensor (glow)
            ctx.fillStyle = glowColor;
            ctx.fillRect(14 * scale, 14 * scale, 4 * scale, 4 * scale);

            // Weapon mount
            ctx.fillStyle = PALETTE.weapon[Math.floor(rand() * PALETTE.weapon.length)];
            ctx.fillRect(10 * scale, 22 * scale, 4 * scale, 6 * scale);
            ctx.fillRect(18 * scale, 22 * scale, 4 * scale, 6 * scale);

        } else {
            // Humanoid enemy
            // Body
            ctx.fillStyle = bodyColor;
            ctx.fillRect(10 * scale, 18 * scale, 12 * scale, 14 * scale);
            
            // Head
            ctx.fillRect(12 * scale, 8 * scale, 8 * scale, 10 * scale);
            
            // Armor
            ctx.fillStyle = armorColor;
            ctx.fillRect(8 * scale, 18 * scale, 16 * scale, 4 * scale); // Chest plate
            
            // Glowing visor
            ctx.fillStyle = glowColor;
            ctx.fillRect(12 * scale, 10 * scale, 8 * scale, 4 * scale);
        }

    }, [enemyName, scale]);


    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{ imageRendering: 'pixelated', width: '128px', height: '128px' }}
            aria-label={`Pixel art portrait of an enemy: ${enemyName}`}
        />
    );
};

export default EnemyPortraitCanvas;
