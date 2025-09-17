import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Klein bottle parameter wireframe rotating elegantly
const KleinBottleWire3D: React.FC<VisualProps> = ({ width, height }) => {
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

    // Create parametric grid lines
    function klein(u:number, v:number){
      u*=Math.PI*2; v*=Math.PI*2; const r=4;
      const x = (r + Math.cos(u/2)*Math.sin(v) - Math.sin(u/2)*Math.sin(2*v)) * Math.cos(u);
      const y = (r + Math.cos(u/2)*Math.sin(v) - Math.sin(u/2)*Math.sin(2*v)) * Math.sin(u);
      const z = Math.sin(u/2)*Math.sin(v) + Math.cos(u/2)*Math.sin(2*v);
      return new THREE.Vector3(x*10, y*10, z*10);
    }

    const mat = new THREE.LineBasicMaterial({ color: 0x444444, transparent:true, opacity:0.45 });
    const lines: THREE.Line[] = [];
    const resU=60, resV=30;
    for (let j=0;j<=resV;j++){
      const pts: THREE.Vector3[] = [];
      for (let i=0;i<=resU;i++) pts.push(klein(i/resU, j/resV));
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const ln = new THREE.Line(geo, mat); scene.add(ln); lines.push(ln);
    }
    for (let i=0;i<=resU;i++){
      const pts: THREE.Vector3[] = [];
      for (let j=0;j<=resV;j++) pts.push(klein(i/resU, j/resV));
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const ln = new THREE.Line(geo, mat); scene.add(ln); lines.push(ln);
    }

    let raf: number | null = null; let t=0;
    const animate = () => { raf = requestAnimationFrame(animate); t+=0.01; scene.rotation.y = t*0.6; scene.rotation.x = Math.sin(t*0.7)*0.2; renderer.render(scene,camera); };
    animate();

    return ()=>{ if (raf) cancelAnimationFrame(raf); renderer.dispose(); if (ref.current) ref.current.removeChild(renderer.domElement); lines.forEach(l=>l.geometry.dispose()); (mat as any).dispose?.(); };
  }, [width,height]);
  return <div ref={ref} style={{width,height,background:'#F0EEE6'}}/>;
};

export default KleinBottleWire3D;

