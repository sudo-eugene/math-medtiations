import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const InteractiveFluidSimulation: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Random circular movement system
    let time = 0;
    let emitter = {
      x: width / 2,
      y: height / 2,
      centerX: width / 2,
      centerY: height / 2,
      radius: 50 + Math.random() * 100,
      angle: 0,
      speed: 0.02 + Math.random() * 0.03,
      radiusSpeed: 0.01 + Math.random() * 0.02,
      active: true
    };

    const updateEmitter = () => {
      time += 1;
      
      // Vary the circular movement parameters over time
      emitter.speed = 0.02 + Math.sin(time * 0.01) * 0.02;
      emitter.radius = 50 + Math.sin(time * 0.005) * 80;
      
      // Move the center point in a larger, slower circle
      const centerRadius = Math.min(width, height) * 0.3;
      emitter.centerX = width / 2 + Math.cos(time * 0.003) * centerRadius;
      emitter.centerY = height / 2 + Math.sin(time * 0.003) * centerRadius;
      
      // Update emitter position in circular motion
      emitter.angle += emitter.speed;
      emitter.x = emitter.centerX + Math.cos(emitter.angle) * emitter.radius;
      emitter.y = emitter.centerY + Math.sin(emitter.angle) * emitter.radius;
      
      // Keep emitter within bounds without bouncing
      const margin = 50;
      if (emitter.x < margin || emitter.x > width - margin || 
          emitter.y < margin || emitter.y > height - margin) {
        // Smoothly redirect toward center
        emitter.centerX += (width / 2 - emitter.centerX) * 0.01;
        emitter.centerY += (height / 2 - emitter.centerY) * 0.01;
      }
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = Math.random() * 4 - 2;
        this.vy = Math.random() * 4 - 2;
        this.life = 100;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.life--;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.life / 100})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    let particles: Particle[] = [];

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      updateEmitter();
      
      // Continuously emit particles with varying intensity
      const emissionRate = 3 + Math.sin(time * 0.05) * 2;
      for (let i = 0; i < emissionRate; i++) {
        particles.push(new Particle(emitter.x, emitter.y));
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      // No event listeners to clean up
    };
  }, [width, height]);

  return <canvas ref={canvasRef} />;
};

export default InteractiveFluidSimulation;
