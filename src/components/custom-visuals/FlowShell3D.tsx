import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// A breathing spherical shell wireframe with vertex displacement
const FlowShell3D: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width/height, 0.1, 2000);
    camera.position.set(0,0,220);
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(width,height); renderer.setClearColor(0xF0EEE6); ref.current.appendChild(renderer.domElement);
    const amb = new THREE.AmbientLight(0xffffff,0.7); const dir = new THREE.DirectionalLight(0xffffff,0.7); dir.position.set(4,6,8); scene.add(amb,dir);

    const base = new THREE.SphereGeometry(60, 40, 32);
    const wire = new THREE.WireframeGeometry(base);
    const shell = new THREE.LineSegments(wire, new THREE.LineBasicMaterial({color:0x444444, transparent:true, opacity:0.5}));
    scene.add(shell);

    const pos = (base.attributes.position as THREE.BufferAttribute);
    const orig = pos.array.slice(0) as Float32Array | number[];

    let raf: number | null = null; let t=0;
    const animate = () => {
      raf = requestAnimationFrame(animate); t+=0.01;
      for (let i=0;i<pos.count;i++){
        const ix=3*i; const x=(orig as any)[ix], y=(orig as any)[ix+1], z=(orig as any)[ix+2];
        const r = Math.sqrt(x*x+y*y+z*z);
        const n = Math.sin(0.03*x + t) + Math.cos(0.03*y - t*1.2) + Math.sin(0.03*z + t*0.8);
        const scale = 1 + 0.06 * Math.sin(n);
        pos.array[ix] = (x/r) * 60 * scale;
        pos.array[ix+1] = (y/r) * 60 * scale;
        pos.array[ix+2] = (z/r) * 60 * scale;
      }
      pos.needsUpdate = true;
      shell.rotation.y += 0.003;
      renderer.render(scene,camera);
    }; animate();

    return ()=>{ if (raf) cancelAnimationFrame(raf); renderer.dispose(); if (ref.current) ref.current.removeChild(renderer.domElement); scene.traverse(o=>{const any=o as any; if(any.geometry) any.geometry.dispose(); if(any.material){const m=any.material; if(Array.isArray(m)) m.forEach((mm:any)=>mm.dispose()); else m.dispose();}}); };
  }, [width,height]);
  return <div ref={ref} style={{width,height,background:'#F0EEE6'}}/>;
};

export default FlowShell3D;

