import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// 3D lattice of spheres pulsing with distance-based phases
const LatticeBreath3D: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width/height, 0.1, 2000);
    camera.position.set(0,0,260);
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(width,height); renderer.setClearColor(0xF0EEE6); ref.current.appendChild(renderer.domElement);
    const amb = new THREE.AmbientLight(0xffffff,0.8); const dir = new THREE.DirectionalLight(0xffffff,0.8); dir.position.set(6,7,9); scene.add(amb,dir);

    const count = 12; const spacing = 14; const total = count*count*count;
    const geo = new THREE.SphereGeometry(1.4, 10, 10);
    const mat = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const inst = new THREE.InstancedMesh(geo, mat, total); scene.add(inst);
    const dummy = new THREE.Object3D();

    let idx=0; const phases: number[] = []; const positions: THREE.Vector3[] = [];
    for (let x=0;x<count;x++) for (let y=0;y<count;y++) for (let z=0;z<count;z++) {
      const px = (x - count/2) * spacing;
      const py = (y - count/2) * spacing;
      const pz = (z - count/2) * spacing;
      dummy.position.set(px, py, pz);
      dummy.updateMatrix(); inst.setMatrixAt(idx, dummy.matrix);
      phases[idx] = Math.hypot(px,py,pz) * 0.02;
      positions[idx] = new THREE.Vector3(px, py, pz);
      idx++;
    }

    let raf: number | null = null; let t=0;
    const animate = () => {
      raf = requestAnimationFrame(animate); t+=0.02;
      for (let i=0;i<total;i++){
        const s = 0.6 + 0.4 * (0.5 + 0.5*Math.sin(t + phases[i]));
        dummy.position.copy(positions[i]);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
      scene.rotation.y = 0.2*Math.sin(t*0.6);
      renderer.render(scene,camera);
    }; animate();

    return ()=>{
      if (raf) cancelAnimationFrame(raf);
      renderer.dispose();
      if (ref.current) ref.current.removeChild(renderer.domElement);
      geo.dispose();
      mat.dispose();
    };
  }, [width,height]);
  return <div ref={ref} style={{width,height,background:'#F0EEE6'}}/>;
};

export default LatticeBreath3D;
