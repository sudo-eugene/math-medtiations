import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Two complementary tori orbiting each other with gentle dynamics
const YinYangTori3D: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width/height, 0.1, 2000);
    camera.position.set(0,0,220);
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(width,height); renderer.setClearColor(0xF0EEE6); ref.current.appendChild(renderer.domElement);
    const amb = new THREE.AmbientLight(0xffffff,0.8); const dir = new THREE.DirectionalLight(0xffffff,0.8); dir.position.set(6,7,9); scene.add(amb,dir);

    const g = new THREE.TorusGeometry(40, 6, 24, 120);
    const w1 = new THREE.WireframeGeometry(g);
    const w2 = new THREE.WireframeGeometry(g);
    const m1 = new THREE.LineSegments(w1, new THREE.LineBasicMaterial({ color: 0x444444, transparent:true, opacity:0.5 }));
    const m2 = new THREE.LineSegments(w2, new THREE.LineBasicMaterial({ color: 0x444444, transparent:true, opacity:0.3 }));
    scene.add(m1,m2);

    let raf: number | null = null; let t=0;
    const animate = () => {
      raf = requestAnimationFrame(animate); t+=0.01;
      m1.rotation.x = t*0.6; m1.rotation.y = t*0.3;
      m2.rotation.x = -t*0.6; m2.rotation.y = -t*0.3;
      m1.position.x = 10*Math.sin(t*0.8); m2.position.x = -m1.position.x;
      renderer.render(scene,camera);
    }; animate();

    return ()=>{ if (raf) cancelAnimationFrame(raf); renderer.dispose(); if (ref.current) ref.current.removeChild(renderer.domElement); w1.dispose(); w2.dispose(); };
  }, [width,height]);
  return <div ref={ref} style={{width,height,background:'#F0EEE6'}}/>;
};

export default YinYangTori3D;

