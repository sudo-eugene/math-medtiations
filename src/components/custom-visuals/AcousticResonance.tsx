import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: harmonic resonance, vibrational frequencies, sound geometry manifesting
// visualization: Sound waves creating geometric patterns through harmonic ratios and standing waves

const AcousticResonance: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isWhiteSnapshot = (() => {
    if (typeof window === 'undefined') {
      return false;
    }
    const params = new URLSearchParams(window.location.search);
    return window.location.pathname.includes('/snapshot') && params.get('bg') === 'white';
  })();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    let time = 0;

    type Ring = {
      baseRadius: number;
      modulation: number;
      harmonic: number;
      speed: number;
      phase: number;
      stroke: string;
      glow: string;
    };

    type Arc = {
      radius: number;
      width: number;
      length: number;
      speed: number;
      offset: number;
      opacity: number;
    };

    const maxRadius = Math.min(width, height) * 0.45;

    const rings: Ring[] = Array.from({ length: 5 }, (_, i) => {
      const fraction = 0.26 + i * 0.13;
      return {
        baseRadius: maxRadius * fraction,
        modulation: 9 - i * 1.4,
        harmonic: 6 + i * 2,
        speed: 0.0009 + i * 0.00045,
        phase: i * Math.PI * 0.35,
        stroke: `rgba(${92 + i * 7}, ${134 + i * 8}, ${150 + i * 5}, ${0.56 - i * 0.06})`,
        glow: `rgba(${210 - i * 6}, ${224 - i * 4}, ${225 - i * 3}, ${0.22 - i * 0.03})`,
      };
    });

    const arcs: Arc[] = [
      { radius: maxRadius * 0.42, width: 3.4, length: Math.PI / 4, speed: 0.0012, offset: 0.8, opacity: 0.35 },
      { radius: maxRadius * 0.55, width: 2.8, length: Math.PI / 5, speed: 0.0008, offset: 1.7, opacity: 0.28 },
      { radius: maxRadius * 0.32, width: 3.8, length: Math.PI / 3.2, speed: 0.001, offset: -0.4, opacity: 0.4 },
    ];

    let animationId: number | null = null;

    const drawAmbientGradient = () => {
      if (isWhiteSnapshot) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        return;
      }
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        Math.max(width, height) * 0.06,
        centerX,
        centerY,
        Math.max(width, height) * 0.82
      );

      gradient.addColorStop(0, 'rgba(246, 245, 240, 1)');
      gradient.addColorStop(0.5, 'rgba(228, 234, 236, 0.96)');
      gradient.addColorStop(1, 'rgba(207, 220, 225, 0.9)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    const drawRadialGuides = () => {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.00035);
      ctx.strokeStyle = 'rgba(142, 164, 170, 0.16)';
      ctx.lineWidth = 1;

      const spokes = 8;
      for (let i = 0; i < spokes; i++) {
        const angle = (Math.PI * 2 * i) / spokes;
        const x = Math.cos(angle) * maxRadius * 1.05;
        const y = Math.sin(angle) * maxRadius * 1.05;

        ctx.beginPath();
        ctx.moveTo(x * 0.2, y * 0.2);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawRings = () => {
      ctx.save();
      ctx.lineJoin = 'round';

      rings.forEach((ring) => {
        const steps = 360;
        ctx.beginPath();

        for (let s = 0; s <= steps; s++) {
          const angle = (s / steps) * Math.PI * 2;
          const modulation = Math.sin(angle * ring.harmonic + time * ring.speed + ring.phase);
          const radius = ring.baseRadius + modulation * ring.modulation;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          if (s === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.closePath();
        ctx.strokeStyle = ring.stroke;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        const glowRadius = ring.baseRadius + ring.modulation + 18;
        const fillGradient = ctx.createRadialGradient(centerX, centerY, ring.baseRadius * 0.65, centerX, centerY, glowRadius);
        fillGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        fillGradient.addColorStop(1, ring.glow);
        ctx.fillStyle = fillGradient;
        ctx.fill();
      });

      ctx.restore();
    };

    const drawArcHighlights = () => {
      ctx.save();
      ctx.lineCap = 'round';

      arcs.forEach((arc, index) => {
        const arcTime = time * arc.speed + arc.offset;
        const span = arc.length + Math.sin(time * 0.0012 + index) * 0.2;
        const dynamicRadius = arc.radius + Math.sin(time * 0.0009 + index) * 6;

        ctx.strokeStyle = `rgba(186, 210, 216, ${arc.opacity})`;
        ctx.lineWidth = arc.width;
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(dynamicRadius, 0), arcTime, arcTime + span);
        ctx.stroke();
      });

      ctx.restore();
    };

    const drawCenterHalo = () => {
      const innerRadius = maxRadius * 0.18;

      const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, innerRadius);
      innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.82)');
      innerGradient.addColorStop(1, 'rgba(226, 235, 236, 0.0)');

      ctx.fillStyle = innerGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
      ctx.fill();

      const haloGradient = ctx.createRadialGradient(centerX, centerY, innerRadius * 0.9, centerX, centerY, innerRadius * 1.6);
      haloGradient.addColorStop(0, 'rgba(142, 168, 176, 0.35)');
      haloGradient.addColorStop(1, 'rgba(142, 168, 176, 0)');

      ctx.fillStyle = haloGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(128, 156, 164, 0.42)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
      ctx.stroke();
    };

    const animate = () => {
      drawAmbientGradient();
      drawRadialGuides();
      drawRings();
      drawArcHighlights();
      drawCenterHalo();

      time += 0.9;

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [width, height, isWhiteSnapshot]);

  return (
    <div style={{ 
      width: `${width}px`, 
      height: `${height}px`, 
      backgroundColor: isWhiteSnapshot ? '#ffffff' : '#F0EEE6' 
    }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default AcousticResonance;
