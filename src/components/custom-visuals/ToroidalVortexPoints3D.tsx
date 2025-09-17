import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Points swirling along a toroidal vortex flow
const ToroidalVortexPoints3D: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width/height, 0.1, 2000);
    camera.position.set(0,0,220);
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(width,height); renderer.setClearColor(0xF0EEE6); ref.current.appendChild(renderer.domElement);

    const N = 12000;
    const pos = new Float32Array(N*3);
    const ang = new Float32Array(N*2);
    for (let i=0;i<N;i++){
      const u = Math.random()*Math.PI*2; // around major radius
      const v = Math.random()*Math.PI*2; // minor circle
      ang[2*i]=u; ang[2*i+1]=v;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos,3));
    const mat = new THREE.PointsMaterial({ color: 0x333333, size: 1.4, sizeAttenuation: true, transparent: true, opacity: 0.65 });
    const pts = new THREE.Points(geom, mat);
    scene.add(pts);

    const R = 70, r = 22;
    let raf: number | null = null; let t=0;
    const animate = () => {
      raf = requestAnimationFrame(animate); t+=0.01;
      for (let i=0;i<N;i++){
        let u = ang[2*i] + 0.002*(1+0.5*Math.sin(t+i*0.01));
        let v = ang[2*i+1] + 0.01*(1+0.3*Math.cos(t*1.2+i*0.02));
        ang[2*i]=u; ang[2*i+1]=v;
        const x = (R + r*Math.cos(v))*Math.cos(u);
        const y = r*Math.sin(v);
        const z = (R + r*Math.cos(v))*Math.sin(u);
        pos[3*i]=x; pos[3*i+1]=y; pos[3*i+2]=z;
      }
      (geom.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
      scene.rotation.y = 0.2*Math.sin(t);
      renderer.render(scene,camera);
    }; animate();

    return ()=>{ if (raf) cancelAnimationFrame(raf); renderer.dispose(); if (ref.current) ref.current.removeChild(renderer.domElement); geom.dispose(); (mat as any).dispose?.(); };
  }, [width,height]);
  return <div ref={ref} style={{width,height,background:'#F0EEE6'}}/>;
};

export default ToroidalVortexPoints3D;

