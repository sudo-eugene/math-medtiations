// Themes: Halvorsen attractor, halo, projection
// Visualisation: A halo-like ink ring from the Halvorsen attractor
// Unique mechanism: 3D Halvorsen ODE integrated and projected with gentle rotation

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const HalvorsenHalo: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    // PRNG for initial conditions
    let s = 88776655>>>0; const rnd=()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);
    
    const resetTrajectory = () => ({
      x: (rnd() - 0.5) * 0.4,
      y: (rnd() - 0.5) * 0.4,
      z: (rnd() - 0.5) * 0.4,
      a: 1.35 + rnd() * 0.2 // Vary a parameter (1.35-1.55) for stable behaviors
    });
    
    // Multiple trajectories for richer visual with varied initial conditions
    const trajectories = Array.from({ length: 6 }, resetTrajectory);
    
    const dt=0.008; // Smaller timestep for better stability
    const cx = width*0.5, cy = height*0.5; const scale = Math.min(width,height)*0.2;
    const maxRadius = 25; // Reset if trajectory escapes too far
    
    const render = (tms:number)=>{
      // Soft pencil trail fade
      ctx.fillStyle='rgba(240,238,230,0.01)'; ctx.fillRect(0,0,width,height);
      
      // Dual rotation: slow around Y, gentle around X
      const th = tms*0.001*0.18; 
      const ph = tms*0.001*0.12;
      const cth=Math.cos(th), sth=Math.sin(th);
      const cph=Math.cos(ph), sph=Math.sin(ph);
      
      trajectories.forEach((traj, idx) => {
        // Vary opacity and size for depth
        const opacity = 0.45 + (idx / trajectories.length) * 0.2;
        const size = 1 + (idx % 2);
        ctx.fillStyle=`rgba(25,25,28,${opacity})`;
        
        for(let i=0;i<800;i++){
          // Halvorsen dynamics
          const dx = -traj.a*traj.x - 4*traj.y - 4*traj.z - traj.y*traj.y;
          const dy = -traj.a*traj.y - 4*traj.z - 4*traj.x - traj.z*traj.z;
          const dz = -traj.a*traj.z - 4*traj.x - 4*traj.y - traj.x*traj.x;
          traj.x += dx*dt; traj.y += dy*dt; traj.z += dz*dt;
          
          // Check for instability and reset if needed
          const r2 = traj.x*traj.x + traj.y*traj.y + traj.z*traj.z;
          if (r2 > maxRadius*maxRadius || !isFinite(r2)) {
            Object.assign(traj, resetTrajectory());
          }
          
          // Dual rotation for more dynamic view
          let X = cth*traj.x + sth*traj.z;
          let Z = -sth*traj.x + cth*traj.z;
          let Y = cph*traj.y - sph*Z;
          Z = sph*traj.y + cph*Z;
          
          const px = cx + X*scale; const py = cy + Y*scale;
          if (px>=0&&px<width&&py>=0&&py<height) ctx.fillRect(px|0, py|0, size, size);
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
  themes: 'halvorsen,attractor,halo,ink',
  visualisation: 'Halvorsen halo in stippled ink',
  promptSuggestion: '1. Keep a~1.4\n2. Many samples\n3. Slow rotation'
};
(HalvorsenHalo as any).metadata = metadata;

export default HalvorsenHalo;

// Differs from others by: Halvorsen attractor’s quadratic coupling producing a halo-like projection

