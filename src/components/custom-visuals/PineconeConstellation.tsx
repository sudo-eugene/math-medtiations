import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';
import * as THREE from 'three';

// Themes: power of softness, entering the void, non-action's effectiveness
// Visualization: A delicate constellation that appears through empty space, showing how the gentlest connections create the strongest patterns

const PineconeConstellation: React.FC<VisualProps> = ({ width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // The void from which form emerges
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F0EEE6');
    
    // The space through which we perceive
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 10;
    camera.position.y = 0;
    
    // The bridge between emptiness and form
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);
    
    // Create main group
    const pineCone = new THREE.Group();
    
    // Track all created geometries and materials for proper cleanup
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const meshes: THREE.Mesh[] = [];
    const lines: THREE.Line[] = [];
    
    // Create constellation points
    const layers = 45;
    const pointsPerLayer = 12;
    
    // Store all vertices for creating connections
    const vertices: THREE.Vector3[] = [];
    
    // Shape inverted - narrower at top, wider at bottom
    for (let layer = 0; layer < layers; layer++) {
      const yPosition = (layer / layers) * 18 - 9;
      let layerRadius;
      
      if (layer < 10) {
        // Narrow top
        layerRadius = 3.5 * (layer / 10) * 0.7;
      } else if (layer < 35) {
        // Middle to bottom expansion
        layerRadius = 2.45 + Math.sin(((layer - 10) / 25) * Math.PI) * 1.8;
      } else {
        // Dome-like bottom
        layerRadius = Math.sin(((layers - layer) / 10) * Math.PI * 0.5) * 2;
      }
      
      const taper = 1 - (layer / layers) * 0.3;
      
      for (let i = 0; i < pointsPerLayer; i++) {
        const angle = (i / pointsPerLayer) * Math.PI * 2 + (layer * 0.2);
        
        const x = Math.cos(angle) * layerRadius * taper;
        const z = Math.sin(angle) * layerRadius * taper;
        
        const vertex = new THREE.Vector3(x, yPosition, z);
        vertices.push(vertex);
        
        // Create a mesh for each point
        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.6 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(vertex);
        
        pineCone.add(mesh);
        
        // Track resources for cleanup
        geometries.push(geometry);
        materials.push(material);
        meshes.push(mesh);
      }
    }
    
    // Create connections
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.2 });
    materials.push(lineMaterial);
    
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        const distance = vertices[i].distanceTo(vertices[j]);
        
        if (distance < 1.5) {
          const geometry = new THREE.BufferGeometry().setFromPoints([vertices[i], vertices[j]]);
          const line = new THREE.Line(geometry, lineMaterial);
          pineCone.add(line);
          
          // Track resources for cleanup
          geometries.push(geometry);
          lines.push(line);
        }
      }
    }
    
    scene.add(pineCone);
    
    // Animation loop
    let animationFrameId: number | null = null;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Rotate the pine cone
      pineCone.rotation.y += 0.002;
      pineCone.rotation.x += 0.001;
      
      renderer.render(scene, camera);
    };
    
    animate();
    

    // Cleanup function
    return () => {
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Dispose of all created resources
      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      
      meshes.forEach(mesh => pineCone.remove(mesh));
      lines.forEach(line => pineCone.remove(line));
      
      scene.remove(pineCone);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
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
        alignItems: 'center' 
      }}
    />
  );
};

export default PineconeConstellation;
