import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

const ProceduralCityscape: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);

    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    for (let i = 0; i < 100; i++) {
      const buildingHeight = Math.random() * 50 + 10;
      const buildingGeometry = new THREE.BoxGeometry(10, buildingHeight, 10);
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      building.position.set(
        (Math.random() - 0.5) * 200,
        buildingHeight / 2,
        (Math.random() - 0.5) * 200
      );
      scene.add(building);
    }

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.0001;
      directionalLight.position.x = Math.sin(time);
      directionalLight.position.y = Math.cos(time);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [width, height]);

  return <div ref={mountRef} />;
};

export default ProceduralCityscape;
