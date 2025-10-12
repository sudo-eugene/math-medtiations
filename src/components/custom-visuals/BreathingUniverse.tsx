import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: cosmic respiration, inhaling starlight, exhaling galaxies
// visualization: gently breathing field where stars drift toward the heart and galaxies unfurl on the out-breath

const smoothStep = (t: number) => t * t * (3 - 2 * t);

interface StarParticle {
  originX: number;
  originY: number;
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinklePhase: number;
  twinkleSpeed: number;
  life: number;
}

interface GalaxyParticle {
  originX: number;
  originY: number;
  radius: number;
  targetRadius: number;
  rotation: number;
  rotationSpeed: number;
  arms: number;
  density: number;
  life: number;
  wobble: number;
}

const BreathingUniverse: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = width / 2;
    const centerY = height / 2;
    const fieldRadius = Math.min(width, height) * 0.45;

    let time = 0;
    let stars: StarParticle[] = [];
    let galaxies: GalaxyParticle[] = [];

    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const initialise = () => {
      stars = [];
      galaxies = [];

      const starCount = Math.floor((width * height) / 2200);
      for (let i = 0; i < starCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * fieldRadius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        stars.push({
          originX: x,
          originY: y,
          x,
          y,
          size: 0.8 + Math.random() * 1.6,
          brightness: 0.5 + Math.random() * 0.5,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.015 + Math.random() * 0.02,
          life: 0.6 + Math.random() * 0.4,
        });
      }

      const galaxySlots = 5;
      for (let i = 0; i < galaxySlots; i++) {
        const a = (i / galaxySlots) * Math.PI * 2 + Math.random() * 0.4;
        const r = fieldRadius * (0.25 + Math.random() * 0.35);
        const x = centerX + Math.cos(a) * r;
        const y = centerY + Math.sin(a) * r;
        galaxies.push({
          originX: x,
          originY: y,
          radius: 0,
          targetRadius: 12 + Math.random() * 20,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.006,
          arms: 3 + Math.floor(Math.random() * 3),
          density: 0.35 + Math.random() * 0.25,
          life: 0,
          wobble: Math.random() * Math.PI * 2,
        });
      }
    };

    const drawField = (phase: number, direction: number) => {
      const eased = smoothStep(phase);
      const envelope = 0.15 + eased * 0.2;

      const radialGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        fieldRadius * 1.1,
      );
      radialGradient.addColorStop(0, `rgba(35, 35, 35, ${envelope})`);
      radialGradient.addColorStop(1, 'rgba(35, 35, 35, 0)');
      ctx.fillStyle = radialGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, fieldRadius * 1.1, 0, Math.PI * 2);
      ctx.fill();

      const lineCount = 36;
      const directionWeight = smoothStep((direction + 1) / 2);
      ctx.strokeStyle = `rgba(30, 30, 30, ${0.08 + 0.12 * eased})`;
      ctx.lineWidth = 0.6;
      ctx.setLineDash([4, 18]);

      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const oscillation = 1 + directionWeight * 0.18 * Math.sin(angle * 3 + time * 0.003);
        const radius = fieldRadius * oscillation;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      const coreSize = 16 + eased * 10;
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize * 1.8);
      coreGradient.addColorStop(0, `rgba(25, 25, 25, ${0.25 + eased * 0.35})`);
      coreGradient.addColorStop(1, 'rgba(25, 25, 25, 0)');
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreSize * 1.8, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      time += 1;
      const breathCycle = time * 0.0035;
      const rawPhase = (Math.sin(breathCycle) + 1) / 2;
      const phase = smoothStep(rawPhase);
      const direction = Math.cos(breathCycle); // positive: inhaling, negative: exhaling

      drawField(phase, direction);

      const inhaleWeightRaw = Math.max(0, direction);
      const exhaleWeightRaw = Math.max(0, -direction);
      const weightSum = inhaleWeightRaw + exhaleWeightRaw || 1;
      const inhaleWeight = inhaleWeightRaw / weightSum;
      const exhaleWeight = exhaleWeightRaw / weightSum;

      stars.forEach((star, index) => {
        star.twinklePhase += star.twinkleSpeed;

        const dx = star.originX - centerX;
        const dy = star.originY - centerY;
        const inwardStrength = phase * 0.45;
        const outwardStrength = (1 - phase) * 0.35;
        const displacement = -inwardStrength * inhaleWeight + outwardStrength * exhaleWeight;
        const scale = 1 + displacement;
        star.x = centerX + dx * scale;
        star.y = centerY + dy * scale;

        const twinkle = Math.sin(star.twinklePhase + index * 0.3) * 0.25 + 0.75;
        const targetLife = 0.25 + exhaleWeight * 0.6 + phase * 0.15;
        star.life += (targetLife - star.life) * 0.04;

        const alpha = star.life * star.brightness * twinkle;
        if (alpha < 0.02) return;

        const glowRadius = star.size * 4;
        const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowRadius);
        glow.addColorStop(0, `rgba(30, 30, 30, ${alpha * 0.9})`);
        glow.addColorStop(1, 'rgba(30, 30, 30, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(20, 20, 20, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      galaxies.forEach((galaxy, index) => {
        galaxy.rotation += galaxy.rotationSpeed;
        galaxy.wobble += 0.004 + index * 0.0003;

        const activation = smoothStep(exhaleWeight);
        const targetRadius = galaxy.targetRadius * activation;
        galaxy.radius += (targetRadius - galaxy.radius) * 0.06;

        const targetLife = activation * (0.5 + phase * 0.5);
        galaxy.life += (targetLife - galaxy.life) * 0.04;

        if (galaxy.life < 0.05) {
          galaxy.radius *= 0.96;
        }
      });

      galaxies = galaxies.filter(galaxy => galaxy.radius > 0.6 || galaxy.life > 0.05);

      const desiredGalaxyCount = 5;
      if (galaxies.length < desiredGalaxyCount) {
        const seed = time + galaxies.length * 17;
        const angle = (seededRandom(seed) * Math.PI * 2);
        const radius = fieldRadius * (0.25 + seededRandom(seed + 1) * 0.35);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        galaxies.push({
          originX: x,
          originY: y,
          radius: 0,
          targetRadius: 12 + seededRandom(seed + 2) * 20,
          rotation: seededRandom(seed + 3) * Math.PI * 2,
          rotationSpeed: (seededRandom(seed + 4) - 0.5) * 0.006,
          arms: 3 + Math.floor(seededRandom(seed + 5) * 3),
          density: 0.35 + seededRandom(seed + 6) * 0.25,
          life: 0,
          wobble: seededRandom(seed + 7) * Math.PI * 2,
        });
      }

      galaxies.forEach(galaxy => {
        if (galaxy.radius < 0.4 || galaxy.life < 0.05) return;

        ctx.save();
        ctx.translate(galaxy.originX, galaxy.originY);
        ctx.rotate(galaxy.rotation);

        const alpha = galaxy.life * galaxy.density;
        const points = 24;

        ctx.strokeStyle = `rgba(25, 25, 25, ${alpha * 0.55})`;
        ctx.lineWidth = 0.7;

        for (let arm = 0; arm < galaxy.arms; arm++) {
          const baseAngle = (arm / galaxy.arms) * Math.PI * 2;
          ctx.beginPath();
          for (let i = 0; i <= points; i++) {
            const t = i / points;
            const angle = baseAngle + t * Math.PI * 3.8;
            const spiralRadius = galaxy.radius * (0.15 + t * 0.85) * (1 + 0.12 * Math.sin(galaxy.wobble + t * 6));
            const sx = Math.cos(angle) * spiralRadius;
            const sy = Math.sin(angle) * spiralRadius;
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.stroke();
        }

        const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.radius * 0.4);
        coreGradient.addColorStop(0, `rgba(30, 30, 30, ${alpha})`);
        coreGradient.addColorStop(1, 'rgba(30, 30, 30, 0)');
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(0, 0, galaxy.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    initialise();
    animate();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      stars = [];
      galaxies = [];
    };
  }, [width, height]);

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0EEE6',
        overflow: 'hidden',
        borderRadius: '8px',
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default BreathingUniverse;
