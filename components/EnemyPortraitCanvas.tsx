import React, { useRef, useEffect } from 'react';
// Fix: Corrected module import path for types.
import type { Emotion } from '../types';

interface EnemyPortraitCanvasProps {
    enemyName: string;
    emotion?: Emotion;
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
    skin: ['#b39c8e', '#d1a388'],
    hair: ['#d90000', '#f5a623', '#4a90e2'],
    body: ['#6b7280', '#4a4a4a', '#374151', '#2c3645'],
    glow: ['#ff0000', '#f000f0', '#00ffff', '#ffff00'],
    armor: ['#95a5a6', '#7f8c8d', '#a0a0b0', '#808090', '#333333'],
    weapon: ['#c0392b', '#bdc3c7', '#3d4a5e'],
    outline: '#1a1a1a',
};

const EnemyPortraitCanvas: React.FC<EnemyPortraitCanvasProps> = ({ enemyName, emotion = 'neutral' }) => {
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

        const seed = simpleHash(enemyName);
        const rand = mulberry32(seed);

        const bodyColor = PALETTE.body[Math.floor(rand() * PALETTE.body.length)];
        const glowColor = PALETTE.glow[Math.floor(rand() * PALETTE.glow.length)];
        const armorColor = PALETTE.armor[Math.floor(rand() * PALETTE.armor.length)];
        const enemyType = rand(); // 0-0.33: Drone, 0.33-0.66: Corp Guard, 0.66-1: Ganger

        ctx.clearRect(0, 0, size, size);

        // Background
        ctx.fillStyle = `rgba(255, 0, 0, ${0.05 + rand() * 0.1})`;
        ctx.fillRect(0, 0, size, size);

        if (enemyType < 0.33) { // Drone
            ctx.fillStyle = bodyColor;
            ctx.fillRect(16 * scale, 20 * scale, 32 * scale, 24 * scale);
            ctx.fillStyle = armorColor;
            ctx.fillRect(12 * scale, 24 * scale, 40 * scale, 4 * scale);
            ctx.fillStyle = glowColor;
            ctx.fillRect(28 * scale, 28 * scale, 8 * scale, 8 * scale);
            ctx.fillStyle = PALETTE.weapon[Math.floor(rand() * PALETTE.weapon.length)];
            ctx.fillRect(20 * scale, 44 * scale, 8 * scale, 12 * scale);
            ctx.fillRect(36 * scale, 44 * scale, 8 * scale, 12 * scale);
        } else { // Humanoid
            const skinColor = PALETTE.skin[Math.floor(rand() * PALETTE.skin.length)];
            
            // Body & Head
            ctx.fillStyle = skinColor;
            ctx.fillRect(16 * scale, 12 * scale, 32 * scale, 32 * scale);
            ctx.fillStyle = bodyColor;
            ctx.fillRect(8 * scale, 28 * scale, 48 * scale, 36 * scale);

            // Emotion
            ctx.fillStyle = PALETTE.outline;
            const eyebrowY = 18 * scale;
            if (emotion === 'angry') {
                ctx.fillRect(22 * scale, eyebrowY - 1, 8 * scale, 4 * scale);
                ctx.fillRect(34 * scale, eyebrowY - 1, 8 * scale, 4 * scale);
            } else {
                 ctx.fillRect(22 * scale, eyebrowY, 8 * scale, 2 * scale);
                 ctx.fillRect(34 * scale, eyebrowY, 8 * scale, 2 * scale);
            }

            const mouthY = 35 * scale;
             switch(emotion) {
                case 'happy': ctx.fillRect(24 * scale, mouthY, 16 * scale, 4 * scale); break; // Grin
                case 'angry': ctx.fillRect(22 * scale, mouthY, 20 * scale, 2 * scale); break; // Grimace
                default: ctx.fillRect(28 * scale, mouthY, 8 * scale, 2 * scale); break;
            }

            // Eyes
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(22 * scale, 20 * scale, 8 * scale, 6 * scale);
            ctx.fillRect(34 * scale, 20 * scale, 8 * scale, 6 * scale);
            ctx.fillStyle = glowColor;
            ctx.fillRect(25 * scale, 22 * scale, 2 * scale, 2 * scale);
            ctx.fillRect(37 * scale, 22 * scale, 2 * scale, 2 * scale);

            if (enemyType < 0.66) { // Corporate Guard
                 ctx.fillStyle = armorColor;
                 ctx.fillRect(12 * scale, 6 * scale, 40 * scale, 12 * scale); // Helmet
                 ctx.fillRect(8 * scale, 28 * scale, 48 * scale, 8 * scale); // Chest Plate
                 ctx.fillStyle = glowColor;
                 ctx.fillRect(16 * scale, 10 * scale, 32 * scale, 6 * scale); // Visor
            } else { // Street Ganger
                ctx.fillStyle = PALETTE.hair[Math.floor(rand() * PALETTE.hair.length)];
                ctx.fillRect(24 * scale, 2 * scale, 16 * scale, 14 * scale); // Mohawk
                ctx.fillStyle = armorColor;
                ctx.fillRect(16 * scale, 30 * scale, 10 * scale, 10 * scale); // Cyber-jaw
            }
        }

    }, [enemyName, emotion, scale]);


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