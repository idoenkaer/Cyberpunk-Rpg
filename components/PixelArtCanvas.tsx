import React, { useEffect, useRef } from 'react';
import type { Archetype, Faction } from '../types';

interface PixelArtCanvasProps {
    archetype: Archetype;
    faction: Faction;
}

// --- Interfaces ---
interface Particle {
    x: number; y: number;
    vx: number; vy: number;
    life: number; maxLife: number;
    color: string; size: number;
    gravity?: number;
}

const PALETTE = {
    skin: '#d1a388', skin_shadow: '#a17e69',
    hair: '#2c2121',
    outline: '#1a1a1a', 
    background: '#1a202c', 
    runner_coat: '#4a4a4a', runner_coat_highlight: '#6b6b6b', runner_coat_trim: '#333333',
    runner_cyber_arm: '#95a5a6', runner_cyber_arm_shadow: '#7f8c8d',
    runner_eye_glow: '#ff0000',
    netrunner_hoodie: '#1e4852', netrunner_hoodie_highlight: '#2a6271',
    netrunner_visor_glow: '#00f0ff',
    samurai_armor: '#a0a0b0', samurai_armor_shadow: '#808090', samurai_armor_highlight: '#c0c0d0',
    samurai_scar: '#c78d81',
    corp_suit: '#3d4a5e', corp_suit_lapel: '#4a5a6e',
    corp_tie: '#c0392b',
    white: '#ffffff',
    muzzle_flash: '#fff38a',
    spark: '#ffc83d',
    cyber_spark: '#00e1ff',
    katana_slash: 'rgba(173, 216, 230, 0.7)',
    katana_glow: '#00f0ff',
    holo_particle: '#00ffaa',
    rain: 'rgba(175, 225, 255, 0.4)',
    sprite_rain: 'rgba(175, 225, 255, 0.2)',
    corp_logo: '#00ffff',
    hacker_logo: '#00ff00',
    samurai_logo: '#ff0000',
    police_logo: '#0055ff'
};

const drawPixel = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, pixelSize: number = 1) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, pixelSize, pixelSize);
};

// --- Animation & State Constants ---
const IDLE_DURATION = 5000;
const ACTION_DURATION = 1500; 
const NUM_IDLE_FRAMES = 2;
const NUM_ACTION_FRAMES = 15;

