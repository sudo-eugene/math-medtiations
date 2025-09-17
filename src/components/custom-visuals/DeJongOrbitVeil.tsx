// Themes: strange attractor, orbit plot, veil
// Visualisation: Dense wisps accumulate into an intricate de Jong attractor
// Unique mechanism: Peter de Jong map orbit plotting with low-alpha accumulation

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const DeJongOrbitVeil: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const rafRef = useRef<number|undefined>();
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;

    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, width, height);

    // PRNG
    let s = 12398711 >>> 0;
    const rnd = () => (s = (1664525*s + 1013904223)>>>0, s/4294967296);

    // Peter de Jong parameters
    const a = 2.01 + (rnd()*0.06 - 0.03);
    const b = -2.53 + (rnd()*0.06 - 0.03);
    const c = 1.61 + (rnd()*0.06 - 0.03);
    const d = -0.33 + (rnd()*0.06 - 0.03);

    let x = 0.1*(rnd()*2-1), y = 0.1*(rnd()*2-1);
    const scale = Math.min(width, height) * 0.35;
    const cx = width*0.5, cy = height*0.5;

    const render = () => {
      // Trails
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0,0,width,height);
      ctx.fillStyle = 'rgba(20,20,20,0.05)';

      for (let i=0;i<20000;i++){
        const nx = Math.sin(a*y) - Math.cos(b*x);
        const ny = Math.sin(c*x) - Math.cos(d*y);
        x = nx; y = ny;
        const px = cx + x*scale;
        const py = cy + y*scale;
        if (px>=0 && px<width && py>=0 && py<height) ctx.fillRect(px|0, py|0, 1, 1);
      }

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); ctx.clearRect(0,0,width,height); };
  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, background:'#F0EEE6', overflow:'hidden' }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ width:'100%', height:'100%' }} />
    </div>
  );
};

const metadata = {
  themes: 'attractor,dejong,ink,veil',
  visualisation: 'Wispy de Jong attractor in grayscale ink',
  promptSuggestion: '1. Keep alpha tiny\n2. Many iterations/frame\n3. Gentle scale'
};
(DeJongOrbitVeil as any).metadata = metadata;

export default DeJongOrbitVeil;

// Differs from others by: Peter de Jong map equations (distinct from Clifford) and pure orbit accumulation

