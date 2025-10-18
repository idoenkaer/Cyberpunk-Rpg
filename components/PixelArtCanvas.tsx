// components/PixelArtCanvas.tsx
import React, { useRef, useEffect } from 'react';

interface PixelArtCanvasProps {
    seed: string;
}

// Simple hash function to create a seed from the player name
const simpleHash = (str: string): number => {
    let hash = 0;
    if (str.length === 0) return hash;
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
    skin: ['#e0ac69', '#c68642', '#f1c27d', '#9a6a42'],
    hair: ['#2c2121', '#4d3f3f', '#f5a623', '#9b59b6', '#3498db', '#e74c3c'],
    clothing: ['#34495e', '#2c3e50', '#7f8c8d', '#95a5a6'],
    accessory: ['#00f0ff', '#f1c40f', '#e74c3c', '#2ecc71'],
    outline: '#1a1a1a',
    background: 'rgba(0, 255, 255, 0.1)'
};

const PixelArtCanvas: React.FC<PixelArtCanvasProps> = ({ seed }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const size = 128;
    const resolution = 64;
    const scale = size / resolution;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.imageSmoothingEnabled = false;

        const hashSeed = simpleHash(seed);
        const rand = mulberry32(hashSeed);

        const skinColor = PALETTE.skin[Math.floor(rand() * PALETTE.skin.length)];
        const hairColor = PALETTE.hair[Math.floor(rand() * PALETTE.hair.length)];
        const clothingColor = PALETTE.clothing[Math.floor(rand() * PALETTE.clothing.length)];
        const hasCybernetics = rand() > 0.5;

        ctx.clearRect(0, 0, size, size);

        // Background
        ctx.fillStyle = PALETTE.background;
        ctx.fillRect(0, 0, size, size);

        // Body & Head
        ctx.fillStyle = clothingColor;
        ctx.fillRect(8 * scale, 28 * scale, 48 * scale, 36 * scale); // Torso

        ctx.fillStyle = skinColor;
        ctx.fillRect(16 * scale, 12 * scale, 32 * scale, 32 * scale); // Head
        
        // Hair
        ctx.fillStyle = hairColor;
        const hairStyle = rand();
        if (hairStyle < 0.3) { // Long
            ctx.fillRect(14 * scale, 8 * scale, 36 * scale, 20 * scale); 
        } else if (hairStyle < 0.7) { // Short
            ctx.fillRect(16 * scale, 6 * scale, 32 * scale, 10 * scale);
        } // else bald

        // Eyes (Simple visor)
        ctx.fillStyle = PALETTE.accessory[Math.floor(rand() * PALETTE.accessory.length)];
        ctx.fillRect(18 * scale, 22 * scale, 28 * scale, 6 * scale); 
        ctx.fillStyle = PALETTE.outline;
        ctx.fillRect(18 * scale, 22 * scale, 28 * scale, 1 * scale);
        ctx.fillRect(18 * scale, 27 * scale, 28 * scale, 1 * scale);


        if (hasCybernetics) {
            ctx.fillStyle = PALETTE.accessory[Math.floor(rand() * PALETTE.accessory.length)];
            const cyberneticType = rand();
            if (cyberneticType < 0.5) {
                // Cyber-arm
                ctx.fillRect(4 * scale, 28 * scale, 12 * scale, 24 * scale);
            } else {
                // Faceplate
                ctx.fillRect(16 * scale, 28 * scale, 8 * scale, 12 * scale);
            }
        }

    }, [seed, scale]);


    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{ imageRendering: 'pixelated', width: '128px', height: '128px' }}
            aria-label={`Pixel art portrait of player character: ${seed}`}
        />
    );
};

export default PixelArtCanvas;
