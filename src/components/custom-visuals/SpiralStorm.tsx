import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';
import * as THREE from 'three';

// Themes: yielding to overcome, softness over hardness, finding strength in adaptability
// Visualization: A spiral storm that yields to its own internal forces, creating a powerful yet soft visual

const metadata = {
  themes: "yielding to overcome, softness over hardness, finding strength in adaptability",
  visualization: "A spiral storm that yields to its own internal forces, creating a powerful yet soft visual",
  promptSuggestion: "1. Adjust particle count\n2. Change spiral tightness\n3. Modify particle speed\n4. Alter color palette\n5. Add more turbulence"
};

const SpiralStorm: React.FC<VisualProps> = ({ width, height }) => {
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
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
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
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.01;
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const y = positions[i3 + 1];
        const angle = Math.atan2(y, x) + time * 0.1;
        const radius = Math.sqrt(x * x + y * y);
        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 1] = Math.sin(angle) * radius;
      }

      particleSystem.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();


    return () => {
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [width, height]);

  return <div ref={mountRef} style={{ width: `${width}px`, height: `${height}px` }} />;
};

export default SpiralStorm;
