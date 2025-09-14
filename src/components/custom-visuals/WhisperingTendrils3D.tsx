import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Whispering tendrils as animated polylines in 3D
const WhisperingTendrils3D: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width/height, 0.1, 2000);
    camera.position.set(0,0,220);
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(width,height); renderer.setClearColor(0xF0EEE6); ref.current.appendChild(renderer.domElement);
    const amb = new THREE.AmbientLight(0xffffff,0.8); const dir = new THREE.DirectionalLight(0xffffff,0.7); dir.position.set(5,7,9); scene.add(amb,dir);

    const tendrils: { line: THREE.Line; base: THREE.Vector3[] }[] = [];
    const material = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.42 });
    for (let k=0;k<36;k++){
      const pts: THREE.Vector3[] = [];
      for (let i=0;i<120;i++){
        const t = i/120; const a = t*Math.PI*4 + k*0.2;
        pts.push(new THREE.Vector3(40*Math.cos(a)*t, (t-0.5)*90, 40*Math.sin(a)*t));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, material);
      tendrils.push({ line, base: pts }); scene.add(line);
    }

    let raf: number | null = null; let T=0;
    const animate = () => {
      raf = requestAnimationFrame(animate); T+=0.01;
      tendrils.forEach((t, idx) => {
        const arr = (t.line.geometry.getAttribute('position') as THREE.BufferAttribute).array as any;
        for (let i=0;i<t.base.length;i++){
          const b = t.base[i];
          arr[3*i] = b.x + 3*Math.sin(0.2*i + T + idx*0.2);
          arr[3*i+1] = b.y + 3*Math.cos(0.15*i + T*1.2);
          arr[3*i+2] = b.z + 3*Math.sin(0.18*i + T*0.9);
        }
        (t.line.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
      });
      scene.rotation.y = 0.2*Math.sin(T*0.6);
      renderer.render(scene,camera);
    }; animate();

    return ()=>{ if (raf) cancelAnimationFrame(raf); renderer.dispose(); if (ref.current) ref.current.removeChild(renderer.domElement); scene.traverse(o=>{ const any=o as any; if(any.geometry) any.geometry.dispose(); }); (material as any).dispose?.(); };
  }, [width,height]);
  return <div ref={ref} style={{width,height,background:'#F0EEE6'}}/>;
};

export default WhisperingTendrils3D;

