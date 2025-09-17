import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Radial pulse fountain: concentric waves expanding and collapsing
const PulseFountain: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;

    let raf: number | null = null; let t = 0;

    const render = () => {
      t += 0.02;
      ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);
      const cx = width/2, cy = height/2;
      const maxR = Math.min(width,height)*0.48;

      for (let k=0;k<22;k++) {
        const phase = t*1.2 + k*0.4;
        const r = (0.1 + 0.9*((phase% (Math.PI*2))/ (Math.PI*2))) * maxR;
        const a = 0.4 + 0.3*Math.sin(phase*2);
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
        ctx.strokeStyle = `rgba(60,60,60,${a})`; ctx.lineWidth = 0.9; ctx.stroke();
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [width,height]);

  return (
    <div style={{ width, height, background:'#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height}/>
    </div>
  );
};

export default PulseFountain;

