import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Many bodies following layered orbital choreography (instanced spheres)
const OrbitalChoreography3D: React.FC<VisualProps> = ({ width, height }) => {
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

    const count = 1200;
    const geo = new THREE.SphereGeometry(1.3, 10, 10);
    const mat = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const inst = new THREE.InstancedMesh(geo, mat, count);
    scene.add(inst);
    const dummy = new THREE.Object3D();

    // orbital parameters
    const layers = 12; const params: {a:number;b:number;s:number;o:number;}[] = [];
    for (let i=0;i<layers;i++){
      params.push({ a: 20 + i*8, b: 12 + i*6, s: 0.002 + i*0.0002, o: i*0.3 });
    }

    let index = 0;
    const bodyMap: {layer:number; phase:number;}[] = [];
    for (let l=0;l<layers;l++) for (let j=0;j<Math.floor(count/layers);j++) bodyMap.push({layer:l, phase: Math.random()*Math.PI*2});

    let raf: number | null = null; let T=0;
    const animate = () => {
      raf = requestAnimationFrame(animate); T += 1;
      for (let i=0;i<count;i++){
        const b = bodyMap[i]; const p = params[b.layer];
        const ang = b.phase + T * p.s;
        const rot = p.o + T*0.0008;
        const x0 = p.a*Math.cos(ang); const y0 = p.b*Math.sin(ang);
        const x = x0*Math.cos(rot) - y0*Math.sin(rot);
        const y = x0*Math.sin(rot) + y0*Math.cos(rot);
        const z = 8*Math.sin(ang*1.3 + b.layer);
        dummy.position.set(x,y,z);
        dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
      scene.rotation.y = 0.2*Math.sin(T*0.002);
      renderer.render(scene,camera);
    }; animate();

    return ()=>{ if (raf) cancelAnimationFrame(raf); renderer.dispose(); if (ref.current) ref.current.removeChild(renderer.domElement); geo.dispose(); (mat as any).dispose?.(); };
  }, [width,height]);
  return <div ref={ref} style={{width,height,background:'#F0EEE6'}}/>;
};

export default OrbitalChoreography3D;

