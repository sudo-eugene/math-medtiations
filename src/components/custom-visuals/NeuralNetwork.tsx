import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

const NeuralNetwork: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 100;

    const layers = [4, 5, 5, 3];
    const nodes: THREE.Mesh[] = [];
    const connections: THREE.Line[] = [];

    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const nodeGeometry = new THREE.SphereGeometry(2, 16, 16);

    for (let i = 0; i < layers.length; i++) {
      for (let j = 0; j < layers[i]; j++) {
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
        node.position.set(
          (i - (layers.length - 1) / 2) * 40,
          (j - (layers[i] - 1) / 2) * 20,
          0
        );
        nodes.push(node);
        scene.add(node);
      }
    }

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.5 });
    let nodeIndex = 0;
    for (let i = 0; i < layers.length - 1; i++) {
      for (let j = 0; j < layers[i]; j++) {
        for (let k = 0; k < layers[i + 1]; k++) {
          const startNode = nodes[nodeIndex + j];
          const endNode = nodes[nodeIndex + layers[i] + k];
          const geometry = new THREE.BufferGeometry().setFromPoints([
            startNode.position,
            endNode.position,
          ]);
          const line = new THREE.Line(geometry, lineMaterial);
          connections.push(line);
          scene.add(line);
        }
      }
      nodeIndex += layers[i];
    }

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      nodes.forEach(node => {
        (node.material as THREE.MeshBasicMaterial).color.setHSL(Math.sin(time + node.position.x * 0.1), 0.5, 0.5);
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

export default NeuralNetwork;
