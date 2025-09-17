import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// A forest of delicate helices drifting and rotating in 3D
const HelixForest3D: React.FC<VisualProps> = ({ width, height }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 2000);
    camera.position.set(0, 0, 160);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0xF0EEE6);
    containerRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(3, 4, 5);
    scene.add(ambient, dir);

    const group = new THREE.Group();
    scene.add(group);

    const helixCount = 28;
    const lines: THREE.Line[] = [];
    for (let k = 0; k < helixCount; k++) {
      const points: THREE.Vector3[] = [];
      const turns = 7 + Math.floor(Math.random() * 6);
      const radius = 3 + Math.random() * 6;
      const heightSpan = 60 + Math.random() * 40;
      for (let i = 0; i <= 600; i++) {
        const t = (i / 600) * Math.PI * 2 * turns;
        const x = Math.cos(t) * radius;
        const y = (i / 600 - 0.5) * heightSpan;
        const z = Math.sin(t) * radius;
        points.push(new THREE.Vector3(x, y, z));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.5 });
      const ln = new THREE.Line(geom, mat);
      ln.position.set(
        (Math.random() - 0.5) * 160,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 120
      );
      ln.rotation.y = Math.random() * Math.PI;
      lines.push(ln);
      group.add(ln);
    }

    let raf: number | null = null;
    let t = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      t += 0.005;
      group.rotation.y = Math.sin(t * 0.7) * 0.2;
      group.rotation.x = Math.cos(t * 0.4) * 0.1;
      lines.forEach((ln, i) => {
        ln.rotation.y += 0.001 + i * 0.00005;
        ln.position.y += Math.sin(t + i) * 0.02;
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.traverse(obj => {
        if ((obj as any).geometry) (obj as any).geometry.dispose();
        if ((obj as any).material) {
          const m = (obj as any).material;
          if (Array.isArray(m)) m.forEach(mm => mm.dispose()); else m.dispose();
        }
      });
    };
  }, [width, height]);

  return <div ref={containerRef} style={{ width, height, background: '#F0EEE6' }} />;
};

export default HelixForest3D;

