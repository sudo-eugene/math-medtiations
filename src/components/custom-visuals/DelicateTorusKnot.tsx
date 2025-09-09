import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';
import * as THREE from 'three';

// Themes: underlying unity, harmony in complexity, interconnectedness
// Visualization: A delicate torus knot that reveals the underlying unity of a complex form

const DelicateTorusKnot: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0xF0EEE6);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.TorusKnotGeometry(2, 0.5, 100, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: true });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    camera.position.z = 5;

    let time = 0;
    const animate = () => {
      time += 0.01;
      torusKnot.rotation.x = time;
      torusKnot.rotation.y = time;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [width, height]);

  return <div ref={mountRef} style={{ width: `${width}px`, height: `${height}px` }} />;
};

export default DelicateTorusKnot;
