import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';
import * as THREE from 'three';

// themes: emptiness creates utility, space enables function, usefulness through void
// visualization: Three structures defined by their empty spaces - a wheel's hub, a vessel's cavity, a room's openings

const VoidArchitecture: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const dpr = window.devicePixelRatio || 1;

    // Set up scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    // Improve sharpness for high DPI screens
    renderer.setPixelRatio(Math.min(dpr, 2)); // Cap at 2 for performance
    renderer.setSize(width, height);
    renderer.setClearColor(0xF0EEE6);

    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0x808080, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(ambientLight);
    scene.add(directionalLight);

    // Materials
    const material = new THREE.LineBasicMaterial({ 
      color: 0x333333,
      transparent: true,
      opacity: 0.6
    });

    // Create wheel structure ("Thirty spokes join the hub")
    const createWheel = () => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const spokes = 30;
      const radius = 8;
      const hubRadius = 1;
      
      // Create hub
      for (let i = 0; i < spokes; i++) {
        const angle = (i / spokes) * Math.PI * 2;
        const nextAngle = ((i + 1) / spokes) * Math.PI * 2;
        
        // Hub circle
        vertices.push(
          Math.cos(angle) * hubRadius, 0, Math.sin(angle) * hubRadius,
          Math.cos(nextAngle) * hubRadius, 0, Math.sin(nextAngle) * hubRadius
        );
        
        // Spokes
        vertices.push(
          Math.cos(angle) * hubRadius, 0, Math.sin(angle) * hubRadius,
          Math.cos(angle) * radius, 0, Math.sin(angle) * radius
        );
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      return new THREE.LineSegments(geometry, material);
    };

    // Create vessel ("Clay forms a vessel")
    const createVessel = () => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const layers = 20;
      const pointsPerLayer = 16;
      
      for (let i = 0; i <= layers; i++) {
        const y = i - layers/2;
        // Create vessel shape
        const radius = 3 * Math.sin(Math.PI * (i/layers));
        
        for (let j = 0; j < pointsPerLayer; j++) {
          const angle1 = (j/pointsPerLayer) * Math.PI * 2;
          const angle2 = ((j+1)/pointsPerLayer) * Math.PI * 2;
          
          vertices.push(
            Math.cos(angle1) * radius, y, Math.sin(angle1) * radius,
            Math.cos(angle2) * radius, y, Math.sin(angle2) * radius
          );

          // Vertical lines
          if (i < layers) {
            vertices.push(
              Math.cos(angle1) * radius, y, Math.sin(angle1) * radius,
              Math.cos(angle1) * radius, y + 1, Math.sin(angle1) * radius
            );
          }
        }
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      return new THREE.LineSegments(geometry, material);
    };

    // Create room structure ("We build walls with windows and doors")
    const createRoom = () => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const size = 6;
      const height = 8;
      
      // Base frame
      const basePoints = [
        [-size, 0, -size],
        [size, 0, -size],
        [size, 0, size],
        [-size, 0, size],
        [-size, height, -size],
        [size, height, -size],
        [size, height, size],
        [-size, height, size]
      ];

      // Connect base points
      for (let i = 0; i < 4; i++) {
        // Bottom square
        vertices.push(
          ...basePoints[i],
          ...basePoints[(i + 1) % 4]
        );
        // Top square
        vertices.push(
          ...basePoints[i + 4],
          ...basePoints[((i + 1) % 4) + 4]
        );
        // Vertical lines
        vertices.push(
          ...basePoints[i],
          ...basePoints[i + 4]
        );
      }

      // Add door frame
      const doorWidth = 2;
      const doorHeight = 4;
      vertices.push(
        -doorWidth/2, 0, -size,
        -doorWidth/2, doorHeight, -size,
        doorWidth/2, 0, -size,
        doorWidth/2, doorHeight, -size,
        -doorWidth/2, doorHeight, -size,
        doorWidth/2, doorHeight, -size
      );

      // Add windows
      const windowSize = 1.5;
      const windowHeight = 5;
      const addWindow = (x, z) => {
        vertices.push(
          x - windowSize, windowHeight - windowSize, z,
          x + windowSize, windowHeight - windowSize, z,
          x + windowSize, windowHeight + windowSize, z,
          x - windowSize, windowHeight + windowSize, z,
          x - windowSize, windowHeight - windowSize, z
        );
      };

      // Add windows to sides
      addWindow(-size, 0);
      addWindow(size, 0);

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      return new THREE.LineSegments(geometry, material);
    };

    const wheel = createWheel();
    const vessel = createVessel();
    const room = createRoom();

    // Position elements
    wheel.position.set(-12, 0, 0);
    vessel.position.set(12, 0, 0);
    room.position.set(0, -4, 0);

    scene.add(wheel);
    scene.add(vessel);
    scene.add(room);

    // Position camera
    camera.position.set(15, 15, 25);
    camera.lookAt(0, 0, 0);

    // Animation
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Gentle rotation
      wheel.rotation.y += 0.002;
      vessel.rotation.y += 0.001;
      room.rotation.y += 0.0005;

      renderer.render(scene, camera);
    };
    animate();


    return () => {
      cancelAnimationFrame(frameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      scene.traverse((object) => {
        if (object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [width, height]);

  return (
    <div 
      ref={mountRef}
      style={{ 
        width: `${width}px`,
        height: `${height}px`,
        margin: 0,
        background: '#F0EEE6',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    />
  );
};

export default VoidArchitecture;
