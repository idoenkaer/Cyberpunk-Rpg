
import React, { useRef, useEffect } from 'react';

interface NpcPortraitCanvasProps {
    npcName: string;
    isTalking: boolean;
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

const mulberry32 = (a: number) => {
    return () => {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

const PALETTE = {
    skin: ['#d1a388', '#a17e69', '#e6bca6', '#7c5c4e'],
    skin_shadow_mult: 0.8,
    hair: ['#2c2121', '#4d3f3f', '#6b6b6b', '#1a1a1a', '#8c7a6b'],
    eyes: ['#00f0ff', '#ff0000', '#00ff00', '#ffffff'],
    clothing: ['#4a4a4a', '#1e4852', '#3d4a5e', '#a0a0b0', '#5e3d3d'],
    cybernetics: ['#95a5a6', '#c0392b', '#bdc3c7', '#7f8c8d'],
    outline: '#1a1a1a',
};


const NpcPortraitCanvas: React.FC<NpcPortraitCanvasProps> = ({ npcName, isTalking }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const elapsedTimeRef = useRef<number>(0);
    const size = 128;
    const resolution = 64; // Increased resolution for more detail
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
        const eyeColor = PALETTE.eyes[Math.floor(rand() * PALETTE.eyes.length)];
        const clothingColor = PALETTE.clothing[Math.floor(rand() * PALETTE.clothing.length)];
        const hasCybernetics = rand() > 0.5;
        const hairStyle = Math.floor(rand() * 4); 

        const drawPortrait = (time: number) => {
            ctx.clearRect(0, 0, size, size);

            const idleYOffset = Math.sin(time / 500) * 0.5; // Breathing
            const isBlinking = (time % 4000) < 100;

            // Background
            ctx.fillStyle = `rgba(0, 255, 255, ${0.05 + rand() * 0.1})`;
            ctx.fillRect(0, 0, size, size);

            // Body/Clothing with shading
            ctx.fillStyle = clothingColor;
            ctx.fillRect(8 * scale, (28 + idleYOffset) * scale, 48 * scale, 36 * scale);
            ctx.fillStyle = PALETTE.outline;
            ctx.globalAlpha = 0.2;
            ctx.fillRect(8 * scale, (40 + idleYOffset) * scale, 48 * scale, 24 * scale);
            ctx.globalAlpha = 1.0;
            
            // Head
            ctx.fillStyle = skinColor;
            ctx.fillRect(16 * scale, (12 + idleYOffset) * scale, 32 * scale, 32 * scale);
            // Shadow on face
            ctx.fillStyle = PALETTE.outline;
            ctx.globalAlpha = 0.1;
            ctx.fillRect(16 * scale, (28 + idleYOffset) * scale, 32 * scale, 16 * scale);
            ctx.globalAlpha = 1.0;

            // Eyes
            if (!isBlinking) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(22 * scale, (20 + idleYOffset) * scale, 6 * scale, 4 * scale);
                ctx.fillRect(36 * scale, (20 + idleYOffset) * scale, 6 * scale, 4 * scale);
                ctx.fillStyle = eyeColor;
                ctx.fillRect(24 * scale, (22 + idleYOffset) * scale, 2 * scale, 2 * scale);
                ctx.fillRect(38 * scale, (22 + idleYOffset) * scale, 2 * scale, 2 * scale);
            } else {
                ctx.fillStyle = PALETTE.outline;
                ctx.fillRect(22 * scale, (22 + idleYOffset) * scale, 6 * scale, 1 * scale);
                ctx.fillRect(36 * scale, (22 + idleYOffset) * scale, 6 * scale, 1 * scale);
            }

            // Mouth
            ctx.fillStyle = PALETTE.outline;
            if (isTalking) {
                const mouthShape = Math.floor((time % 400) / 100);
                if (mouthShape === 1) ctx.fillRect(28 * scale, (34 + idleYOffset) * scale, 8 * scale, 4 * scale); // Open 'o'
                else if (mouthShape === 3) ctx.fillRect(26 * scale, (36 + idleYOffset) * scale, 12 * scale, 2 * scale); // Wide 'e'
                else ctx.fillRect(28 * scale, (35 + idleYOffset) * scale, 8 * scale, 2 * scale); // Closed
            } else {
                ctx.fillRect(28 * scale, (35 + idleYOffset) * scale, 8 * scale, 2 * scale);
            }


            // Hair
            ctx.fillStyle = hairColor;
            switch (hairStyle) {
                case 0: // Short Buzz
                    ctx.fillRect(16 * scale, (8 + idleYOffset) * scale, 32 * scale, 8 * scale);
                    break;
                case 1: // Mid, parting
                    ctx.fillRect(14 * scale, (8 + idleYOffset) * scale, 36 * scale, 12 * scale);
                    ctx.fillStyle = PALETTE.outline;
                    ctx.fillRect(31 * scale, (8 + idleYOffset) * scale, 2 * scale, 10 * scale);
                    break;
                case 2: // Spiky mohawk
                    ctx.fillRect(26 * scale, (2 + idleYOffset) * scale, 12 * scale, 14 * scale);
                    break;
                case 3: // Long
                    ctx.fillRect(14 * scale, (8 + idleYOffset) * scale, 36 * scale, 16 * scale);
                    ctx.fillRect(10 * scale, (12 + idleYOffset) * scale, 4 * scale, 24 * scale);
                    ctx.fillRect(50 * scale, (12 + idleYOffset) * scale, 4 * scale, 24 * scale);
                    break;
            }

            // Cybernetics
            if (hasCybernetics) {
                ctx.fillStyle = PALETTE.cybernetics[Math.floor(rand() * PALETTE.cybernetics.length)];
                if (rand() > 0.5) { // Eye patch/visor
                    ctx.fillRect(35 * scale, (18 + idleYOffset) * scale, 10 * scale, 8 * scale);
                    ctx.fillStyle = PALETTE.eyes[Math.floor(rand() * PALETTE.eyes.length)];
                    ctx.fillRect(38 * scale, (21 + idleYOffset) * scale, 4 * scale, 2 * scale);
                } else { // Jaw/cheek plate
                    ctx.fillRect(16 * scale, (30 + idleYOffset) * scale, 10 * scale, 10 * scale);
                }
            }
        };

        const animate = (timestamp: number) => {
            if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
            const deltaTime = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;
            elapsedTimeRef.current += deltaTime;

            drawPortrait(elapsedTimeRef.current);
            animationFrameId.current = requestAnimationFrame(animate);
        };
        
        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId.current);
            lastTimeRef.current = 0;
            elapsedTimeRef.current = 0;
        };

    }, [npcName, isTalking, scale]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{ imageRendering: 'pixelated', width: '128px', height: '128px' }}
            aria-label={`Pixel art portrait of ${npcName}`}
        />
    );
};

export default NpcPortraitCanvas;
