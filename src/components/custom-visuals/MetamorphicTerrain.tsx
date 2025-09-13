import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: landscape of mind in constant transformation
// Visualization: Animated noise height map with evolving contour bands

const MetamorphicTerrain: React.FC<VisualProps> = ({ width, height }) => {
    const canvasRef = useRef(null);
    const timeRef = useRef(0);
    const animationRef = useRef(null);

    // Perlin noise implementation (3D)
    const permutation = useRef([]);

    if (permutation.current.length === 0) {
        const p = new Uint8Array(512);
        for (let i = 0; i < 256; i++) {
            p[i] = p[i + 256] = Math.floor(Math.random() * 256);
        }
        permutation.current = p;
    }

    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (t, a, b) => a + t * (b - a);
    const grad = (hash, x, y, z) => {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };

    const noise = (x, y, z) => {
        const p = permutation.current;
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = fade(x);
        const v = fade(y);
        const w = fade(z);

        const A = p[X] + Y;
        const AA = p[A] + Z;
        const AB = p[A + 1] + Z;
        const B = p[X + 1] + Y;
        const BA = p[B] + Z;
        const BB = p[B + 1] + Z;

        return lerp(
            w,
            lerp(
                v,
                lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
                lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))
            ),
            lerp(
                v,
                lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
                lerp(
                    u,
                    grad(p[AB + 1], x, y - 1, z - 1),
                    grad(p[BB + 1], x - 1, y - 1, z - 1)
                )
            )
        );
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = width;
        canvas.height = height;

        const step = 4;
        const scale = 0.015;
        const bands = 8;

        const render = () => {
            timeRef.current += 0.01;

            ctx.fillStyle = '#F0EEE6';
            ctx.fillRect(0, 0, width, height);

            for (let y = 0; y < height; y += step) {
                for (let x = 0; x < width; x += step) {
                    const n = noise(x * scale, y * scale, timeRef.current * 0.5);
                    const normalized = (n + 1) / 2;
                    const band = Math.floor(normalized * bands);
                    const shade = 40 + (band / bands) * 40; // 40% to 80%
                    ctx.fillStyle = `hsl(30, 10%, ${shade}%)`;
                    ctx.fillRect(x, y, step, step);
                }
            }

            animationRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [width, height]);

    return (
        <div style={{ width: `${width}px`, height: `${height}px`, backgroundColor: '#F0EEE6' }}>
            <canvas ref={canvasRef} width={width} height={height} className="w-full h-full" />
        </div>
    );
};

export default MetamorphicTerrain;
