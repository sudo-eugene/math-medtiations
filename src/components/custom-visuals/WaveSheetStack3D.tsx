import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Stack of waving sheets (wireframe planes) with phase offsets
const WaveSheetStack3D: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width/height, 0.1, 2000);
    camera.position.set(0,0,240);
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(width,height); renderer.setClearColor(0xF0EEE6); ref.current.appendChild(renderer.domElement);
    const amb = new THREE.AmbientLight(0xffffff,0.7); const dir = new THREE.DirectionalLight(0xffffff,0.8); dir.position.set(5,7,8); scene.add(amb,dir);

    const stack: { mesh: THREE.LineSegments; pos: THREE.BufferAttribute; base: Float32Array }[] = [];
    for (let k=0;k<6;k++){
      const plane = new THREE.PlaneGeometry(160, 100, 40, 26);
      const wire = new THREE.WireframeGeometry(plane);
      const line = new THREE.LineSegments(wire, new THREE.LineBasicMaterial({color:0x444444, transparent:true, opacity: 0.4 - k*0.04}));
      line.position.z = -50 + k*20;
      scene.add(line);
      const pos = plane.getAttribute('position') as THREE.BufferAttribute;
      stack.push({ mesh: line, pos, base: pos.array.slice(0) as any });
    }

    let raf: number | null = null; let t=0;
    const animate = () => {
      raf = requestAnimationFrame(animate); t+=0.02;
      stack.forEach((s, i) => {
        const p = s.pos; const base = s.base as any;
        for (let j=0;j<p.count;j++){
          const ix=3*j; const x=base[ix], y=base[ix+1];
          p.array[ix+2] = 4*Math.sin(0.08*x + t + i*0.7) + 3*Math.cos(0.1*y - t*0.8);
        }
        p.needsUpdate = true;
      });
      scene.rotation.y = 0.2*Math.sin(t*0.5);
      renderer.render(scene,camera);
    }; animate();

    return ()=>{ if (raf) cancelAnimationFrame(raf); renderer.dispose(); if (ref.current) ref.current.removeChild(renderer.domElement); scene.traverse(o=>{const any=o as any; if(any.geometry) any.geometry.dispose(); if(any.material){const m=any.material; if(Array.isArray(m)) m.forEach((mm:any)=>mm.dispose()); else m.dispose();}}); };
  }, [width,height]);
  return <div ref={ref} style={{width,height,background:'#F0EEE6'}}/>;
};

export default WaveSheetStack3D;

