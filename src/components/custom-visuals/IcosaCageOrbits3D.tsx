import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Icosahedron wire cage with orbiting spheres
const IcosaCageOrbits3D: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width/height, 0.1, 2000);
    camera.position.set(0,0,200);
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(width,height); renderer.setClearColor(0xF0EEE6);
    ref.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff,0.6);
    const dir = new THREE.DirectionalLight(0xffffff,0.7); dir.position.set(4,5,6);
    scene.add(ambient,dir);

    const ico = new THREE.IcosahedronGeometry(60,0);
    const wire = new THREE.WireframeGeometry(ico);
    const cage = new THREE.LineSegments(wire, new THREE.LineBasicMaterial({color:0x444444, transparent:true, opacity:0.5}));
    scene.add(cage);

    const orbMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const orbGeo = new THREE.SphereGeometry(2.2, 16, 16);
    const orbs: THREE.Mesh[] = [];
    for (let i=0;i<28;i++){
      const m = new THREE.Mesh(orbGeo, orbMat);
      scene.add(m); orbs.push(m);
    }

    let raf: number | null = null; let t=0;
    const animate = () => {
      raf = requestAnimationFrame(animate); t += 0.01;
      cage.rotation.y += 0.003; cage.rotation.x = 0.2*Math.sin(t*0.7);
      orbs.forEach((m, i) => {
        const a = t* (0.6 + i*0.01) + i;
        const r = 70 + 10*Math.sin(i*0.7);
        m.position.set(
          r*Math.cos(a),
          r*0.6*Math.sin(a*1.1),
          r*0.7*Math.sin(a)
        );
      });
      renderer.render(scene,camera);
    }; animate();

    return ()=>{
      if (raf) cancelAnimationFrame(raf);
      renderer.dispose(); if (ref.current) ref.current.removeChild(renderer.domElement);
      scene.traverse(o=>{ const any=o as any; if (any.geometry) any.geometry.dispose(); if (any.material){ const m=any.material; if(Array.isArray(m)) m.forEach((mm:any)=>mm.dispose()); else m.dispose(); }});
    };
  }, [width,height]);
  return <div ref={ref} style={{width,height,background:'#F0EEE6'}}/>;
};

export default IcosaCageOrbits3D;

