import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Dandelion-like spheres made of radial line segments
const DandelionSpheres3D: React.FC<VisualProps> = ({ width, height }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 2000);
    camera.position.set(0, 0, 230);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0xF0EEE6);
    containerRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6); dir.position.set(3,5,7);
    scene.add(ambient, dir);

    const group = new THREE.Group(); scene.add(group);

    function makeDandelion(radius: number, spokes: number) {
      const positions: number[] = [];
      for (let i = 0; i < spokes; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        positions.push(0, 0, 0, x, y, z);
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const mat = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.45 });
      const lines = new THREE.LineSegments(geom, mat);
      return lines;
    }

    const flowers: THREE.Object3D[] = [];
    for (let i = 0; i < 8; i++) {
      const d = makeDandelion(20 + i * 2, 800 + i * 150);
      d.position.set((Math.random()-0.5)*140, (Math.random()-0.5)*80, (Math.random()-0.5)*120);
      flowers.push(d);
      group.add(d);
    }

    let raf: number | null = null; let t = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate); t += 0.01;
      group.rotation.y += 0.003;
      flowers.forEach((f, i) => {
        f.rotation.x = Math.sin(t + i) * 0.3;
        f.rotation.y = Math.cos(t*0.7 + i*0.5) * 0.2;
      });
      renderer.render(scene, camera);
    }; animate();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      renderer.dispose(); if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
      scene.traverse(o => { const any = o as any; if (any.geometry) any.geometry.dispose(); if (any.material) { const m=any.material; if (Array.isArray(m)) m.forEach((mm: any)=>mm.dispose()); else m.dispose(); } });
    };
  }, [width, height]);

  return <div ref={containerRef} style={{ width, height, background: '#F0EEE6' }} />;
};

export default DandelionSpheres3D;

