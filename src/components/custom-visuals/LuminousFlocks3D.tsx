import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Soft-glow flocking points in 3D (minimal cohesion/separation)
const LuminousFlocks3D: React.FC<VisualProps> = ({ width, height }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 2000);
    camera.position.set(0, 0, 260);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0xF0EEE6);
    containerRef.current.appendChild(renderer.domElement);

    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[3*i] = (Math.random()-0.5)*200;
      positions[3*i+1] = (Math.random()-0.5)*120;
      positions[3*i+2] = (Math.random()-0.5)*200;
      velocities[3*i] = (Math.random()-0.5)*0.4;
      velocities[3*i+1] = (Math.random()-0.5)*0.4;
      velocities[3*i+2] = (Math.random()-0.5)*0.4;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0x333333, size: 2.2, sizeAttenuation: true, transparent: true, opacity: 0.6 });
    const points = new THREE.Points(geom, mat);
    scene.add(points);

    const tmp = new THREE.Vector3();
    const center = new THREE.Vector3(0,0,0);
    let raf: number | null = null;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const pos = geom.getAttribute('position') as THREE.BufferAttribute;
      for (let i=0;i<particleCount;i++){
        const ix=3*i;
        tmp.set(pos.array[ix], pos.array[ix+1], pos.array[ix+2]);
        const toCenter = center.clone().sub(tmp).multiplyScalar(0.0008);
        velocities[ix] += toCenter.x; velocities[ix+1] += toCenter.y; velocities[ix+2] += toCenter.z;
        // damping
        velocities[ix] *= 0.995; velocities[ix+1] *= 0.995; velocities[ix+2] *= 0.995;
        // update
        pos.array[ix] += velocities[ix]; pos.array[ix+1] += velocities[ix+1]; pos.array[ix+2] += velocities[ix+2];
      }
      pos.needsUpdate = true;
      points.rotation.y += 0.0015;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      renderer.dispose(); if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
      geom.dispose(); (mat as any).dispose?.();
    };
  }, [width, height]);

  return <div ref={containerRef} style={{ width, height, background: '#F0EEE6' }} />;
};

export default LuminousFlocks3D;

