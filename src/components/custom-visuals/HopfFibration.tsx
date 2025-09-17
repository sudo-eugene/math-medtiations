// Themes: 4D geometry, hypersphere projection, mathematical beauty
// Visualisation: 4D hypersphere projects to 3D visual patterns showing topological structure
// Unique mechanism: Hopf fibration mathematical projection from 4D quaternion space to 3D

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

const HopfFibration: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let points: THREE.Points;
    let animationId: number;

    // PRNG for deterministic behavior
    let seed = 87324;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // Hopf fibration: S³ → S²
    const hopfMap = (q: THREE.Vector4): THREE.Vector3 => {
      // Quaternion to 3D point via stereographic projection
      const denom = 1 + q.w;
      if (Math.abs(denom) < 0.0001) {
        return new THREE.Vector3(0, 0, 1); // Handle singularity
      }
      
      return new THREE.Vector3(
        2 * q.x / denom,
        2 * q.y / denom,
        2 * q.z / denom
      );
    };

    // Generate points on S³ (4D unit sphere)
    const generateHopfFibers = (numFibers: number, pointsPerFiber: number) => {
      const positions: number[] = [];
      const colors: number[] = [];
      const sizes: number[] = [];

      for (let fiber = 0; fiber < numFibers; fiber++) {
        // Generate a great circle on S³
        const basePoint = new THREE.Vector4(
          random() - 0.5,
          random() - 0.5,
          random() - 0.5,
          random() - 0.5
        );
        basePoint.normalize();

        const tangent = new THREE.Vector4(
          random() - 0.5,
          random() - 0.5,
          random() - 0.5,
          random() - 0.5
        );
        // Make tangent orthogonal to base point
        const dot = basePoint.dot(tangent);
        tangent.x -= dot * basePoint.x;
        tangent.y -= dot * basePoint.y;
        tangent.z -= dot * basePoint.z;
        tangent.w -= dot * basePoint.w;
        tangent.normalize();

        for (let i = 0; i < pointsPerFiber; i++) {
          const t = (i / pointsPerFiber) * Math.PI * 2;
          
          // Point on great circle in S³
          const q = new THREE.Vector4(
            basePoint.x * Math.cos(t) + tangent.x * Math.sin(t),
            basePoint.y * Math.cos(t) + tangent.y * Math.sin(t),
            basePoint.z * Math.cos(t) + tangent.z * Math.sin(t),
            basePoint.w * Math.cos(t) + tangent.w * Math.sin(t)
          );

          // Project to S² via Hopf map
          const projected = hopfMap(q);
          
          positions.push(projected.x, projected.y, projected.z);
          
          // Color based on fiber and position
          const hue = fiber / numFibers;
          const intensity = 0.4 + Math.sin(t) * 0.2;
          colors.push(intensity, intensity, intensity);
          
          sizes.push(2 + Math.sin(t * 3) * 1);
        }
      }

      return { positions, colors, sizes };
    };

    // Setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(width, height);
    renderer.setClearColor(0xF0EEE6);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    camera.position.set(0, 0, 3);

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const { positions, colors, sizes } = generateHopfFibers(12, 50);
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    // Shader material for points
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vSize;
        uniform float time;

        void main() {
          vColor = color;
          vSize = size;
          
          // Hopf rotation in 4D space
          vec4 pos4d = vec4(position, 1.0);
          float angle = time * 0.5;
          
          // Rotate in 4D using quaternion-like rotation
          float c = cos(angle);
          float s = sin(angle);
          vec4 rotated = vec4(
            pos4d.x * c - pos4d.w * s,
            pos4d.y,
            pos4d.z,
            pos4d.x * s + pos4d.w * c
          );
          
          vec4 mvPosition = modelViewMatrix * vec4(rotated.xyz, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size * (300.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vSize;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          gl_FragColor = vec4(vColor * 0.8, alpha * 0.7);
        }
      `,
      transparent: true,
      depthWrite: false
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);

    // Animation
    const clock = new THREE.Clock();
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const time = clock.getElapsedTime();
      material.uniforms.time.value = time;
      
      // Rotate the entire fiber bundle
      points.rotation.y = time * 0.1;
      points.rotation.x = Math.sin(time * 0.05) * 0.2;
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [width, height]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: `${width}px`, 
        height: `${height}px`, 
        background: '#F0EEE6',
        overflow: 'hidden' 
      }}
    />
  );
};

// Differs from others by: Implements 4D to 3D Hopf fibration projection using quaternion mathematics - no other visual projects 4D hypersphere topology

const metadata = {
  themes: "4D geometry, hypersphere projection, mathematical beauty",
  visualisation: "4D hypersphere projects to 3D visual patterns showing topological structure",
  promptSuggestion: "1. Adjust 4D rotation parameters\n2. Vary fiber density and structure\n3. Control projection visualization"
};
(HopfFibration as any).metadata = metadata;

export default HopfFibration;
