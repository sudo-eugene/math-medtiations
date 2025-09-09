import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';
import * as THREE from 'three';

// Themes: effortless action, natural development, finding strength in yielding
// Visualization: A complex 3D form that grows and unfolds effortlessly, demonstrating how natural development occurs without force

const metadata = {
  themes: "effortless action, natural development, finding strength in yielding",
  visualization: "A complex 3D form that grows and unfolds effortlessly, demonstrating how natural development occurs without force",
  promptSuggestion: "1. Adjust growth speed\n2. Change color palette\n3. Modify fractal depth\n4. Add more rotation\n5. Alter lighting"
};

const Artwork63v2: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0xF0EEE6);
    mountRef.current.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const createBranch = (depth: number, maxDepth: number): THREE.Group => {
      const branch = new THREE.Group();
      if (depth > maxDepth) return branch;

      const geometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
      const material = new THREE.MeshBasicMaterial({ color: 0x333333 });
      const cylinder = new THREE.Mesh(geometry, material);
      cylinder.position.y = 0.5;
      branch.add(cylinder);

      const nextBranch = createBranch(depth + 1, maxDepth);
      nextBranch.position.y = 1;
      nextBranch.rotation.z = Math.PI / 4;
      branch.add(nextBranch);

      const nextBranch2 = createBranch(depth + 1, maxDepth);
      nextBranch2.position.y = 1;
      nextBranch2.rotation.z = -Math.PI / 4;
      branch.add(nextBranch2);

      return branch;
    };

    const tree = createBranch(0, 5);
    group.add(tree);

    camera.position.z = 5;

    let time = 0;
    const animate = () => {
      time += 0.01;
      group.rotation.y = time;
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

Artwork63v2.metadata = metadata;
export default Artwork63v2;
