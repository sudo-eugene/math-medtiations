import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Magnetic-like field lines around a dipole (streamlines)
const MagneticFieldLines3D: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width/height, 0.1, 2000);
    camera.position.set(0,0,220);
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(width,height); renderer.setClearColor(0xF0EEE6); ref.current.appendChild(renderer.domElement);
    const amb = new THREE.AmbientLight(0xffffff,0.7); const dir = new THREE.DirectionalLight(0xffffff,0.7); dir.position.set(5,6,8); scene.add(amb,dir);

    const group = new THREE.Group(); scene.add(group);
    const material = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.42 });

    function field(p: THREE.Vector3) {
      // simple dipole field at origin aligned with Y
      const m = new THREE.Vector3(0,1,0);
      const r = p.length();
      const r5 = Math.pow(r+1e-3,5);
      const term1 = p.clone().multiplyScalar(3 * m.dot(p));
      const v = term1.sub(m.clone().multiplyScalar(r*r)).multiplyScalar(1/r5);
      return v;
    }

    function makeLine(seed: THREE.Vector3) {
      const pts: THREE.Vector3[] = [];
      let p = seed.clone();
      for (let i=0;i<400;i++){
        pts.push(p.clone());
        const v = field(p).multiplyScalar(7000); // scale
        p = p.clone().add(v);
        if (p.length() > 90) break;
      }
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geom, material);
      group.add(line);
    }

    for (let a=0; a<Math.PI*2; a+=Math.PI/12){
      for (let r=10; r<=40; r+=8){
        const x = r*Math.cos(a), z = r*Math.sin(a);
        makeLine(new THREE.Vector3(x, 25, z));
        makeLine(new THREE.Vector3(x, -25, z));
      }
    }

    let raf: number | null = null; let t=0;
    const animate = () => { raf = requestAnimationFrame(animate); t+=0.01; group.rotation.y = Math.sin(t)*0.4; group.rotation.x = Math.cos(t*0.7)*0.2; renderer.render(scene,camera); };
    animate();

    return ()=>{ if (raf) cancelAnimationFrame(raf); renderer.dispose(); if (ref.current) ref.current.removeChild(renderer.domElement); group.traverse(o=>{const any=o as any; if(any.geometry) any.geometry.dispose();}); (material as any).dispose?.(); };
  }, [width,height]);
  return <div ref={ref} style={{width,height,background:'#F0EEE6'}}/>;
};

export default MagneticFieldLines3D;

