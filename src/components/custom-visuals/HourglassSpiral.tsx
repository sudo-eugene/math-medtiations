import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

// Themes: emptiness as potential, stillness in motion, unity of form
// Visualization: An hourglass spiral that shows how form arises from emptiness and returns to it

const HourglassSpiral: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0xF0EEE6);
    mountRef.current.appendChild(renderer.domElement);

    const particleCount = 5000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 5;
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = Math.sin(angle) * radius;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x333333,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    camera.position.z = 10;

    let time = 0;
    const animate = () => {
      time += 0.01;
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const y = positions[i3 + 1];
        positions[i3 + 1] = Math.sin(y + time) * 5;
      }

      particleSystem.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();


    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [width, height]);

  return <div ref={mountRef} style={{ width: `${width}px`, height: `${height}px` }} />;
};

export default HourglassSpiral;
