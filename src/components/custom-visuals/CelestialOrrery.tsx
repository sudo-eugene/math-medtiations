import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

const CelestialOrrery: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 20;

    const starGeometry = new THREE.SphereGeometry(2, 32, 32);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(star);

    const planet1Geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const planet1Material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const planet1 = new THREE.Mesh(planet1Geometry, planet1Material);
    planet1.position.x = 5;
    scene.add(planet1);

    const planet2Geometry = new THREE.SphereGeometry(0.8, 32, 32);
    const planet2Material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const planet2 = new THREE.Mesh(planet2Geometry, planet2Material);
    planet2.position.x = 10;
    scene.add(planet2);

    const animate = () => {
      requestAnimationFrame(animate);
      planet1.position.x = 5 * Math.cos(Date.now() * 0.001);
      planet1.position.y = 5 * Math.sin(Date.now() * 0.001);
      planet2.position.x = 10 * Math.cos(Date.now() * 0.0005);
      planet2.position.y = 10 * Math.sin(Date.now() * 0.0005);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [width, height]);

  return <div ref={mountRef} />;
};

export default CelestialOrrery;
