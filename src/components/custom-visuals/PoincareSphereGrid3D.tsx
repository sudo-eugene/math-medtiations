import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Sphere with latitude/longitude wire grid, rotating with subtle phase
const PoincareSphereGrid3D: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width/height, 0.1, 2000);
    camera.position.set(0,0,200);
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(width,height); renderer.setClearColor(0xF0EEE6); ref.current.appendChild(renderer.domElement);
    const amb = new THREE.AmbientLight(0xffffff,0.8); const dir = new THREE.DirectionalLight(0xffffff,0.8); dir.position.set(6,7,9); scene.add(amb,dir);

    const group = new THREE.Group(); scene.add(group);
    const mat = new THREE.LineBasicMaterial({ color: 0x444444, transparent:true, opacity:0.5 });
    const R=70;
    // latitude
    for (let j=-80;j<=80;j+=10){
      const pts: THREE.Vector3[] = [];
      const phi = THREE.MathUtils.degToRad(j);
      const r = R*Math.cos(phi); const y = R*Math.sin(phi);
      for (let a=0;a<=360;a+=3){
        const th = THREE.MathUtils.degToRad(a);
        pts.push(new THREE.Vector3(r*Math.cos(th), y, r*Math.sin(th)));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      group.add(new THREE.Line(geo, mat));
    }
    // longitude
    for (let a=0;a<360;a+=10){
      const pts: THREE.Vector3[] = [];
      const th = THREE.MathUtils.degToRad(a);
      for (let j=-90;j<=90;j+=3){
        const phi = THREE.MathUtils.degToRad(j);
        const x = R*Math.cos(phi)*Math.cos(th);
        const y = R*Math.sin(phi);
        const z = R*Math.cos(phi)*Math.sin(th);
        pts.push(new THREE.Vector3(x,y,z));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      group.add(new THREE.Line(geo, mat));
    }

    let raf: number | null = null; let t=0;
    const animate = () => { raf = requestAnimationFrame(animate); t+=0.01; group.rotation.y = t*0.5; group.rotation.x = 0.2*Math.sin(t*0.6); renderer.render(scene,camera); };
    animate();

    return ()=>{ if (raf) cancelAnimationFrame(raf); renderer.dispose(); if (ref.current) ref.current.removeChild(renderer.domElement); group.traverse(o=>{const any=o as any; if(any.geometry) any.geometry.dispose();}); (mat as any).dispose?.(); };
  }, [width,height]);
  return <div ref={ref} style={{width,height,background:'#F0EEE6'}}/>;
};

export default PoincareSphereGrid3D;

