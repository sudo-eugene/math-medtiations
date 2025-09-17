import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Plane mesh rippled by a gyroid-inspired function, in 3D
const GyroidRippleMesh3D: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width/height, 0.1, 2000);
    camera.position.set(0,0,220);
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(width,height); renderer.setClearColor(0xF0EEE6);
    ref.current.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff,0.7); const dir = new THREE.DirectionalLight(0xffffff,0.8); dir.position.set(6,7,8); scene.add(amb,dir);

    const geom = new THREE.PlaneGeometry(160,120,80,60);
    const wire = new THREE.WireframeGeometry(geom);
    const mesh = new THREE.LineSegments(wire, new THREE.LineBasicMaterial({color:0x444444, transparent:true, opacity:0.45}));
    scene.add(mesh);

    const pos = (geom.attributes.position as THREE.BufferAttribute);
    const base = pos.array.slice(0) as any;

    let raf: number | null = null; let t=0;
    const animate = () => {
      raf = requestAnimationFrame(animate); t+=0.02;
      for (let i=0;i<pos.count;i++){
        const ix=3*i; const x=base[ix], y=base[ix+1];
        const X=0.06*x, Y=0.06*y; const z = 6*(Math.sin(X)+Math.sin(Y)+Math.sin(t)) + 4*Math.sin(X+Y+t*0.7);
        pos.array[ix+2] = z;
      }
      pos.needsUpdate = true; scene.rotation.y = 0.2*Math.sin(t*0.5);
      renderer.render(scene,camera);
    }; animate();

    return ()=>{ if (raf) cancelAnimationFrame(raf); renderer.dispose(); if (ref.current) ref.current.removeChild(renderer.domElement); geom.dispose(); };
  }, [width,height]);
  return <div ref={ref} style={{width,height,background:'#F0EEE6'}}/>;
};

export default GyroidRippleMesh3D;