const PixelArtCanvas: React.FC<PixelArtCanvasProps> = ({ archetype, faction }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>(0);
    const raindrops = useRef<{ x: number; y: number; length: number; speed: number }[]>([]);
    const particles = useRef<Particle[]>([]);
    const spriteCache = useRef<{ idle: HTMLCanvasElement[], action: HTMLCanvasElement[] }>({ idle: [], action: [] });
    
    const lastTimeRef = useRef<number>(0);
    const elapsedTimeRef = useRef<number>(0);
    const stateTimerRef = useRef<number>(0);
    const animationStateRef = useRef<'IDLE' | 'ACTION'>('IDLE');
    const actionFrameTriggered = useRef<{ [key: number]: boolean }>({});

    const canvasSize = 128;
    const spriteResolution = 32;
    const scale = canvasSize / spriteResolution;

    useEffect(() => {
        // --- Frame Generation Logic ---
        const generateSpriteFrame = (state: 'IDLE' | 'ACTION', progress: number): HTMLCanvasElement => {
            const frameCanvas = document.createElement('canvas');
            frameCanvas.width = spriteResolution;
            frameCanvas.height = spriteResolution;
            const ctx = frameCanvas.getContext('2d');
            if (!ctx) return frameCanvas;
            
            const baseCanvas = document.createElement('canvas');
            baseCanvas.width = spriteResolution;
            baseCanvas.height = spriteResolution;
            const baseCtx = baseCanvas.getContext('2d');
            if (!baseCtx) return frameCanvas;

            const glowCanvas = document.createElement('canvas');
            glowCanvas.width = spriteResolution;
            glowCanvas.height = spriteResolution;
            const glowCtx = glowCanvas.getContext('2d');
            if (!glowCtx) return frameCanvas;

            const drawHead = (yOffset = 0) => {
                baseCtx.fillStyle = PALETTE.skin_shadow;
                baseCtx.fillRect(12, 10 + yOffset, 8, 4); // Neck/chin shadow
                baseCtx.fillStyle = PALETTE.skin;
                baseCtx.fillRect(12, 6 + yOffset, 8, 5); // Main face
                baseCtx.fillStyle = PALETTE.hair;
                baseCtx.fillRect(11, 4 + yOffset, 10, 3); // Hair
            };

            // --- Draw Base Character ---
            switch (archetype) {
                case 'Runner':
                    // Trench Coat
                    baseCtx.fillStyle = PALETTE.runner_coat_trim;
                    baseCtx.fillRect(8, 14, 16, 14); // Coat base
                    baseCtx.fillStyle = PALETTE.runner_coat;
                    baseCtx.fillRect(9, 14, 14, 13); // Main coat body
                    baseCtx.fillStyle = PALETTE.runner_coat_highlight;
                    baseCtx.fillRect(8, 13, 16, 1); // Shoulders
                    // Cybernetic Arm
                    baseCtx.fillStyle = PALETTE.runner_cyber_arm_shadow;
                    baseCtx.fillRect(4, 15, 4, 8);
                    baseCtx.fillStyle = PALETTE.runner_cyber_arm;
                    baseCtx.fillRect(4, 15, 3, 7);
                    // Legs
                    baseCtx.fillStyle = PALETTE.runner_coat_trim;
                    baseCtx.fillRect(11, 27, 4, 3);
                    baseCtx.fillRect(17, 27, 4, 3);
                    drawHead();
                    break;
                case 'Netrunner':
                    // Hoodie
                    baseCtx.fillStyle = PALETTE.netrunner_hoodie;
                    baseCtx.fillRect(8, 13, 16, 15); // Main body
                    baseCtx.fillRect(10, 5, 12, 10); // Hood
                    baseCtx.fillStyle = PALETTE.netrunner_hoodie_highlight;
                    baseCtx.fillRect(8, 12, 16, 1); // Shoulders
                    baseCtx.fillRect(10, 5, 12, 1); // Hood top
                    // Face inside hood
                    baseCtx.fillStyle = PALETTE.skin_shadow;
                    baseCtx.fillRect(12, 9, 8, 5);
                    // Legs
                    baseCtx.fillStyle = PALETTE.hair; // Using hair color for dark pants
                    baseCtx.fillRect(11, 28, 4, 2);
                    baseCtx.fillRect(17, 28, 4, 2);
                    break;
                case 'Street Samurai':
                    // Armor
                    baseCtx.fillStyle = PALETTE.samurai_armor_shadow;
                    baseCtx.fillRect(8, 14, 16, 12); // Torso shadow
                    baseCtx.fillStyle = PALETTE.samurai_armor;
                    baseCtx.fillRect(9, 14, 14, 11); // Torso main
                    baseCtx.fillStyle = PALETTE.samurai_armor_highlight;
                    baseCtx.fillRect(7, 13, 18, 1); // Pauldrons
                    baseCtx.fillRect(9, 14, 1, 11); // Left plate highlight
                    baseCtx.fillRect(22, 14, 1, 11); // Right plate highlight
                    // Katana Hilt
                    baseCtx.fillStyle = PALETTE.hair;
                    baseCtx.fillRect(23, 10, 2, 5);
                    // Legs
                    baseCtx.fillStyle = PALETTE.samurai_armor_shadow;
                    baseCtx.fillRect(11, 25, 4, 4);
                    baseCtx.fillRect(17, 25, 4, 4);
                    drawHead();
                    // Scar
                    baseCtx.fillStyle = PALETTE.samurai_scar;
                    baseCtx.fillRect(16, 7, 1, 3);
                    break;
                case 'Corporate Drone':
                     // Suit Jacket
                    baseCtx.fillStyle = PALETTE.corp_suit;
                    baseCtx.fillRect(8, 14, 16, 14);
                    // Lapels
                    baseCtx.fillStyle = PALETTE.corp_suit_lapel;
                    baseCtx.fillRect(9, 14, 3, 7);
                    baseCtx.fillRect(20, 14, 3, 7);
                    // Shirt
                    baseCtx.fillStyle = PALETTE.white;
                    baseCtx.fillRect(12, 14, 8, 5);
                    // Tie
                    baseCtx.fillStyle = PALETTE.corp_tie;
                    baseCtx.fillRect(15, 14, 2, 8);
                    // Legs
                    baseCtx.fillStyle = PALETTE.hair;
                    baseCtx.fillRect(11, 28, 4, 3);
                    baseCtx.fillRect(17, 28, 4, 3);
                    drawHead();
                    break;
            }
            // Draw Faction Insignia on baseCtx
            // ...

            // --- Draw Glow Elements on Glow Canvas ---
            if (state === 'IDLE') {
                const pulse = (Math.sin(progress * 2 * Math.PI) + 1) / 2;
                if (archetype === 'Runner' && pulse > 0.5) drawPixel(glowCtx, 13, 9, PALETTE.runner_eye_glow);
                if (archetype === 'Netrunner' && pulse > 0.5) {
                    glowCtx.fillStyle = PALETTE.netrunner_visor_glow;
                    glowCtx.fillRect(12,10,8,2);
                }
            } else { // ACTION
                if (archetype === 'Runner' && progress > 0.1 && progress < 0.25) drawPixel(glowCtx, -6, 15, PALETTE.muzzle_flash, 3);
                if (archetype === 'Street Samurai' && progress > 0.1 && progress < 0.4) drawPixel(glowCtx, 16, 16, PALETTE.katana_glow);
                if (archetype === 'Corporate Drone' && progress < 0.7) for(let i=0; i<3; i++) drawPixel(glowCtx, 2, 18+i*2, PALETTE.netrunner_visor_glow);
            }

            // --- Composite Layers to Final Frame ---
            // 1. Draw Outline
            const outlineCanvas = document.createElement('canvas');
            outlineCanvas.width = spriteResolution;
            outlineCanvas.height = spriteResolution;
            const outlineCtx = outlineCanvas.getContext('2d');
            if (outlineCtx) {
                outlineCtx.drawImage(baseCanvas, 0, 0);
                outlineCtx.globalCompositeOperation = 'source-in';
                outlineCtx.fillStyle = PALETTE.outline;
                outlineCtx.fillRect(0, 0, spriteResolution, spriteResolution);
                ctx.drawImage(outlineCanvas, 0, 1);
                ctx.drawImage(outlineCanvas, 1, 0);
                ctx.drawImage(outlineCanvas, -1, 0);
                ctx.drawImage(outlineCanvas, 0, -1);
            }
            
            // 2. Draw Base Sprite
            ctx.drawImage(baseCanvas, 0, 0);

            // 3. Draw Bloom/Glow Layer
            ctx.save();
            ctx.filter = 'blur(2px)';
            ctx.globalCompositeOperation = 'lighter';
            ctx.drawImage(glowCanvas, 0, 0);
            ctx.restore();
            // Draw the core glow again so it's sharp
            ctx.globalCompositeOperation = 'lighter';
            ctx.drawImage(glowCanvas, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
            
            return frameCanvas;
        };

        const idleFrames: HTMLCanvasElement[] = [];
        for (let i=0; i < NUM_IDLE_FRAMES; i++) {
            idleFrames.push(generateSpriteFrame('IDLE', i / NUM_IDLE_FRAMES));
        }

        const actionFrames: HTMLCanvasElement[] = [];
        for (let i=0; i < NUM_ACTION_FRAMES; i++) {
            actionFrames.push(generateSpriteFrame('ACTION', i / NUM_ACTION_FRAMES));
        }
        spriteCache.current = { idle: idleFrames, action: actionFrames };

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.imageSmoothingEnabled = false;

        if (raindrops.current.length === 0) {
            for (let i = 0; i < 20; i++) raindrops.current.push({ x: Math.random() * canvasSize, y: Math.random() * canvasSize, length: Math.random() * 10 + 5, speed: Math.random() * 2 + 1.5 });
        }

        const neonTints = [ 'rgba(255, 0, 150, 0.1)', 'rgba(0, 255, 255, 0.1)', 'rgba(0, 255, 100, 0.1)' ];
        
        const animate = (timestamp: number) => {
            if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
            const deltaTime = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;
            elapsedTimeRef.current += deltaTime;
            stateTimerRef.current += deltaTime;

            if (animationStateRef.current === 'IDLE' && stateTimerRef.current > IDLE_DURATION) {
                animationStateRef.current = 'ACTION';
                stateTimerRef.current = 0;
                actionFrameTriggered.current = {}; // Reset one-shot triggers
                 if (archetype === 'Street Samurai') { 
                    for (let i=0; i<15; i++) particles.current.push({ x: 80, y: 80, vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5, life: 300, maxLife: 300, color: PALETTE.katana_glow, size: 2, gravity: 0.05 });
                }
            } else if (animationStateRef.current === 'ACTION' && stateTimerRef.current > ACTION_DURATION) {
                animationStateRef.current = 'IDLE';
                stateTimerRef.current = 0;
            }

            ctx.clearRect(0, 0, canvasSize, canvasSize);
            ctx.fillStyle = PALETTE.background;
            ctx.fillRect(0, 0, canvasSize, canvasSize);
            
            // --- DRAW PRE-RENDERED FRAME ---
            const state = animationStateRef.current;
            const frameCount = state === 'IDLE' ? NUM_IDLE_FRAMES : NUM_ACTION_FRAMES;
            const duration = state === 'IDLE' ? IDLE_DURATION : ACTION_DURATION;
            const frameIndex = Math.floor((stateTimerRef.current / duration) * frameCount) % frameCount;
            const frameToDraw = spriteCache.current[state.toLowerCase() as 'idle'|'action'][frameIndex];
            
            const idleOffset = Math.sin(elapsedTimeRef.current / 500);
            const idleOffsetPixels = idleOffset * scale;

            if (frameToDraw) {
                 ctx.drawImage(frameToDraw, 0, idleOffsetPixels, canvasSize, canvasSize);
            }
            
             // --- ONE-SHOT FRAME TRIGGERS FOR PARTICLES ---
            if (state === 'ACTION' && !actionFrameTriggered.current[frameIndex]) {
                if (archetype === 'Runner' && frameIndex === 2) { // Muzzle flash frame
                    for (let i = 0; i < 15; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = Math.random() * 3 + 1;
                        particles.current.push({
                            x: (-6 + 1.5) * scale,
                            y: (15 + 1.5) * scale + idleOffsetPixels,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            life: 150 + Math.random() * 150,
                            maxLife: 300,
                            color: PALETTE.spark,
                            size: Math.random() * 2 + 1,
                            gravity: 0.1
                        });
                    }
                }
                actionFrameTriggered.current[frameIndex] = true;
            }

            // --- DRAW DYNAMIC EFFECTS ---
             // Cybernetic Sparks (always active check)
            if (archetype === 'Runner' && Math.random() > 0.985) {
                const sparkCount = Math.floor(Math.random() * 2) + 1;
                for (let i = 0; i < sparkCount; i++) {
                    particles.current.push({
                        x: (3 + Math.random() * 4) * scale,
                        y: (14 + Math.random() * 8) * scale + idleOffsetPixels,
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.7) * 2,
                        life: 200 + Math.random() * 200,
                        maxLife: 400,
                        color: PALETTE.cyber_spark,
                        size: 2,
                        gravity: 0.05
                    });
                }
            }

            // Netrunner particles (continuous during action)
            if (state === 'ACTION' && archetype === 'Netrunner' && Math.random() > 0.5) {
                particles.current.push({ x: 64, y: 64, vx: (Math.random()-0.5)*3, vy: (Math.random()-0.5)*3, life: 500, maxLife: 500, color: PALETTE.holo_particle, size: 2});
            }

            // Update and draw all particles
            particles.current = particles.current.filter(p => p.life > 0);
            for(const p of particles.current) {
                p.vy += p.gravity || 0;
                p.x += p.vx; p.y += p.vy; p.life -= deltaTime;
                ctx.globalAlpha = p.life / p.maxLife;
                drawPixel(ctx, p.x, p.y, p.color, p.size);
                ctx.globalAlpha = 1.0;
            }

            // Sprite Rain Distortion
            for (let i=0; i < 3; i++) {
                const y = (elapsedTimeRef.current/2 + i*40) % canvasSize;
                ctx.strokeStyle = PALETTE.sprite_rain;
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasSize, y); ctx.stroke();
            }

            // Environmental Tint
            const tintIndex = Math.floor(elapsedTimeRef.current / 2000) % neonTints.length;
            ctx.globalCompositeOperation = 'color';
            ctx.fillStyle = neonTints[tintIndex];
            ctx.fillRect(0, 0, canvasSize, canvasSize);
            ctx.globalCompositeOperation = 'source-over';

            // Background Rain
            for (const drop of raindrops.current) { /* ... draw background rain ... */ }

            animationFrameId.current = requestAnimationFrame(animate);
        };

        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId.current);
            lastTimeRef.current = 0;
            elapsedTimeRef.current = 0;
        };
    }, [archetype, faction]);

    return (
        <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            style={{ imageRendering: 'pixelated', width: '128px', height: '128px' }}
            aria-label={`Pixel art animation of a ${archetype}`}
        />
    );
};

export default PixelArtCanvas;