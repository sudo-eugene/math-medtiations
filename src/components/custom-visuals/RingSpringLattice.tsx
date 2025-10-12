// Themes: elasticity, ripple, ring
// Visualisation: A polygonal ring ripples like a soft spring lattice
// Unique mechanism: Mass–spring ring dynamics with damping and centroid anchoring

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const RingSpringLattice: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();

  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 24680246 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    const N = 140;
    const cx = width*0.5, cy = height*0.5;
    const baseRadius = Math.min(width,height)*0.31;

    type Ring = {
      x: Float32Array;
      y: Float32Array;
      vx: Float32Array;
      vy: Float32Array;
      idealRadius: number;
      offset: number;
      hue: number;
      strokeAlpha: number;
      fillAlpha: number;
      weight: number;
    };

    const createRing = (radiusScale: number, offset: number, hue: number) => {
      const idealRadius = baseRadius * radiusScale;
      const x = new Float32Array(N);
      const y = new Float32Array(N);
      const vx = new Float32Array(N);
      const vy = new Float32Array(N);
      for(let i=0;i<N;i++){
        const a = i/N * Math.PI*2 + offset;
        const rJitter = idealRadius * (0.985 + rnd()*0.02);
        x[i] = cx + Math.cos(a) * rJitter;
        y[i] = cy + Math.sin(a) * rJitter;
      }
      return { x, y, vx, vy, idealRadius, offset, hue, strokeAlpha: 0.28, fillAlpha: 0.08, weight: 0.9 };
    };

    const rings: Ring[] = [
      createRing(1.0, 0, 206),
      createRing(0.82, Math.PI/12, 198),
      createRing(1.16, -Math.PI/18, 214),
    ];

    const k = 0.024;
    const kd = 0.11;
    const kr = 0.001;
    const dt = 1.0;

    const drawBackground = () => {
      const radial = ctx.createRadialGradient(cx, cy, baseRadius * 0.1, cx, cy, Math.max(width,height)*0.7);
      radial.addColorStop(0, '#F5F1E7');
      radial.addColorStop(0.6, '#E7ECEF');
      radial.addColorStop(1, '#D6E0E5');
      ctx.fillStyle = radial;
      ctx.fillRect(0,0,width,height);

      const veil = ctx.createLinearGradient(0, 0, width, height);
      veil.addColorStop(0, 'rgba(188, 202, 214, 0.12)');
      veil.addColorStop(0.5, 'rgba(210, 220, 228, 0.08)');
      veil.addColorStop(1, 'rgba(174, 188, 198, 0.12)');
      ctx.fillStyle = veil;
      ctx.fillRect(0,0,width,height);
    };

    const render = ()=>{
      drawBackground();

      ctx.globalCompositeOperation = 'lighter';

      rings.forEach((ring, index) => {
        const { x, y, vx, vy, idealRadius, hue } = ring;

        for(let i=0;i<N;i++){
          const ip = (i+1)%N;
          const im = (i-1+N)%N;
          const dx = x[i] - cx;
          const dy = y[i] - cy;
          const dist = Math.hypot(dx, dy) || 1;
          const targetX = cx + dx/dist * idealRadius;
          const targetY = cy + dy/dist * idealRadius;
          const ax = (x[ip]+x[im]-2*x[i])*k - vx[i]*kd + (targetX - x[i]) * kr;
          const ay = (y[ip]+y[im]-2*y[i])*k - vy[i]*kd + (targetY - y[i]) * kr;
          vx[i] += ax*dt;
          vy[i] += ay*dt;
        }

        for(let i=0;i<N;i++){
          x[i] += vx[i]*dt;
          y[i] += vy[i]*dt;
        }

        ctx.fillStyle = `hsla(${hue}, 32%, 34%, ${ring.fillAlpha})`;
        ctx.strokeStyle = `hsla(${hue}, 26%, 26%, ${ring.strokeAlpha})`;
        ctx.lineWidth = 1 + index * 0.25;

        ctx.beginPath();
        ctx.moveTo(x[0], y[0]);
        for(let i=1;i<N;i++) ctx.lineTo(x[i], y[i]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      ctx.globalCompositeOperation = 'source-over';
      const innerGlow = ctx.createRadialGradient(cx, cy, baseRadius * 0.2, cx, cy, baseRadius * 1.05);
      innerGlow.addColorStop(0, 'rgba(255,255,255,0.12)');
      innerGlow.addColorStop(1, 'rgba(220,232,238,0)');
      ctx.fillStyle = innerGlow;
      ctx.fillRect(0,0,width,height);

      raf.current = requestAnimationFrame(render);
    };
    raf.current = requestAnimationFrame(render);

    return ()=>{ if(raf.current) cancelAnimationFrame(raf.current); ctx.clearRect(0,0,width,height); };
  },[width,height]);

  return <div style={{width:`${width}px`,height:`${height}px`,background:'#F0EEE6',overflow:'hidden'}}>
    <canvas ref={ref} width={width} height={height} style={{width:'100%',height:'100%'}}/>
  </div>;
};

const metadata = {
  themes: "spring,ring,ripple,elastic",
  visualisation: "Soft polygonal ring rippling",
  promptSuggestion: "1. Keep damping high\n2. Many nodes\n3. Thin strokes"
};
(RingSpringLattice as any).metadata = metadata;

export default RingSpringLattice;

// Differs from others by: mass–spring ring dynamics with centroidal restoration
