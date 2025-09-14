// Themes: quantum superposition, wave-particle duality, probability collapse
// Visualisation: Quantum wave packets interfere and collapse showing probability distributions
// Unique mechanism: Schrödinger wave equation approximation with quantum interference patterns

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const WavePackets: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const rafRef = useRef<number|undefined>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, width, height);

    // PRNG for deterministic behavior
    let seed = 45721;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    interface WavePacket {
      x: number;
      y: number;
      kx: number; // wave vector x
      ky: number; // wave vector y
      sigma: number; // wave packet width
      amplitude: number;
      phase: number;
      frequency: number;
    }

    const wavePackets: WavePacket[] = [];
    const gridSize = 128;
    const waveField = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));

    // Initialize wave packets
    for (let i = 0; i < 4; i++) {
      wavePackets.push({
        x: random() * width,
        y: random() * height,
        kx: (random() - 0.5) * 0.02,
        ky: (random() - 0.5) * 0.02,
        sigma: 40 + random() * 30,
        amplitude: 0.8 + random() * 0.4,
        phase: random() * Math.PI * 2,
        frequency: 0.1 + random() * 0.05
      });
    }

    // Gaussian wave packet function
    const waveFunction = (packet: WavePacket, x: number, y: number, time: number) => {
      const dx = x - packet.x;
      const dy = y - packet.y;
      const r2 = dx * dx + dy * dy;
      const gaussian = Math.exp(-r2 / (2 * packet.sigma * packet.sigma));
      const phase = packet.kx * dx + packet.ky * dy - packet.frequency * time + packet.phase;
      return packet.amplitude * gaussian * Math.cos(phase);
    };

    // Calculate wave packet interference
    const updateWaveField = (time: number) => {
      const scaleX = width / gridSize;
      const scaleY = height / gridSize;

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const x = i * scaleX;
          const y = j * scaleY;
          let totalAmplitude = 0;

          // Superposition of all wave packets
          wavePackets.forEach(packet => {
            totalAmplitude += waveFunction(packet, x, y, time);
          });

          waveField[i][j] = totalAmplitude;
        }
      }
    };

    // Move wave packets slightly
    const updatePackets = (time: number) => {
      wavePackets.forEach(packet => {
        packet.x += packet.kx * 20;
        packet.y += packet.ky * 20;
        packet.phase += packet.frequency;

        // Boundary conditions - wrap around
        if (packet.x < 0) packet.x = width;
        if (packet.x > width) packet.x = 0;
        if (packet.y < 0) packet.y = height;
        if (packet.y > height) packet.y = 0;

        // Occasionally change direction (quantum tunneling effect)
        if (random() < 0.002) {
          packet.kx = (random() - 0.5) * 0.02;
          packet.ky = (random() - 0.5) * 0.02;
        }
      });
    };

    const render = (t: number) => {
      // Trails with translucent clear
      ctx.fillStyle = 'rgba(240,238,230,0.1)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      updatePackets(time);
      updateWaveField(time * 50); // Faster oscillation for visibility

      // Visualize wave field
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      const scaleX = gridSize / width;
      const scaleY = gridSize / height;

      for (let x = 0; x < width; x += 2) {
        for (let y = 0; y < height; y += 2) {
          const i = Math.floor(x * scaleX);
          const j = Math.floor(y * scaleY);

          if (i < gridSize && j < gridSize) {
            const amplitude = waveField[i][j];
            const probability = amplitude * amplitude; // |ψ|²
            const intensity = Math.min(1, Math.abs(probability)) * 255;

            // Color based on phase and probability
            let r, g, b, a;
            if (amplitude > 0) {
              r = Math.min(255, 80 + intensity * 0.3);
              g = Math.min(255, 80 + intensity * 0.3);
              b = Math.min(255, 80 + intensity * 0.3);
            } else {
              r = Math.min(255, 60 + intensity * 0.2);
              g = Math.min(255, 60 + intensity * 0.2);
              b = Math.min(255, 80 + intensity * 0.4);
            }
            a = Math.min(255, intensity + 50);

            // Fill 2x2 pixel block
            for (let dx = 0; dx < 2; dx++) {
              for (let dy = 0; dy < 2; dy++) {
                const px = x + dx;
                const py = y + dy;
                if (px < width && py < height) {
                  const idx = (py * width + px) * 4;
                  data[idx] = r;
                  data[idx + 1] = g;
                  data[idx + 2] = b;
                  data[idx + 3] = a;
                }
              }
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Draw wave packet centers and probability clouds
      wavePackets.forEach((packet, i) => {
        const pulse = Math.sin(time * 2 + i) * 0.2 + 0.8;

        // Probability cloud
        const cloudRadius = packet.sigma * 0.8;
        const gradient = ctx.createRadialGradient(
          packet.x, packet.y, 0,
          packet.x, packet.y, cloudRadius
        );
        gradient.addColorStop(0, `rgba(70,70,70,${0.3 * pulse})`);
        gradient.addColorStop(0.7, `rgba(70,70,70,${0.1 * pulse})`);
        gradient.addColorStop(1, 'rgba(70,70,70,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(packet.x, packet.y, cloudRadius, 0, Math.PI * 2);
        ctx.fill();

        // Wave vector indication
        const arrowLength = 30;
        const endX = packet.x + packet.kx * arrowLength * 1000;
        const endY = packet.y + packet.ky * arrowLength * 1000;

        ctx.strokeStyle = `rgba(50,50,50,${0.5 * pulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(packet.x, packet.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Central marker
        ctx.fillStyle = `rgba(40,40,40,${0.8 * pulse})`;
        ctx.beginPath();
        ctx.arc(packet.x, packet.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw interference pattern nodes (where waves cancel)
      const nodeThreshold = 0.1;
      ctx.fillStyle = 'rgba(30,30,30,0.6)';
      for (let i = 0; i < gridSize; i += 4) {
        for (let j = 0; j < gridSize; j += 4) {
          if (Math.abs(waveField[i][j]) < nodeThreshold) {
            const x = i * (width / gridSize);
            const y = j * (height / gridSize);
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, width, height);
    };
  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, background: '#F0EEE6', overflow: 'hidden' }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

// Differs from others by: Simulates quantum wave packet behavior using Schrödinger equation with superposition and probability density - no other visual implements quantum mechanics

const metadata = {
  themes: "quantum superposition, wave-particle duality, probability collapse",
  visualisation: "Quantum wave packets interfere and collapse showing probability distributions",
  promptSuggestion: "1. Adjust wave packet dispersion\n2. Vary interference patterns\n3. Control probability visualization"
};
(WavePackets as any).metadata = metadata;

export default WavePackets;
