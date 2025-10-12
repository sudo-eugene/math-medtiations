// Themes: standard map, toral twist, scatter
// Visualisation: Twisting scatter from the Chirikov standard map on a torus
// Unique mechanism: Iteration on [0,2π)^2 with wrap; projected as a stippled field

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

const StandardMapTwist: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 66779933 >>> 0; const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);
    
    // Multiple trajectories for richer chaotic patterns
    const trajectories = Array.from({ length: 12 }, () => ({
      theta: rnd() * Math.PI * 2,
      p: rnd() * Math.PI * 2,
      K: 0.8 + rnd() * 0.6 // Vary K for different chaotic behaviors (0.8-1.4)
    }));
    
    const TWO_PI = Math.PI * 2;
    const mod = (n: number) => ((n % TWO_PI) + TWO_PI) % TWO_PI;
    
    const render = ()=>{
      ctx.fillStyle='rgba(240,238,230,0.008)'; ctx.fillRect(0,0,width,height);
      
      // Soft pencil-like dark grey with varied opacity for depth
      trajectories.forEach((traj, idx) => {
        // Vary opacity between trajectories for layered pencil effect
        const opacity = 0.4 + (idx / trajectories.length) * 0.2;
        ctx.fillStyle=`rgba(25,25,28,${opacity})`;
        
        for (let i=0;i<4000;i++){
          // Standard map iteration
          traj.p = mod(traj.p + traj.K * Math.sin(traj.theta)); 
          traj.theta = mod(traj.theta + traj.p);
          
          // Map both theta and p to canvas (proper torus visualization)
          const x = traj.theta / TWO_PI; 
          const y = traj.p / TWO_PI;
          const px = (x * width) | 0; 
          const py = (y * height) | 0;
          
          // Vary particle size slightly for more organic pencil feel
          const size = 1 + (i % 15 === 0 ? 1 : 0);
          ctx.fillRect(px, py, size, size);
        }
      });
      
      raf.current = requestAnimationFrame(render);
    };
    raf.current = requestAnimationFrame(render);
    return ()=>{ if(raf.current) cancelAnimationFrame(raf.current); ctx.clearRect(0,0,width,height); };
  },[width,height]);

  return <div style={{width:`${width}px`,height:`${height}px`, background:'#F0EEE6', overflow:'hidden'}}>
    <canvas ref={ref} width={width} height={height} style={{width:'100%',height:'100%'}}/>
  </div>;
};

const metadata = {
  themes: 'standard-map,twist,torus,ink',
  visualisation: 'Twisting dots from the standard map',
  promptSuggestion: '1. Keep K near 1\n2. Many steps\n3. Very low alpha'
};
(StandardMapTwist as any).metadata = metadata;

export default StandardMapTwist;

// Differs from others by: Chirikov standard map on a torus, visualized via angle embedding

