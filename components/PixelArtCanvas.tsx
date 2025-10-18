
// components/PixelArtCanvas.tsx
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
    skin: '#d1a388', skin_shadow: '#a17e69', skin_highlight: '#e6bca6',
    hair: '#2c2121', hair_highlight: '#4d3f3f',
    outline: '#1a1a1a', 
    background: '#1a202c', 
    runner_coat: '#4a4a4a', runner_coat_highlight: '#6b6b6b', runner_coat_shadow: '#3a3a3a', runner_coat_trim: '#333333',
    runner_cyber_arm: '#95a5a6', runner_cyber_arm_shadow: '#7f8c8d', runner_cyber_arm_highlight: '#bdc3c7',
    runner_eye_glow: '#ff0000', runner_eye_glow_dim: '#a10000',
    netrunner_hoodie: '#1e4852', netrunner_hoodie_highlight: '#2a6271', netrunner_hoodie_shadow: '#143038',
    netrunner_visor_glow: '#00f0ff', netrunner_visor_glow_dim: '#008c99',

    samurai_armor: '#a0a0b0', samurai_armor_shadow: '#808090', samurai_armor_highlight: '#c0c0d0',
    samurai_scar: '#c78d81',
    corp_suit: '#3d4a5e', corp_suit_lapel: '#4a5a6e', corp_suit_shadow: '#2c3645',
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


// --- Animation & State Constants ---
const IDLE_DURATION = 5000;
const ACTION_DURATION = 1500; 
const NUM_IDLE_FRAMES = 8;
const NUM_ACTION_FRAMES = 24;

