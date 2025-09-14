// Themes: avalanches, terraces, grain meditation
// Visualisation: A crystalline terrace emerges from gentle grain toppling
// Unique mechanism: Abelian sandpile with limited topplings per frame and grayscale rendering

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const AbelianSandGarden: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();

  useEffect(()=>{
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 987654321 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    const gx = Math.max(120, Math.floor(width/8));
    const gy = Math.max(120, Math.floor(height/8));
    const grid = new Int16Array(gx*gy);
    const I = (x:number,y:number)=>x+y*gx;

    const addRate = 200;
    const maxTopplesPerFrame = Math.floor((gx*gy)/2);

    const step = ()=>{
      // Add grains near the center
      for(let i=0;i<addRate;i++){
        const x = (gx/2 + (rnd()*20-10))|0;
        const y = (gy/2 + (rnd()*20-10))|0;
        if (x>=0&&x<gx&&y>=0&&y<gy) grid[I(x,y)]++;
      }
      // Topple limited count per frame
      let count = 0; let any=true;
      while(any && count < maxTopplesPerFrame){
        any = false;
        for(let y=1;y<gy-1;y++){
          for(let x=1;x<gx-1;x++){
            const i = I(x,y);
            if (grid[i] > 3){
              grid[i] -= 4;
              grid[I(x+1,y)]++;
              grid[I(x-1,y)]++;
              grid[I(x,y+1)]++;
              grid[I(x,y-1)]++;
              any = true; count++;
              if (count >= maxTopplesPerFrame) break;
            }
          }
          if (count >= maxTopplesPerFrame) break;
        }
      }
    };

    const img = ctx.createImageData(gx, gy);
    const off = document.createElement('canvas'); off.width=gx; off.height=gy;
    const octx = off.getContext('2d')!;

    const render = ()=>{
      // Trails
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0,0,width,height);

      step();

      // Draw
      let k=0;
      for(let y=0;y<gy;y++){
        for(let x=0;x<gx;x++){
          const h = grid[I(x,y)] & 3; // modulo classes 0..3
          const c = 230 - h*40;
          img.data[k++]=c; img.data[k++]=c; img.data[k++]=c; img.data[k++]=255;
        }
      }
      octx.putImageData(img,0,0);
      (ctx as CanvasRenderingContext2D).imageSmoothingEnabled=false;
      ctx.drawImage(off, 0, 0, width, height);

      raf.current = requestAnimationFrame(render);
    };
    raf.current = requestAnimationFrame(render);
    return ()=>{ if(raf.current) cancelAnimationFrame(raf.current); ctx.clearRect(0,0,width,height); };
  },[width,height]);

  return <div style={{width:`${width}px`,height:`${height}px`,background:'#F0EEE6',overflow:'hidden'}}>
    <canvas ref={ref} width={width} height={height} style={{width:'100%',height:'100%'}}/>
  </div>
};

const metadata = {
  themes: "sandpile,avalanches,terraces,calm",
  visualisation: "Crystalline terraces from gentle avalanches",
  promptSuggestion: "1. Keep topple limit low\n2. Center-fed grains\n3. Gentle grayscale"
};
(AbelianSandGarden as any).metadata = metadata;

export default AbelianSandGarden;

// Differs from others by: discrete Abelian sandpile toppling dynamics

