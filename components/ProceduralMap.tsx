// components/ProceduralMap.tsx
import React, { useRef, useEffect } from 'react';

interface ProceduralMapProps {
    locationName: string;
}

const mulberry32 = (a: number) => {
    return () => {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash;
};

const PALETTE = {
    building: ['#374151', '#4b5563', '#6b7280'],
    road: '#1f2937',
    highlight: ['#00ffff', '#f000f0', '#ffff00'],
    background: '#111827'
};

const ProceduralMap: React.FC<ProceduralMapProps> = ({ locationName }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const size = 64;
    const gridSize = 16;
    const pixelSize = size / gridSize;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const seed = simpleHash(locationName);
        const rand = mulberry32(seed);

        ctx.fillStyle = PALETTE.background;
        ctx.fillRect(0, 0, size, size);

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const isBuilding = rand() > 0.4;
                if (isBuilding) {
                    const buildingColor = PALETTE.building[Math.floor(rand() * PALETTE.building.length)];
                    ctx.fillStyle = buildingColor;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);

                    if (rand() > 0.9) {
                         const highlightColor = PALETTE.highlight[Math.floor(rand() * PALETTE.highlight.length)];
                         ctx.fillStyle = highlightColor;
                         ctx.fillRect(x * pixelSize + 1, y * pixelSize + 1, pixelSize - 2, pixelSize - 2);
                    }
                } else {
                    ctx.fillStyle = PALETTE.road;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }

    }, [locationName]);

    return (
        <canvas 
            ref={canvasRef} 
            width={size} 
            height={size}
            style={{ imageRendering: 'pixelated', width: '64px', height: '64px' }}
            aria-label={`Procedural map of ${locationName}`}
        />
    );
};

export default ProceduralMap;
