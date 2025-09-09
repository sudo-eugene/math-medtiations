import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

const PineconeDelicate: React.FC<VisualProps> = ({ width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const mount = containerRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F0EEE6');

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 16;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const pineCone = new THREE.Group();
    scene.add(pineCone);

    const resources: {
      geometries: THREE.BufferGeometry[];
      materials: THREE.Material[];
    } = {
      geometries: [],
      materials: [],
    };

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.7, 0.7);
    shape.lineTo(0.5, 1.4);
    shape.lineTo(0, 1.7);
    shape.lineTo(-0.5, 1.4);
    shape.lineTo(-0.7, 0.7);
    shape.closePath();

    const extrudeSettings = {
      depth: 0.05,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    };

    const scaleGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    resources.geometries.push(scaleGeometry);

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: '#e0ded8',
      transparent: true,
      opacity: 0.15,
      roughness: 0.1,
      metalness: 0.0,
      transmission: 0.6,
      thickness: 0.1,
      side: THREE.DoubleSide,
    });
    resources.materials.push(glassMaterial);

    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: '#666666',
      transparent: true,
      opacity: 0.3,
    });
    resources.materials.push(wireframeMaterial);

    const edgesGeometry = new THREE.EdgesGeometry(scaleGeometry);
    resources.geometries.push(edgesGeometry);

    const layers = 38;
    const scalesPerLayer = 8;
    const totalScales = layers * scalesPerLayer;

    const instancedMesh = new THREE.InstancedMesh(scaleGeometry, glassMaterial, totalScales);
    pineCone.add(instancedMesh);

    const wireframeGroup = new THREE.Group();
    pineCone.add(wireframeGroup);

    const matrix = new THREE.Matrix4();
    let scaleIndex = 0;

    for (let layer = 0; layer < layers; layer++) {
      const yPosition = (layer / layers) * 18 - 9 - 0.9;
      let layerRadius;
      if (layer < 10) {
        layerRadius = Math.sin((layer / 10) * Math.PI * 0.5) * 2;
      } else {
        layerRadius = 2 + Math.sin(((layer - 10) / (layers - 10)) * Math.PI) * 2.5;
      }
      const taper = 1 - (layer / layers) * 0.3;

      for (let i = 0; i < scalesPerLayer; i++) {
        const angle = (i / scalesPerLayer) * Math.PI * 2 + (layer * 0.25);

        const position = new THREE.Vector3(
          Math.cos(angle) * layerRadius * taper,
          yPosition,
          Math.sin(angle) * layerRadius * taper
        );

        const rotation = new THREE.Euler(Math.PI / 3, angle, 0);
        const quaternion = new THREE.Quaternion().setFromEuler(rotation);
        const scale = new THREE.Vector3(0.8, 0.8, 0.8);

        matrix.compose(position, quaternion, scale);
        instancedMesh.setMatrixAt(scaleIndex, matrix);
        scaleIndex++;

        const wireframe = new THREE.LineSegments(edgesGeometry, wireframeMaterial);
        wireframe.position.copy(position);
        wireframe.rotation.copy(rotation);
        wireframe.scale.copy(scale);
        wireframeGroup.add(wireframe);
      }
    }
    instancedMesh.instanceMatrix.needsUpdate = true;

    let time = 0;
    let animationFrameId: number;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.005;
      pineCone.rotation.y = time * 0.3;
      pineCone.rotation.x = Math.sin(time * 0.5) * 0.05;
      pineCone.rotation.z = Math.cos(time * 0.7) * 0.03;
      const breathe = 1 + Math.sin(time * 0.5) * 0.02;
      pineCone.scale.set(breathe, breathe, breathe);
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resources.geometries.forEach((g) => g.dispose());
      resources.materials.forEach((m) => m.dispose());
      scene.remove(pineCone);
      while(wireframeGroup.children.length > 0){
        wireframeGroup.remove(wireframeGroup.children[0]);
      }
      pineCone.remove(instancedMesh);
      pineCone.remove(wireframeGroup);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    />
  );
};

export default PineconeDelicate;
