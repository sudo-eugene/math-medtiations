import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

const QuantumFoam: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 100;

    const particles = new THREE.Group();
    scene.add(particles);

    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });

    const animate = () => {
      requestAnimationFrame(animate);

      if (particles.children.length < 500) {
        const particleGeometry = new THREE.SphereGeometry(Math.random() * 2, 8, 8);
        const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
        particle.position.set(
          (Math.random() - 0.5) * 200,
          (Math.random() - 0.5) * 200,
          (Math.random() - 0.5) * 200
        );
        (particle.material as THREE.MeshBasicMaterial).opacity = 0;
        particles.add(particle);
      }

      particles.children.forEach(p => {
        const particle = p as THREE.Mesh;
        const material = particle.material as THREE.MeshBasicMaterial;
        if (material.opacity < 1) {
          material.opacity += 0.01;
        } else {
          particle.scale.x *= 0.95;
          particle.scale.y *= 0.95;
          particle.scale.z *= 0.95;
          if (particle.scale.x < 0.1) {
            particles.remove(particle);
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [width, height]);

  return <div ref={mountRef} />;
};

export default QuantumFoam;
