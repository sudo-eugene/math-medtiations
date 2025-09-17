// Themes: branching, growth, delta
// Visualisation: A river-delta-like branching system grows over time
// Unique mechanism: L-system expansion interpreted by a turtle, progressively rendered

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const DeltaBranchingLSystem: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();

  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 90909091 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    // L-system
    let axiom = "F";
    const rules: Record<string,string> = {
      "F": "F[+F]F[-F]F"
    };
    let str = axiom;
    const iterations = 4;
    for(let i=0;i<iterations;i++){
      let next = "";
      for(const ch of str){
        next += rules[ch] ?? ch;
      }
      str = next;
    }

    // Turtle
    const segments: {x1:number,y1:number,x2:number,y2:number}[] = [];
    let x = width*0.5, y = height*0.9, a = -Math.PI/2;
    const stack: {x:number,y:number,a:number}[] = [];
    const step = Math.min(width,height) * 0.0085;
    const ang = Math.PI/8;

    for(const ch of str){
      if (ch === 'F'){
        const nx = x + Math.cos(a)*step;
        const ny = y + Math.sin(a)*step;
        segments.push({x1:x,y1:y,x2:nx,y2:ny});
        x = nx; y = ny;
      } else if (ch === '+'){ a += ang; }
      else if (ch === '-') { a -= ang; }
      else if (ch === '['){ stack.push({x,y,a}); }
      else if (ch === ']'){ const s = stack.pop(); if (s){ x=s.x; y=s.y; a=s.a; } }
    }

    let drawCount = 0;
    const render = ()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)';
      ctx.fillRect(0,0,width,height);

      ctx.strokeStyle='rgba(20,20,20,0.2)';
      ctx.lineWidth=1;
      const inc = 80;
      drawCount = Math.min(segments.length, drawCount + inc);
      for(let i=0;i<drawCount;i++){
        const seg = segments[i];
        ctx.beginPath(); ctx.moveTo(seg.x1, seg.y1); ctx.lineTo(seg.x2, seg.y2); ctx.stroke();
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
  themes: "branching,delta,growth,ink",
  visualisation: "River-delta branching grows frame by frame",
  promptSuggestion: "1. Modest iterations\n2. Progressive draw\n3. Keep strokes subtle"
};
(DeltaBranchingLSystem as any).metadata = metadata;

export default DeltaBranchingLSystem;

// Differs from others by: L-system turtle interpretation with progressive reveal

