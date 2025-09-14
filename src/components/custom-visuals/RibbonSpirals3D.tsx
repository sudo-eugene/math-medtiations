import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Ribbon spirals using TubeGeometry along custom curves
const RibbonSpirals3D: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width/height, 0.1, 2000);
    camera.position.set(0,0,220);
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(width,height); renderer.setClearColor(0xF0EEE6); ref.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff,0.7); const dir = new THREE.DirectionalLight(0xffffff,0.7); dir.position.set(6,5,8);
    scene.add(ambient,dir);

    const group = new THREE.Group(); scene.add(group);
    const mats: THREE.MeshPhongMaterial[] = [];
    for (let k=0;k<6;k++){
      const pts: THREE.Vector3[] = [];
      for (let i=0;i<=200;i++){
        const t = i/200 * Math.PI*6;
        const r = 10 + k*3 + 3*Math.sin(t*0.7);
        const x = r*Math.cos(t), y = (i/200-0.5)*80, z = r*Math.sin(t);
        pts.push(new THREE.Vector3(x,y,z));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const geom = new THREE.TubeGeometry(curve, 400, 0.7, 8, false);
      const mat = new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 20, specular: 0x222222 });
      mats.push(mat);
      const mesh = new THREE.Mesh(geom, mat);
      mesh.rotation.y = Math.random()*Math.PI; mesh.position.x = (k-2.5)*12;
      group.add(mesh);
    }

    let raf: number | null = null; let t=0;
    const animate = () => { raf = requestAnimationFrame(animate); t+=0.01; group.rotation.y = 0.3*Math.sin(t); renderer.render(scene,camera); };
    animate();

    return ()=>{ if (raf) cancelAnimationFrame(raf); renderer.dispose(); if (ref.current) ref.current.removeChild(renderer.domElement); scene.traverse(o=>{const any=o as any; if(any.geometry) any.geometry.dispose(); if(any.material){const m=any.material; if(Array.isArray(m)) m.forEach((mm:any)=>mm.dispose()); else m.dispose();}}); };
  }, [width,height]);
  return <div ref={ref} style={{width,height,background:'#F0EEE6'}}/>;
};

export default RibbonSpirals3D;

