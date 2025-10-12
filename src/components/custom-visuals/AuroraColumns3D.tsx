import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Columns with heights/opacity modulated to evoke aurora curtains
const AuroraColumns3D: React.FC<VisualProps> = ({ width, height }) => {
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

    const cols = 60, rows = 12; const spacing = 8; const total = cols*rows;
    const geo = new THREE.CylinderGeometry(1.3, 1.3, 10, 24, 1, true);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x27404d,
      emissive: 0x162c33,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.82,
      shininess: 28,
    });
    const inst = new THREE.InstancedMesh(geo, mat, total); scene.add(inst);
    const dummy = new THREE.Object3D();

    const center = new THREE.Vector2(cols/2, rows/2);
    let i=0; const phases: number[] = []; const positions: THREE.Vector3[] = []; const baseY = -32;
    for (let y=0;y<rows;y++) for (let x=0;x<cols;x++){
      const px = (x - cols/2)*spacing; const pz = (y - rows/2)*spacing;
      dummy.position.set(px, baseY, pz); dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
      positions[i] = new THREE.Vector3(px, baseY, pz);
      const d = new THREE.Vector2(x,y).distanceTo(center); phases[i] = d*0.3; i++;
    }

    let raf: number | null = null; let t=0;
    const animate = () => {
      raf = requestAnimationFrame(animate); t+=0.02;
      for (let j=0;j<total;j++){
        const h = 16 + 14*Math.sin(t + phases[j]) + 10*Math.sin(0.35*(t+phases[j]));
        dummy.position.copy(positions[j]);
        dummy.position.y = baseY + (h * 0.5);
        dummy.scale.set(1, h/10, 1);
        dummy.updateMatrix();
        inst.setMatrixAt(j, dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate = true; scene.rotation.y = 0.15*Math.sin(t);
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

export default AuroraColumns3D;
