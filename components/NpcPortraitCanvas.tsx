
import React, { useRef, useEffect } from 'react';
// Fix: Corrected module import path for types.
import type { Emotion } from '../types';

interface NpcPortraitCanvasProps {
    npcName: string;
    emotion?: Emotion;
}

// Simple hash function to create a seed from the NPC name
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
    skin: ['#d1a388', '#a17e69', '#e6bca6', '#c78d81'],
    hair: ['#2c2121', '#4d3f3f', '#6d2121', '#b0b0b0', '#f5a623'],
    clothing: ['#1e4852', '#4a4a4a', '#3d4a5e', '#3b5998', '#6d2121'],
    accessory: ['#95a5a6', '#00f0ff', '#c0392b', '#b0b0b0'],
    outline: '#1a1a1a',
    background: 'rgba(0, 255, 255, 0.1)'
};

const NpcPortraitCanvas: React.FC<NpcPortraitCanvasProps> = ({ npcName, emotion = 'neutral' }) => {
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

        const seed = simpleHash(npcName);
        const rand = mulberry32(seed);

        const skinColor = PALETTE.skin[Math.floor(rand() * PALETTE.skin.length)];
        const hairColor = PALETTE.hair[Math.floor(rand() * PALETTE.hair.length)];
        const clothingColor = PALETTE.clothing[Math.floor(rand() * PALETTE.clothing.length)];
        const hasCybernetics = rand() > 0.6;

        ctx.clearRect(0, 0, size, size);

        // Background
        ctx.fillStyle = PALETTE.background;
        ctx.fillRect(0, 0, size, size);

        // Body & Head
        ctx.fillStyle = clothingColor;
        ctx.fillRect(8 * scale, 28 * scale, 48 * scale, 36 * scale);

        ctx.fillStyle = skinColor;
        ctx.fillRect(16 * scale, 12 * scale, 32 * scale, 32 * scale); // Face shape
        
        // Hair
        ctx.fillStyle = hairColor;
        const hairStyle = rand();
        if (hairStyle < 0.3) {
            ctx.fillRect(14 * scale, 8 * scale, 36 * scale, 12 * scale); // Long hair
        } else if (hairStyle < 0.7) {
            ctx.fillRect(16 * scale, 6 * scale, 32 * scale, 8 * scale); // Short hair
        } else {
            // Bald or very short
        }

        // Emotion
        ctx.fillStyle = PALETTE.outline;
        const eyeY = 22 * scale;
        const eyebrowY = 18 * scale;
        switch(emotion) {
            case 'happy':
                 ctx.fillRect(22 * scale, eyebrowY, 8 * scale, 2 * scale); // Normal brow
                 ctx.fillRect(34 * scale, eyebrowY, 8 * scale, 2 * scale);
                 ctx.fillRect(24 * scale, 35 * scale, 16 * scale, 4 * scale); // Smile
                break;
            case 'angry':
                ctx.fillRect(22 * scale, eyebrowY - 1, 8 * scale, 4 * scale); // Angled brow
                ctx.fillRect(34 * scale, eyebrowY - 1, 8 * scale, 4 * scale);
                ctx.fillRect(22 * scale, 35 * scale, 20 * scale, 2 * scale); // Frown
                break;
            case 'sad':
                 ctx.fillRect(22 * scale, eyebrowY + 2, 8 * scale, 2 * scale); // Sad brow
                 ctx.fillRect(34 * scale, eyebrowY + 2, 8 * scale, 2 * scale);
                 ctx.fillRect(24 * scale, 38 * scale, 16 * scale, 2 * scale); // Sad mouth
                break;
            case 'scared':
                 ctx.fillRect(22 * scale, eyebrowY - 2, 8 * scale, 2 * scale); // Raised brow
                 ctx.fillRect(34 * scale, eyebrowY - 2, 8 * scale, 2 * scale);
                 ctx.fillRect(26 * scale, 34 * scale, 12 * scale, 6 * scale); // Open mouth
                 break;
            default: // neutral
                 ctx.fillRect(22 * scale, eyebrowY, 8 * scale, 2 * scale);
                 ctx.fillRect(34 * scale, eyebrowY, 8 * scale, 2 * scale);
                 ctx.fillRect(28 * scale, 35 * scale, 8 * scale, 2 * scale); // Neutral mouth
                break;
        }

        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(22 * scale, eyeY, 8 * scale, 6 * scale);
        ctx.fillRect(34 * scale, eyeY, 8 * scale, 6 * scale);
        ctx.fillStyle = PALETTE.outline;
        ctx.fillRect(25 * scale, eyeY + 2, 2 * scale, 2 * scale); // Pupil
        ctx.fillRect(37 * scale, eyeY + 2, 2 * scale, 2 * scale);

        if (hasCybernetics) {
            ctx.fillStyle = PALETTE.accessory[Math.floor(rand() * PALETTE.accessory.length)];
            const cyberneticType = rand();
            if (cyberneticType < 0.5) {
                ctx.fillRect(16 * scale, 20 * scale, 12 * scale, 8 * scale); // Cyber-eye
            } else {
                ctx.fillRect(34 * scale, 28 * scale, 8 * scale, 12 * scale); // Jaw implant
            }
        }

    }, [npcName, emotion, scale]);


    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{ imageRendering: 'pixelated', width: '128px', height: '128px' }}
            aria-label={`Pixel art portrait of an NPC: ${npcName}`}
        />
    );
};

export default NpcPortraitCanvas;