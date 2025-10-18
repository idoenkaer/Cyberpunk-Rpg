import React, { useRef, useEffect } from 'react';

const RainEffect: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const raindrops: { x: number; y: number; length: number; speed: number }[] = [];
        const numRaindrops = Math.floor(width / 4);

        for (let i = 0; i < numRaindrops; i++) {
            raindrops.push({
                x: Math.random() * width,
                y: Math.random() * height,
                length: Math.random() * 20 + 10,
                speed: Math.random() * 3 + 2,
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = 'rgba(17, 94, 89, 0.5)'; // Dark cyan color matching theme
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';

            for (const drop of raindrops) {
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x, drop.y + drop.length);
                ctx.stroke();

                drop.y += drop.speed;

                if (drop.y > height) {
                    drop.y = 0 - drop.length;
                    drop.x = Math.random() * width;
                }
            }

            requestAnimationFrame(draw);
        };

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);
        
        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
        };

    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full -z-10"
        />
    );
};

export default RainEffect;
