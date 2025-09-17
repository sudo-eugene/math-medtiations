import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Array of hyperbolic paraboloid wireframes dancing gently
const HyparGarden3D: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width/height, 0.1, 2000);
    camera.position.set(0,0,240);
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(width,height); renderer.setClearColor(0xF0EEE6); ref.current.appendChild(renderer.domElement);
    const amb = new THREE.AmbientLight(0xffffff,0.8); const dir = new THREE.DirectionalLight(0xffffff,0.8); dir.position.set(6,7,9); scene.add(amb,dir);

    const mats: THREE.LineBasicMaterial[] = [];
    const frames: { line: THREE.LineSegments; pos: THREE.BufferAttribute; base: Float32Array }[] = [];
    const grid = 3; const spacing = 60;
    for (let gx=0; gx<grid; gx++) for (let gy=0; gy<grid; gy++){
      const geom = new THREE.PlaneGeometry(50, 50, 30, 30);
      const wire = new THREE.WireframeGeometry(geom);
      const mat = new THREE.LineBasicMaterial({ color: 0x444444, transparent:true, opacity: 0.45 }); mats.push(mat);
      const line = new THREE.LineSegments(wire, mat);
      line.position.set((gx-(grid-1)/2)*spacing, (gy-(grid-1)/2)*spacing, 0);
      scene.add(line);
      const pos = (geom.getAttribute('position') as THREE.BufferAttribute);
      frames.push({ line, pos, base: pos.array.slice(0) as any });
    }

    let raf: number | null = null; let t=0;
    const animate = () => {
      raf = requestAnimationFrame(animate); t+=0.02;
      frames.forEach((f, i) => {
        const p = f.pos; const b = f.base as any; const phase = t + i*0.4;
        for (let j=0;j<p.count;j++){
          const ix=3*j; const x=b[ix], y=b[ix+1];
          p.array[ix+2] = 0.14 * (x*x - y*y) * 0.02 + 4*Math.sin(0.08*x + phase) + 4*Math.cos(0.08*y - phase*0.8);
        }
        p.needsUpdate = true;
      });
      scene.rotation.y = 0.2*Math.sin(t*0.6);
      renderer.render(scene,camera);
    }; animate();

    return ()=>{ if (raf) cancelAnimationFrame(raf); renderer.dispose(); if (ref.current) ref.current.removeChild(renderer.domElement); scene.traverse(o=>{ const any=o as any; if (any.geometry) any.geometry.dispose(); if(any.material){ const m=any.material; if(Array.isArray(m)) m.forEach((mm:any)=>mm.dispose()); else m.dispose(); } }); };
  }, [width,height]);
  return <div ref={ref} style={{width,height,background:'#F0EEE6'}}/>;
};

export default HyparGarden3D;

