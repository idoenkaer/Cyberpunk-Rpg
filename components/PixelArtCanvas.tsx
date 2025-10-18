import React, { useRef, useEffect } from 'react';
// Fix: Corrected module import path for types.
import type { Archetype, Faction } from '../types';

interface PixelArtCanvasProps {
    archetype: Archetype;
    faction: Faction;
}

// Simple hash function to create a seed from a string
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

// Define palettes based on archetype and faction
const ARCHETYPE_PALETTES: Record<Archetype, { hair: string[], clothing: string[], accessory: string[] }> = {
    'Runner': { hair: ['#f5a623', '#b0b0b0'], clothing: ['#4a4a4a', '#6d2121'], accessory: ['#95a5a6'] },
    'Netrunner': { hair: ['#00f0ff', '#f5a623'], clothing: ['#1e4852', '#3d4a5e'], accessory: ['#00f0ff'] },
    'Street Samurai': { hair: ['#2c2121', '#b0b0b0'], clothing: ['#6d2121', '#4a4a4a'], accessory: ['#c0392b'] },
    'Corporate Drone': { hair: ['#4d3f3f', '#2c2121'], clothing: ['#3d4a5e', '#3b5998'], accessory: ['#b0b0b0'] },
    'Techie': { hair: ['#6d2121', '#f5a623'], clothing: ['#1e4852', '#4a4a4a'], accessory: ['#95a5a6'] },
    'Fixer': { hair: ['#4d3f3f', '#b0b0b0'], clothing: ['#3b5998', '#6d2121'], accessory: ['#f5a623'] }
};

const FACTION_COLORS: Record<Faction, string> = {
    'Corporate Enforcers': '#3b5998',
    'Hacker Collective': '#00f0ff',
    'Street Ronin': '#c0392b',
    'Police': '#4a90e2'
};

const PALETTE = {
    skin: ['#d1a388', '#a17e69', '#e6bca6'],
    outline: '#1a1a1a',
};


const PixelArtCanvas: React.FC<PixelArtCanvasProps> = ({ archetype, faction }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const size = 256; // a bit larger for the main character
    const resolution = 64;
    const scale = size / resolution;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.imageSmoothingEnabled = false;

        const seed = simpleHash(archetype + faction);
        const rand = mulberry32(seed);

        const archetypePalette = ARCHETYPE_PALETTES[archetype];
        const skinColor = PALETTE.skin[Math.floor(rand() * PALETTE.skin.length)];
        const hairColor = archetypePalette.hair[Math.floor(rand() * archetypePalette.hair.length)];
        const clothingColor = archetypePalette.clothing[Math.floor(rand() * archetypePalette.clothing.length)];
        const accessoryColor = archetypePalette.accessory[Math.floor(rand() * archetypePalette.accessory.length)];
        const factionColor = FACTION_COLORS[faction];

        ctx.clearRect(0, 0, size, size);

        // Background with faction color hint
        ctx.fillStyle = factionColor + '20'; // transparent faction color
        ctx.fillRect(0, 0, size, size);

        // Body
        ctx.fillStyle = clothingColor;
        ctx.fillRect(16 * scale, 32 * scale, 32 * scale, 32 * scale); // Torso

        // Faction Symbol on chest
        ctx.fillStyle = factionColor;
        ctx.fillRect(28 * scale, 40 * scale, 8 * scale, 8 * scale);

        // Head
        ctx.fillStyle = skinColor;
        ctx.fillRect(20 * scale, 12 * scale, 24 * scale, 24 * scale);

        // Hair based on archetype
        ctx.fillStyle = hairColor;
        const hairStyle = rand();
        if (archetype === 'Street Samurai') {
            ctx.fillRect(28 * scale, 4 * scale, 8 * scale, 12 * scale); // Top knot
        } else if (hairStyle < 0.5) {
            ctx.fillRect(18 * scale, 8 * scale, 28 * scale, 8 * scale); // Short hair
        } else {
            ctx.fillRect(18 * scale, 8 * scale, 12 * scale, 16 * scale); // Side part
            ctx.fillRect(34 * scale, 8 * scale, 4 * scale, 16 * scale);
        }

        // Eyes
        ctx.fillStyle = PALETTE.outline;
        ctx.fillRect(24 * scale, 20 * scale, 4 * scale, 4 * scale);
        ctx.fillRect(36 * scale, 20 * scale, 4 * scale, 4 * scale);
        
        // Archetype accessory
        ctx.fillStyle = accessoryColor;
        switch (archetype) {
            case 'Netrunner':
                ctx.fillRect(18 * scale, 18 * scale, 28 * scale, 6 * scale); // Visor
                break;
            case 'Techie':
                ctx.fillRect(18 * scale, 18 * scale, 8 * scale, 8 * scale); // Goggles
                ctx.fillRect(38 * scale, 18 * scale, 8 * scale, 8 * scale);
                break;
            case 'Corporate Drone':
                 ctx.fillStyle = '#FFFFFF';
                 ctx.fillRect(20 * scale, 32 * scale, 24 * scale, 8 * scale); // White collar
                break;
            case 'Street Samurai':
                ctx.fillRect(20 * scale, 26 * scale, 24 * scale, 2 * scale); // Scar
                break;
            case 'Runner': // a bit of armor
                 ctx.fillStyle = '#7f8c8d';
                 ctx.fillRect(16 * scale, 32 * scale, 8 * scale, 12 * scale); // Shoulder pad
                break;
        }

    }, [archetype, faction, scale]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{ imageRendering: 'pixelated', width: '256px', height: '256px' }}
            aria-label={`Pixel art portrait of a ${archetype} from the ${faction} faction.`}
        />
    );
};

export default PixelArtCanvas;