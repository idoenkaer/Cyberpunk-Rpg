import React, { useEffect, useRef } from 'react';

interface NpcPortraitCanvasProps {
    description: string;
}

// Simple seeded pseudo-random number generator
const mulberry32 = (a: number) => {
    return () => {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

const PALETTE = {
    skin: ['#d1a388', '#a17e69', '#f0c0a0', '#8a6e5a'],
    hair: ['#2c2121', '#593a3a', '#e0d6c5', '#888', '#e60000'],
    cybernetics: ['#95a5a6', '#7f8c8d', '#ff0000', '#00f0ff', '#f0ff00'],
    clothing: ['#4a4a4a', '#1e4852', '#3d4a5e', '#a0a0b0', '#6b6b6b'],
    background: ['#1a202c', '#2d3748', '#1e2837'],
    outline: '#1a1a1a',
};

// Hashing function to create a seed number from a string
const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};


const NpcPortraitCanvas: React.FC<NpcPortraitCanvasProps> = ({ description }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasSize = 128;
    const spriteResolution = 16;
    const scale = canvasSize / spriteResolution;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const seedNum = simpleHash(description);
        const rand = mulberry32(seedNum);
        const descLower = description.toLowerCase();

        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvasSize, canvasSize);

        const drawPixel = (x: number, y: number, color: string) => {
            ctx.fillStyle = color;
            ctx.fillRect(x * scale, y * scale, scale, scale);
        };
        
        const drawSymmetricPixel = (x: number, y: number, color: string) => {
             drawPixel(x, y, color);
             drawPixel(spriteResolution - 1 - x, y, color);
        }

        // Background
        const bgColor = PALETTE.background[Math.floor(rand() * PALETTE.background.length)];
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        
        // Clothing
        const clothingColor = PALETTE.clothing[Math.floor(rand() * PALETTE.clothing.length)];
        for(let y = 10; y < spriteResolution; y++){
            for(let x = 2; x < spriteResolution - 2; x++){
                if(rand() > 0.3) drawPixel(x, y, clothingColor);
            }
        }
        drawSymmetricPixel(4, 10, clothingColor);
        drawSymmetricPixel(5, 11, clothingColor);
        drawSymmetricPixel(6, 12, clothingColor);
        
        
        // Head Shape
        const skinColor = PALETTE.skin[Math.floor(rand() * PALETTE.skin.length)];
        const skinShadow = PALETTE.skin[1];
        for(let y = 3; y < 11; y++) {
             for(let x = 4; x < spriteResolution-4; x++){
                 if(y > 8 && (x < 5 || x > 10)) continue; // Jawline
                 drawPixel(x, y, skinColor);
             }
        }
        for(let x=5; x < spriteResolution - 5; x++) drawPixel(x, 10, skinShadow);

        // Hair
        const hairColor = PALETTE.hair[Math.floor(rand() * PALETTE.hair.length)];
        let hairStyle = rand();
        if(descLower.includes('long hair')) hairStyle = 0.8;
        if(descLower.includes('short hair') || descLower.includes('buzz cut')) hairStyle = 0.1;

        if (descLower.includes('mohawk')) {
            for(let y = 0; y < 4; y++) for(let x = 7; x < 9; x++) drawPixel(x, y, PALETTE.hair[4]);
        } else if (hairStyle < 0.3) { // Short
             for(let y = 1; y < 4; y++) for(let x = 4; x < 12; x++) if(rand() > 0.2) drawPixel(x, y, hairColor);
        } else if (hairStyle < 0.7) { // Medium
             for(let y = 1; y < 5; y++) for(let x = 3; x < 13; x++) if(rand() > 0.3) drawPixel(x, y, hairColor);
        } else { // Long
            for(let y = 1; y < 8; y++) for(let x = 2; x < 14; x++) if(rand() > 0.4 && (x<4 || x>11)) drawPixel(x, y, hairColor);
            for(let y = 1; y < 4; y++) for(let x = 4; x < 12; x++) drawPixel(x, y, hairColor);
        }

        // Eyes
        drawSymmetricPixel(5, 6, PALETTE.outline);
         if (descLower.includes('sunglasses') || descLower.includes('visor')) {
            const visorColor = PALETTE.cybernetics[3];
            for(let x = 4; x < 12; x++) drawPixel(x, 6, visorColor);
        }
        
        // Cybernetics
        let hasCybernetics = rand() > 0.5;
        if (descLower.match(/cyber|chrome|implant|prosthetic|jaw/)) hasCybernetics = true;
        
        if(hasCybernetics) {
             const cyberColor = PALETTE.cybernetics[Math.floor(rand() * PALETTE.cybernetics.length)];
             const side = rand() > 0.5 ? 'left' : 'right';
             for(let y = 5; y < 9; y++) {
                 for(let x=1; x < 4; x++){
                     if(rand() > 0.4) {
                         drawPixel(side === 'left' ? x : spriteResolution - 1 - x, y, cyberColor);
                     }
                 }
             }
            drawPixel(side === 'left' ? 5 : spriteResolution - 1 - 5, 6, PALETTE.cybernetics[2 + Math.floor(rand()*3)]);
        }

    }, [description]);

    return (
        <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            style={{ imageRendering: 'pixelated', width: '128px', height: '128px' }}
            aria-label={`Procedurally generated portrait based on description: ${description}`}
        />
    );
};

export default NpcPortraitCanvas;
