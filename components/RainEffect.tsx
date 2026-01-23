// components/RainEffect.tsx
import React, { useRef, useEffect } from 'react';

interface RainEffectProps {
    weatherCondition: 'rain' | 'fog' | 'acidRain';
    aiCorruption: number; // Added for acid rain intensity
}

const RainEffect: React.FC<RainEffectProps> = ({ weatherCondition, aiCorruption }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        
        // General resize function
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Re-initialize effects after resize, as some properties depend on canvas dimensions
            initializeEffect();
        };

        // --- Rain Specifics ---
        const rainDrops: { x: number; y: number; speed: number; length: number }[] = [];
        const numRainDrops = 1500;
        const initRain = () => {
            rainDrops.length = 0;
            for (let i = 0; i < numRainDrops; i++) {
                rainDrops.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    speed: Math.random() * 4 + 2,
                    length: Math.random() * 20 + 10,
                });
            }
        };
        const drawRain = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = 'rgba(175, 225, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';

            for (let i = 0; i < rainDrops.length; i++) {
                const drop = rainDrops[i];
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x, drop.y + drop.length);
                ctx.stroke();

                drop.y += drop.speed;
                if (drop.y > canvas.height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * canvas.width;
                }
            }
        };

        // --- Acid Rain Specifics ---
        const acidRainDrops: { x: number; y: number; speed: number; length: number }[] = [];
        const numAcidDrops = 800; // Fewer, thicker drops
        const initAcidRain = () => {
            acidRainDrops.length = 0;
            // Adjust drop density/speed based on corruption
            const corruptionFactor = aiCorruption / 100; // 0 to 1
            const currentNumDrops = numAcidDrops * (1 + corruptionFactor * 0.5); // More drops with more corruption
            for (let i = 0; i < currentNumDrops; i++) {
                acidRainDrops.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    speed: Math.random() * 6 + 3 + (corruptionFactor * 2), // Faster with more corruption
                    length: Math.random() * 25 + 15 + (corruptionFactor * 10), // Longer with more corruption
                });
            }
        };
        const drawAcidRain = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Background corruption glow, scales with AI corruption
            const corruptionOpacity = Math.min(aiCorruption / 50, 0.5); // Max 50% opacity for background glow
            ctx.fillStyle = `rgba(255, 0, 100, ${corruptionOpacity * 0.3})`; // Red/pinkish glow
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = `rgba(255, 100, 150, ${0.4 + corruptionOpacity * 0.5})`; // Acidic color, more opaque with corruption
            ctx.lineWidth = 2 + (corruptionOpacity * 2); // Thicker lines
            ctx.lineCap = 'round';

            for (let i = 0; i < acidRainDrops.length; i++) {
                const drop = acidRainDrops[i];
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x, drop.y + drop.length);
                ctx.stroke();

                drop.y += drop.speed;
                if (drop.y > canvas.height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * canvas.width;
                }
            }
        };

        // --- Fog Specifics ---
        const fogLayers: { x: number; y: number; width: number; height: number; speed: number; opacity: number; color: string }[] = [];
        const numFogLayers = 5;
        const initFog = () => {
            fogLayers.length = 0;
            const corruptionFactor = aiCorruption / 100; // 0 to 1
            for (let i = 0; i < numFogLayers; i++) {
                fogLayers.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    width: canvas.width * (0.8 + Math.random() * 0.4),
                    height: canvas.height * (0.1 + Math.random() * 0.3),
                    speed: (Math.random() - 0.5) * (0.5 + corruptionFactor * 0.5), // Fog moves faster with corruption
                    opacity: 0.05 + Math.random() * 0.1 + (corruptionFactor * 0.05), // Denser fog with corruption
                    color: i % 2 === 0 ? 'rgba(100, 150, 160, ' : 'rgba(50, 70, 80, ', // Base bluish-grey
                });
            }
        };
        const drawFog = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const corruptionFactor = aiCorruption / 100;
            
            // Subtle background shimmer/glow for higher corruption in fog
            if (corruptionFactor > 0.1) {
                const redIntensity = corruptionFactor * 0.2;
                ctx.fillStyle = `rgba(255, 0, 0, ${redIntensity})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            for (const layer of fogLayers) {
                // Adjust color slightly towards red/purple if corrupted
                const baseColor = layer.color.startsWith('rgba(100') ? [100, 150, 160] : [50, 70, 80];
                const corruptedColor = [
                    baseColor[0] + Math.floor(155 * corruptionFactor), // More red
                    baseColor[1] - Math.floor(100 * corruptionFactor), // Less green
                    baseColor[2] - Math.floor(100 * corruptionFactor)  // Less blue
                ].map(c => Math.max(0, Math.min(255, c))); // Clamp values to 0-255

                ctx.fillStyle = `rgba(${corruptedColor.join(', ')}, ${layer.opacity})`;
                ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
                layer.x += layer.speed;

                // Loop fog layers horizontally
                if (layer.speed > 0 && layer.x > canvas.width) {
                    layer.x = -layer.width;
                } else if (layer.speed < 0 && layer.x < -layer.width) {
                    layer.x = canvas.width;
                }
            }
        };

        // Main animation loop
        const animate = () => {
            switch (weatherCondition) {
                case 'rain':
                    drawRain();
                    break;
                case 'acidRain':
                    drawAcidRain();
                    break;
                case 'fog':
                    drawFog();
                    break;
                default:
                    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear if no specific condition
                    break;
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        // Initialize effects based on current weather condition
        const initializeEffect = () => {
            switch (weatherCondition) {
                case 'rain':
                    initRain();
                    break;
                case 'acidRain':
                    initAcidRain();
                    break;
                case 'fog':
                    initFog();
                    break;
                default:
                    break;
            }
        }

        // Setup on mount and on weatherCondition/aiCorruption change
        resizeCanvas(); // Initial setup
        window.addEventListener('resize', resizeCanvas);
        // Start animation loop
        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [weatherCondition, aiCorruption]); // Rerun effect when condition or corruption changes

    const ariaLabel = (() => {
        switch (weatherCondition) {
            case 'rain': return 'Animated background showing falling rain.';
            case 'fog': return 'Animated background showing thick fog.';
            case 'acidRain': return `Animated background showing falling acid rain, corruption level ${aiCorruption}.`;
            default: return 'Animated background showing weather effect.';
        }
    })();

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
            aria-label={ariaLabel}
        />
    );
};

export default RainEffect;