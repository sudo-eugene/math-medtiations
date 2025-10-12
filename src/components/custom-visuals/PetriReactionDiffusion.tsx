// Themes: cellular morphogenesis, petri dish, grayscale
// Visualisation: Slowly forming cellular spots and labyrinths
// Unique mechanism: Gray–Scott reaction–diffusion simulation on a coarse grid

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const PetriReactionDiffusion: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();

  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width = width; canvas.height = height;
    ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);

    // PRNG
    let s = 42424242 >>> 0;
    const rnd = () => (s=(1664525*s+1013904223)>>>0, s/4294967296);

    const gx = Math.max(200, Math.floor(width/4));
    const gy = Math.max(140, Math.floor(height/4));
    const A = new Float32Array(gx*gy);
    const B = new Float32Array(gx*gy);
    const An = new Float32Array(gx*gy);
    const Bn = new Float32Array(gx*gy);

    const I = (x:number,y:number)=> x + y*gx;

    // Initialize
    for (let i=0;i<gx*gy;i++) A[i]=1, B[i]=0;
    // Seed center region
    const cx = (gx/2)|0, cy=(gy/2)|0;
    for (let y0=-6;y0<=6;y0++){
      for (let x0=-6;x0<=6;x0++){
        const d2 = x0*x0 + y0*y0;
        if (d2 <= 36) B[I(cx+x0, cy+y0)] = 1;
      }
    }
    for (let i=0;i<300;i++){
      const x = (rnd()*gx)|0, y=(rnd()*gy)|0;
      B[I(x,y)] = 1;
    }

    const feed = 0.0367;
    const kill = 0.0649;
    const Da = 1.0, Db = 0.5;
    const dt = 1.0;

    // Reuse buffers for drawing
    const img = ctx.createImageData(gx, gy);
    const off = document.createElement('canvas');
    off.width = gx; off.height = gy;
    const octx = off.getContext('2d')!;

    const lap = (arr: Float32Array, x: number, y: number) => {
      const xm = (x-1+gx)%gx, xp=(x+1)%gx, ym=(y-1+gy)%gy, yp=(y+1)%gy;
      return (arr[I(xm,y)] + arr[I(xp,y)] + arr[I(x,ym)] + arr[I(x,yp)] - 4*arr[I(x,y)]) * 0.25;
    };

    const step = ()=>{
      for(let y=0;y<gy;y++){
        for(let x=0;x<gx;x++){
          const i = I(x,y);
          const a = A[i], b = B[i];
          const ra = Da*lap(A,x,y) - a*b*b + feed*(1-a);
          const rb = Db*lap(B,x,y) + a*b*b - (kill+feed)*b;
          An[i] = Math.max(0, Math.min(1, a + ra*dt));
          Bn[i] = Math.max(0, Math.min(1, b + rb*dt));
        }
      }
      A.set(An); B.set(Bn);
    };

    const render = ()=>{
      // Trails clear (subtle; mostly replaced by image data for PDE)
      ctx.fillStyle = 'rgba(240,238,230,0.02)';
      ctx.fillRect(0,0,width,height);

      // Do a couple steps per frame
      step(); step();

      // Draw B as darkness
      let k=0;
      for(let y=0;y<gy;y++){
        for(let x=0;x<gx;x++){
          const v = B[I(x,y)];
          const c = Math.max(0, Math.min(255, Math.floor((1-v)*255)));
          img.data[k++] = c; img.data[k++] = c; img.data[k++] = c; img.data[k++] = 255;
        }
      }
      octx.putImageData(img,0,0);
      (ctx as CanvasRenderingContext2D).imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, width, height);

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
  themes: "reaction-diffusion,cellular,petri,grayscale",
  visualisation: "Labyrinths and spots slowly forming",
  promptSuggestion: "1. Keep grid coarse\n2. Gentle feed/kill\n3. Prefer grayscale mapping"
};
(PetriReactionDiffusion as any).metadata = metadata;

export default PetriReactionDiffusion;

// Differs from others by: Gray–Scott PDE integration (only RD simulation)
