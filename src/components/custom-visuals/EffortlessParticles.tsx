import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Themes: universal treasure, Source as refuge, forgiveness in alignment
// Visualization: Particles that spiral around a central point of energy, showing how all things return to Source

const EffortlessParticles: React.FC<{ count?: number }> = ({ count = 20000 }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const pointsRef = useRef<THREE.Points | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor('#F0EEE6');
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const particles = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      particles[i] = (Math.random() - 0.5) * 100;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));

    const material = new THREE.PointsMaterial({
      color: 0x333333,
      size: 0.1,
      transparent: true,
      opacity: 0.7,
    });

    const points = new THREE.Points(geometry, material);
    pointsRef.current = points;
    scene.add(points);

    let time = 0;
    const animate = () => {
      time += 0.005;
      if (pointsRef.current) {
        pointsRef.current.rotation.y = time;
      }
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [count]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default EffortlessParticles;
