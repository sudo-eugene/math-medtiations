// Themes: blue-noise, static field, gentle drift
// Visualisation: A cloud of points relaxes to even spacing then sways
// Unique mechanism: Short-range repulsion with uniform grid neighbor lookup for blue-noise relaxation

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const BlueNoiseRelaxation: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();

  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 1357911 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    const N = 1200;
    const pts = new Float32Array(N*4); // x,y,vx,vy
    for(let i=0;i<N;i++){
      pts[i*4] = rnd()*width;
      pts[i*4+1] = rnd()*height;
      pts[i*4+2] = 0; pts[i*4+3] = 0;
    }
    const radius = Math.max(6, Math.min(width,height)/100);
    const cell = radius;
    const cols = Math.ceil(width/cell);
    const rows = Math.ceil(height/cell);
    const buckets = new Int32Array(cols*rows).fill(-1);
    const next = new Int32Array(N);

    const buildGrid = ()=>{
      buckets.fill(-1);
      for(let i=0;i<N;i++){
        const x=pts[i*4], y=pts[i*4+1];
        const cx = Math.max(0, Math.min(cols-1, (x/cell)|0));
        const cy = Math.max(0, Math.min(rows-1, (y/cell)|0));
        const b = cx + cy*cols;
        next[i] = buckets[b];
        buckets[b] = i;
      }
    };

    const render = (tms: number)=>{
      // Trails
      ctx.fillStyle='rgba(240,238,230,0.05)';
      ctx.fillRect(0,0,width,height);

      buildGrid();

      const k = 0.015;
      const damp = 0.9;
      for(let i=0;i<N;i++){
        const x = pts[i*4], y = pts[i*4+1];
        let ax = 0, ay = 0;
        const cx = Math.max(0, Math.min(cols-1, (x/cell)|0));
        const cy = Math.max(0, Math.min(rows-1, (y/cell)|0));
        for(let oy=-1;oy<=1;oy++){
          for(let ox=-1;ox<=1;ox++){
            const cxx = cx+ox, cyy = cy+oy;
            if (cxx<0||cxx>=cols||cyy<0||cyy>=rows) continue;
            let j = buckets[cxx + cyy*cols];
            while(j !== -1){
              if (j !== i){
                const dx = x - pts[j*4], dy = y - pts[j*4+1];
                const d2 = dx*dx + dy*dy + 0.0001;
                if (d2 < radius*radius){
                  const inv = 1.0/Math.sqrt(d2);
                  const w = (radius*inv - 1);
                  ax += dx * w * k;
                  ay += dy * w * k;
                }
              }
              j = next[j];
            }
          }
        }
        // Soft boundary
        ax += (width*0.5 - x) * 0.0002;
        ay += (height*0.5 - y) * 0.0002;

        pts[i*4+2] = pts[i*4+2]*damp + ax;
        pts[i*4+3] = pts[i*4+3]*damp + ay;
        pts[i*4] += pts[i*4+2];
        pts[i*4+1] += pts[i*4+3];
      }

      // Draw
      ctx.fillStyle='rgba(20,20,20,0.35)';
      for(let i=0;i<N;i++){
        ctx.fillRect(pts[i*4]|0, pts[i*4+1]|0, 1, 1);
      }

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
  themes: "blue-noise,points,relaxation,calm",
  visualisation: "Points relax into even spacing, gently breathing",
  promptSuggestion: "1. Keep radius modest\n2. Prefer small points\n3. Gentle drift forces"
};
(BlueNoiseRelaxation as any).metadata = metadata;

export default BlueNoiseRelaxation;

// Differs from others by: blue-noise relaxation with grid-accelerated short-range repulsion

