import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Multiple torus-knot wireframes blooming in and out
const TorusKnotBloom3D: React.FC<VisualProps> = ({ width, height }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 2000);
    camera.position.set(0, 0, 220);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0xF0EEE6);
    containerRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(5, 6, 8);
    scene.add(ambient, dir);

    const group = new THREE.Group();
    scene.add(group);

    const knots: THREE.LineSegments[] = [];
    for (let i = 0; i < 5; i++) {
      const geo = new THREE.TorusKnotGeometry(24 + i * 6, 5 + i, 220, 64, 2 + i, 3 + (i % 3));
      const wire = new THREE.WireframeGeometry(geo);
      const mat = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.45 - i * 0.06 });
      const mesh = new THREE.LineSegments(wire, mat);
      mesh.rotation.set(Math.random(), Math.random(), Math.random());
      knots.push(mesh);
      group.add(mesh);
    }

    let raf: number | null = null;
    let t = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      t += 0.01;
      group.rotation.y += 0.004;
      group.rotation.x = Math.sin(t * 0.5) * 0.2;
      knots.forEach((k, i) => {
        const s = 0.9 + 0.15 * Math.sin(t * 0.8 + i);
        k.scale.setScalar(s);
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      renderer.dispose();
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
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

export default TorusKnotBloom3D;

