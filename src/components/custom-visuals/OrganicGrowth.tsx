import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Scale {
  x: number;
  y: number;
  angle: number;
  size: number;
  targetSize: number;
  delay: number;
  reverseDelay: number;
  birth: number;
  opacity: number;
  currentSize?: number;
  isReversing?: boolean;
  update(time: number, isReversing: boolean, totalTime: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
  isComplete(): boolean;
  shouldStart(totalTime: number, isReversing: boolean): boolean;
}

const OrganicGrowth: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const totalTimeRef = useRef<number>(0);
  const scalesRef = useRef<Scale[]>([]);
  const isReversingRef = useRef<boolean>(false);

  class ScaleImpl implements Scale {
    x: number;
    y: number;
    angle: number;
    size: number;
    targetSize: number;
    delay: number;
    reverseDelay: number;
    birth: number;
    opacity: number;
    currentSize: number;

    constructor(x: number, y: number, angle: number, delay: number, index: number, totalScales: number) {
      this.x = x;
      this.y = y;
      this.angle = angle;
      this.size = 0;
      this.targetSize = 20;
      this.delay = delay;
      // Reverse delay is calculated to maintain the same sequential order, but in reverse order
      this.reverseDelay = (totalScales - index - 1) * 120; // Reverse the sequence
      this.birth = 0;
      this.opacity = 0;
      this.currentSize = 0;
    }

    shouldStart(totalTime: number, isReversing: boolean): boolean {
      const relevantDelay = isReversing ? this.reverseDelay : this.delay;
      return totalTime > relevantDelay;
    }
    
    update(totalTime: number, isReversing: boolean, time: number) {
      if (this.shouldStart(totalTime, isReversing)) {
        const growthRate = 0.005;
        if (isReversing) {
          this.birth = Math.max(0, this.birth - growthRate);
        } else {
          this.birth = Math.min(Math.PI/2, this.birth + growthRate);
        }
        this.size = this.targetSize * Math.sin(this.birth);
        this.opacity = Math.min(this.birth * 0.5, 1);
      }
      
      // Subtle breathing
      const breathe = Math.sin(time * 0.0008 + this.delay) * 0.05;
      this.currentSize = this.size * (1 + breathe);
    }
    
    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = this.opacity * 0.8;
      
      ctx.beginPath();
      ctx.moveTo(0, -this.currentSize/2);
      ctx.quadraticCurveTo(this.currentSize/2, 0, 0, this.currentSize/2);
      ctx.quadraticCurveTo(-this.currentSize/2, 0, 0, -this.currentSize/2);
      ctx.closePath();
      
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Subtle fill
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
      
      ctx.restore();
    }

    isComplete(): boolean {
      return this.birth >= Math.PI/2;
    }
  }


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Keep the base scale relative to a 800x800 design
    const scale = width / 800;
    canvas.width = width;
    canvas.height = height;

    // Initialize scales
    const scales: Scale[] = [];
    const numScales = 80;
    const centerX = canvas.width / 2;
    
    // Create scales in a spiral pattern
    for (let i = 0; i < numScales; i++) {
      const t = i / numScales;
      const y = canvas.height - 50 - (t * (canvas.height - 100));
      const angle = t * Math.PI * 8; // Spiral twist
      const radius = (30 + Math.sin(t * Math.PI * 2) * 20) * scale; // S-curve
      
      const x = centerX + Math.cos(angle) * radius;
      const scaleAngle = angle + Math.PI/2;
      const delay = i * 120; // Slower sequence
      
      scales.push(new ScaleImpl(x, y, scaleAngle, delay, i, numScales));
    }
    
    scalesRef.current = scales;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Check if all scales are complete
      const allComplete = scalesRef.current.every(scale => scale.isComplete());
      const allReversed = scalesRef.current.every(scale => scale.birth <= 0);
      
      // Switch direction if needed
      if (allComplete && !isReversingRef.current) {
        isReversingRef.current = true;
        totalTimeRef.current = 0; // Reset total time for reverse sequence
      } else if (allReversed && isReversingRef.current) {
        isReversingRef.current = false;
        totalTimeRef.current = 0; // Reset total time for forward sequence
      }
      
      scalesRef.current.forEach(scale => {
        scale.update(totalTimeRef.current, isReversingRef.current, timeRef.current);
        scale.draw(ctx);
      });
      
      timeRef.current += 8; // For breathing animation
      totalTimeRef.current += 8; // For growth timing
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      scalesRef.current = [];
      timeRef.current = 0;
      totalTimeRef.current = 0;
      isReversingRef.current = false;
    };
  }, [width, height]);

  return (
    <div style={{ 
      margin: 0,
      background: '#F0EEE6',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: `${width}px`,
      height: `${height}px`
    }}>
      <canvas 
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          filter: 'contrast(1.1) brightness(1.05)',
        }}
      />
    </div>
  );
};

export default OrganicGrowth;