const PixelArtCanvas: React.FC<PixelArtCanvasProps> = ({ archetype, faction }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>(0);
    const particles = useRef<Particle[]>([]);
    const spriteCache = useRef<{ idle: HTMLCanvasElement[], action: HTMLCanvasElement[] }>({ idle: [], action: [] });
    
    const lastTimeRef = useRef<number>(0);
    const elapsedTimeRef = useRef<number>(0);
    const stateTimerRef = useRef<number>(0);
    const animationStateRef = useRef<'IDLE' | 'ACTION'>('IDLE');
    const actionFrameTriggered = useRef<{ [key: number]: boolean }>({});

    const canvasSize = 192;
    const spriteResolution = 64;
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

            const drawFactionLogo = (x: number, y: number, faction: Faction) => {
                switch(faction) {
                    case 'Corporate Enforcers':
                        baseCtx.fillStyle = PALETTE.corp_logo;
                        baseCtx.fillRect(x, y, 6, 2);
                        baseCtx.fillRect(x + 2, y + 2, 2, 4);
                        break;
                    case 'Hacker Collective':
                         baseCtx.fillStyle = PALETTE.hacker_logo;
                         baseCtx.fillRect(x+1, y, 4, 2);
                         baseCtx.fillRect(x, y+2, 6, 2);
                         baseCtx.fillRect(x+1, y+4, 1, 1);
                         baseCtx.fillRect(x+4, y+4, 1, 1);
                        break;
                    case 'Street Ronin':
                        baseCtx.fillStyle = PALETTE.samurai_logo;
                        baseCtx.fillRect(x, y, 6, 2);
                        baseCtx.fillRect(x+2, y, 2, 6);
                        baseCtx.fillRect(x, y+4, 6, 2);
                        break;
                     case 'Police':
                        baseCtx.fillStyle = PALETTE.police_logo;
                        baseCtx.fillRect(x+1, y, 4, 6);
                        baseCtx.fillStyle = PALETTE.white;
                        baseCtx.fillRect(x+2, y+1, 2, 4);
                        break;
                }
            }


            const drawHead = (yOffset = 0, xOffset = 0, expression: 'neutral' | 'focused' | 'action' = 'neutral') => {
                // Head shape with shading
                baseCtx.fillStyle = PALETTE.skin_shadow;
                baseCtx.fillRect(26 + xOffset, 18 + yOffset, 12, 12); // Neck/chin shadow
                baseCtx.fillStyle = PALETTE.skin;
                baseCtx.fillRect(26 + xOffset, 12 + yOffset, 12, 7); // Main face
                baseCtx.fillStyle = PALETTE.skin_highlight;
                baseCtx.fillRect(27 + xOffset, 12 + yOffset, 10, 2); // Brow
                
                // Hair
                baseCtx.fillStyle = PALETTE.hair;
                baseCtx.fillRect(24 + xOffset, 8 + yOffset, 16, 6);
                baseCtx.fillStyle = PALETTE.hair_highlight;
                baseCtx.fillRect(25 + xOffset, 8 + yOffset, 14, 2);

                // Eyes & Expression
                const eyeY = 16 + yOffset;
                baseCtx.fillStyle = PALETTE.outline;
                if (expression === 'neutral') {
                     baseCtx.fillRect(28 + xOffset, eyeY, 4, 2); // Left eye
                     baseCtx.fillRect(34 + xOffset, eyeY, 4, 2); // Right eye
                } else if (expression === 'focused') {
                     baseCtx.fillRect(27 + xOffset, eyeY, 5, 1); // Left eye
                     baseCtx.fillRect(34 + xOffset, eyeY, 5, 1); // Right eye
                } else if (expression === 'action') {
                     baseCtx.fillRect(27 + xOffset, eyeY, 5, 2); // Left eye squint
                     baseCtx.fillRect(34 + xOffset, eyeY, 5, 2); // Right eye squint
                     baseCtx.fillRect(30 + xOffset, 22 + yOffset, 6, 2); // Open mouth
                }
            };
            
            let expression: 'neutral' | 'focused' | 'action' = 'neutral';
             if (state === 'ACTION') {
                if (progress > 0.2 && progress < 0.6) expression = 'action';
                else expression = 'focused';
            }

            // --- Draw Base Character ---
            switch (archetype) {
                case 'Runner': {
                    const recoilOffset = (state === 'ACTION' && progress > 0.2 && progress < 0.5) ? -1 : 0;
                    // Trench Coat
                    baseCtx.fillStyle = PALETTE.runner_coat_shadow;
                    baseCtx.fillRect(16 + recoilOffset, 28, 32, 32);
                    baseCtx.fillStyle = PALETTE.runner_coat;
                    baseCtx.fillRect(18 + recoilOffset, 28, 28, 30);
                    // Coat texture
                    baseCtx.globalAlpha = 0.1;
                    baseCtx.fillStyle = PALETTE.outline;
                    for(let i = 0; i < 10; i++) {
                         baseCtx.fillRect(18 + recoilOffset + Math.random() * 28, 28 + Math.random() * 30, 1, 1);
                    }
                    baseCtx.globalAlpha = 1;
                    baseCtx.fillStyle = PALETTE.runner_coat_highlight;
                    baseCtx.fillRect(16 + recoilOffset, 26, 32, 2);
                    drawFactionLogo(40 + recoilOffset, 30, faction);
                    // Cybernetic Arm
                    baseCtx.fillStyle = PALETTE.runner_cyber_arm_shadow;
                    baseCtx.fillRect(8 + recoilOffset, 30, 8, 16);
                    baseCtx.fillStyle = PALETTE.runner_cyber_arm;
                    baseCtx.fillRect(8 + recoilOffset, 30, 6, 15);
                    baseCtx.fillStyle = PALETTE.runner_cyber_arm_highlight;
                    baseCtx.fillRect(8 + recoilOffset, 30, 2, 15);
                    const headTilt = state === 'IDLE' ? Math.cos(elapsedTimeRef.current / 1000) * 1 : 0;
                    drawHead(recoilOffset, headTilt, expression);
                    glowCtx.fillStyle = (Math.sin(elapsedTimeRef.current / 400) > 0) ? PALETTE.runner_eye_glow : PALETTE.runner_eye_glow_dim;
                    glowCtx.fillRect(28 + headTilt, 16, 2, 2);
                    if (state === 'ACTION' && progress > 0.2 && progress < 0.3) {
                         glowCtx.fillStyle = PALETTE.muzzle_flash;
                         glowCtx.fillRect(4, 32, 12, 12);
                    }
                    break;
                }
                case 'Netrunner': {
                    const headTilt = state === 'IDLE' ? Math.cos(elapsedTimeRef.current / 1000) * 1 : 0;
                    baseCtx.fillStyle = PALETTE.netrunner_hoodie_shadow;
                    baseCtx.fillRect(16, 26, 32, 34);
                    baseCtx.fillRect(20 + headTilt, 10, 24, 20); // Hood
                    baseCtx.fillStyle = PALETTE.netrunner_hoodie;
                    baseCtx.fillRect(18, 26, 28, 32);
                    baseCtx.fillRect(22 + headTilt, 10, 20, 18); // Hood inner
                    drawFactionLogo(40, 30, faction);
                    // Face inside hood
                    baseCtx.fillStyle = PALETTE.skin_shadow;
                    baseCtx.fillRect(28 + headTilt, 18, 8, 10);
                    if(expression !== 'neutral') { // Light from visor
                        baseCtx.fillStyle = PALETTE.netrunner_visor_glow_dim;
                        baseCtx.fillRect(28 + headTilt, 20, 8, 4);
                    }
                    // Visor Glow
                    const pulse = state === 'IDLE' ? (Math.sin(elapsedTimeRef.current / 300) > 0) : true;
                    if(pulse) {
                        glowCtx.fillStyle = PALETTE.netrunner_visor_glow;
                        glowCtx.fillRect(26 + headTilt, 18, 12, (expression === 'action') ? 6 : 4);
                    }
                    break;
                }
                case 'Street Samurai': {
                    const lunge = (state === 'ACTION') ? Math.sin(progress * Math.PI) * 8 : 0;
                    const headTilt = state === 'IDLE' ? Math.cos(elapsedTimeRef.current / 1000) * 1 : 0;
                    // Armor
                    baseCtx.fillStyle = PALETTE.samurai_armor_shadow;
                    baseCtx.fillRect(16 + lunge, 28, 32, 28);
                    baseCtx.fillStyle = PALETTE.samurai_armor;
                    baseCtx.fillRect(18 + lunge, 28, 28, 26);
                    baseCtx.fillStyle = PALETTE.samurai_armor_highlight;
                    baseCtx.fillRect(14 + lunge, 26, 36, 2); // Pauldrons
                    drawFactionLogo(40 + lunge, 30, faction);
                    drawHead(0, headTilt, expression);
                    // Scar
                    baseCtx.fillStyle = PALETTE.samurai_scar;
                    baseCtx.fillRect(34 + headTilt, 14, 2, 6);
                    // Katana Slash
                    if (state === 'ACTION' && progress > 0.2 && progress < 0.6) {
                        glowCtx.save();
                        glowCtx.translate(32, 32);
                        glowCtx.rotate(0.5);
                        glowCtx.fillStyle = PALETTE.katana_slash;
                        glowCtx.fillRect( -10, -30, 20, 60);
                        glowCtx.restore();
                    }
                    break;
                }
                 case 'Corporate Drone': {
                    const headTilt = state === 'IDLE' ? Math.cos(elapsedTimeRef.current / 1000) * 1 : 0;
                    // Suit Jacket
                    baseCtx.fillStyle = PALETTE.corp_suit_shadow;
                    baseCtx.fillRect(16, 28, 32, 32);
                    baseCtx.fillStyle = PALETTE.corp_suit;
                    baseCtx.fillRect(18, 28, 28, 30);
                    // Lapels/Shirt/Tie
                    baseCtx.fillStyle = PALETTE.white;
                    baseCtx.fillRect(26, 28, 12, 10);
                    baseCtx.fillStyle = PALETTE.corp_tie;
                    baseCtx.fillRect(31, 28, 2, 12);
                     baseCtx.fillStyle = PALETTE.corp_suit_lapel;
                    baseCtx.fillRect(20, 28, 6, 14);
                    baseCtx.fillRect(38, 28, 6, 14);
                    drawFactionLogo(20, 32, faction);
                    drawHead(0, headTilt, expression);
                    // Holo interface
                    if (state === 'ACTION' && progress < 0.8) {
                        for(let i=0; i<5; i++) {
                            if (Math.random() > 0.3) {
                                glowCtx.fillStyle = PALETTE.holo_particle;
                                glowCtx.fillRect(Math.random() * 24, 30 + Math.random() * 16, 2, 2);
                            }
                        }
                    }
                    break;
                 }
            }
            
            // --- Composite Layers ---
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
            }
            
            ctx.drawImage(baseCanvas, 0, 0);

            ctx.save();
            ctx.filter = 'blur(4px)';
            ctx.globalAlpha = 0.8;
            ctx.globalCompositeOperation = 'lighter';
            ctx.drawImage(glowCanvas, 0, 0);
            ctx.restore();
            ctx.globalCompositeOperation = 'lighter';
            ctx.drawImage(glowCanvas, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
            
            return frameCanvas;
        };

        const idleFrames: HTMLCanvasElement[] = [];
        for (let i=0; i < NUM_IDLE_FRAMES; i++) idleFrames.push(generateSpriteFrame('IDLE', i / NUM_IDLE_FRAMES));
        const actionFrames: HTMLCanvasElement[] = [];
        for (let i=0; i < NUM_ACTION_FRAMES; i++) actionFrames.push(generateSpriteFrame('ACTION', i / NUM_ACTION_FRAMES));
        spriteCache.current = { idle: idleFrames, action: actionFrames };

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.imageSmoothingEnabled = false;

        const animate = (timestamp: number) => {
            if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
            const deltaTime = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;
            elapsedTimeRef.current += deltaTime;
            stateTimerRef.current += deltaTime;

            if (animationStateRef.current === 'IDLE' && stateTimerRef.current > IDLE_DURATION) {
                animationStateRef.current = 'ACTION';
                stateTimerRef.current = 0;
                actionFrameTriggered.current = {};
            } else if (animationStateRef.current === 'ACTION' && stateTimerRef.current > ACTION_DURATION) {
                animationStateRef.current = 'IDLE';
                stateTimerRef.current = 0;
            }

            ctx.clearRect(0, 0, canvasSize, canvasSize);
            ctx.fillStyle = PALETTE.background;
            ctx.fillRect(0, 0, canvasSize, canvasSize);
            
            const state = animationStateRef.current;
            const frameCount = state === 'IDLE' ? NUM_IDLE_FRAMES : NUM_ACTION_FRAMES;
            const duration = state === 'IDLE' ? IDLE_DURATION : ACTION_DURATION;
            const frameIndex = Math.floor((stateTimerRef.current / duration) * frameCount) % frameCount;
            const frameToDraw = spriteCache.current[state.toLowerCase() as 'idle'|'action'][frameIndex];
            
            const idleOffset = Math.sin(elapsedTimeRef.current / 600) * 2;
            
            if (frameToDraw) {
                 ctx.drawImage(frameToDraw, 0, idleOffset, canvasSize, canvasSize);
            }
            
            // --- Particle Triggers ---
             if (state === 'ACTION' && !actionFrameTriggered.current[frameIndex]) {
                if (archetype === 'Runner' && frameIndex >= 5 && frameIndex <= 7) {
                    for (let i = 0; i < 5; i++) {
                         particles.current.push({ x: 12 * scale, y: 38 * scale, vx: -Math.random() * 5 - 2, vy: (Math.random() - 0.5) * 4, life: 200, maxLife: 200, color: PALETTE.spark, size: 3, gravity: 0.1 });
                    }
                }
                 actionFrameTriggered.current[frameIndex] = true;
            }

            // --- Continuous Particle Effects ---
             if (state === 'ACTION' && archetype === 'Netrunner') {
                 particles.current.push({ x: Math.random()*canvasSize, y: Math.random()*canvasSize, vx: 0, vy: -0.5, life: 400, maxLife: 400, color: PALETTE.holo_particle, size: 2});
             }

            // Update and draw all particles
            particles.current = particles.current.filter(p => p.life > 0);
            for(const p of particles.current) {
                p.vy += p.gravity || 0;
                p.x += p.vx; p.y += p.vy; p.life -= deltaTime;
                ctx.globalAlpha = p.life / p.maxLife;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);
                ctx.globalAlpha = 1.0;
            }

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
            style={{ imageRendering: 'pixelated', width: '192px', height: '192px' }}
            aria-label={`Hyperdetailed pixel art animation of a ${archetype}`}
        />
    );
};

export default PixelArtCanvas;
