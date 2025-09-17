import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Rising instanced cubes forming a crystalline fountain
const CrystalFountain3D: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width/height, 0.1, 2000);
    camera.position.set(0,0,220);
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(width,height); renderer.setClearColor(0xF0EEE6); ref.current.appendChild(renderer.domElement);
    const amb = new THREE.AmbientLight(0xffffff,0.7); const dir = new THREE.DirectionalLight(0xffffff,0.8); dir.position.set(5,7,9); scene.add(amb,dir);

    const count = 1200;
    const geo = new THREE.BoxGeometry(1.6, 6.0, 1.6);
    const mat = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const inst = new THREE.InstancedMesh(geo, mat, count);
    scene.add(inst);

    const dummy = new THREE.Object3D();
    const seeds = new Float32Array(count*3);
    for (let i=0;i<count;i++){
      seeds[3*i] = (Math.random()-0.5)*80; // x
      seeds[3*i+1] = Math.random()*100; // y start
      seeds[3*i+2] = (Math.random()-0.5)*80; // z
    }

    let raf: number | null = null; let t=0;
    const animate = () => {
      raf = requestAnimationFrame(animate); t += 0.01;
      for (let i=0;i<count;i++){
        const x = seeds[3*i] + 10*Math.sin(t + i*0.01);
        let y = (seeds[3*i+1] + (t*30 + i)%160) - 80; // loop
        const z = seeds[3*i+2] + 10*Math.cos(t*0.8 + i*0.02);
        const s = 0.6 + 0.6*Math.sin(0.05*(x*x+z*z) + t);
        dummy.position.set(x, y, z);
        dummy.scale.setScalar(0.7 + 0.4*s);
        dummy.rotation.y = (x+z)*0.01 + t*0.3;
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
      scene.rotation.y = 0.1*Math.sin(t*0.7);
      renderer.render(scene,camera);
    }; animate();

    return ()=>{ if (raf) cancelAnimationFrame(raf); renderer.dispose(); if (ref.current) ref.current.removeChild(renderer.domElement); geo.dispose(); (mat as any).dispose?.(); };
  }, [width,height]);
  return <div ref={ref} style={{width,height,background:'#F0EEE6'}}/>;
};

export default CrystalFountain3D;

