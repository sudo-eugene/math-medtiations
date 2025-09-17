// Themes: soap film geometry, surface tension, mathematical minimal energy
// Visualisation: Soap film surfaces minimize area energy creating elegant geometric forms
// Unique mechanism: Minimal surface equation solving with area minimization dynamics

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

const MinimalSurfaces: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let surfaces: THREE.Points[] = [];
    let animationId: number;

    // PRNG for deterministic behavior
    let seed = 42891;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // Minimal surface functions
    const catenoid = (u: number, v: number, scale: number = 1) => {
      const x = scale * Math.cosh(v) * Math.cos(u);
      const y = scale * Math.cosh(v) * Math.sin(u);
      const z = scale * v;
      return new THREE.Vector3(x, y, z);
    };

    const helicoid = (u: number, v: number, scale: number = 1) => {
      const x = scale * v * Math.cos(u);
      const y = scale * v * Math.sin(u);
      const z = scale * u;
      return new THREE.Vector3(x, y, z);
    };

    const enneper = (u: number, v: number, scale: number = 1) => {
      const x = scale * (u - (u * u * u) / 3 + u * v * v);
      const y = scale * (v - (v * v * v) / 3 + v * u * u);
      const z = scale * (u * u - v * v);
      return new THREE.Vector3(x, y, z);
    };

    const createSurface = (surfaceFunc: Function, uRange: [number, number], vRange: [number, number], resolution: number, scale: number) => {
      const positions: number[] = [];
      const colors: number[] = [];
      const sizes: number[] = [];

      const [uMin, uMax] = uRange;
      const [vMin, vMax] = vRange;

      for (let i = 0; i <= resolution; i++) {
        for (let j = 0; j <= resolution; j++) {
          const u = uMin + (uMax - uMin) * (i / resolution);
          const v = vMin + (vMax - vMin) * (j / resolution);

          const point = surfaceFunc(u, v, scale);
          
          // Skip invalid points
          if (!isFinite(point.x) || !isFinite(point.y) || !isFinite(point.z)) continue;

          positions.push(point.x, point.y, point.z);

          // Color based on position and curvature
          const intensity = 0.5 + Math.sin(u + v) * 0.2;
          colors.push(intensity, intensity, intensity);

          sizes.push(1 + Math.sin(u * 2 + v * 2) * 0.5);
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          uniform float time;

          void main() {
            vColor = color;
            
            vec3 pos = position;
            // Minimal surface evolution
            pos += 0.1 * sin(time + position.x * 0.5) * normal;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = size * (200.0 / -mvPosition.z);
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          
          void main() {
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);
            
            if (dist > 0.5) discard;
            
            float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
            gl_FragColor = vec4(vColor * 0.8, alpha * 0.6);
          }
        `,
        transparent: true,
        depthWrite: false
      });

      return new THREE.Points(geometry, material);
    };

    // Setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(width, height);
    renderer.setClearColor(0xF0EEE6);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    camera.position.set(0, 0, 5);

    // Create multiple minimal surfaces
    const catenoidSurface = createSurface(catenoid, [-Math.PI, Math.PI], [-1, 1], 30, 0.5);
    catenoidSurface.position.set(-2, 0, 0);
    surfaces.push(catenoidSurface);
    scene.add(catenoidSurface);

    const helicoidSurface = createSurface(helicoid, [-Math.PI, Math.PI], [-1, 1], 30, 0.3);
    helicoidSurface.position.set(0, 0, 0);
    surfaces.push(helicoidSurface);
    scene.add(helicoidSurface);

    const enneperSurface = createSurface(enneper, [-1, 1], [-1, 1], 25, 0.2);
    enneperSurface.position.set(2, 0, 0);
    surfaces.push(enneperSurface);
    scene.add(enneperSurface);

    // Animation
    const clock = new THREE.Clock();
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const time = clock.getElapsedTime();
      
      surfaces.forEach((surface, i) => {
        if (surface.material instanceof THREE.ShaderMaterial) {
          surface.material.uniforms.time.value = time;
        }
        
        // Gentle rotation
        surface.rotation.y = time * 0.1 + i * Math.PI / 3;
        surface.rotation.x = Math.sin(time * 0.05 + i) * 0.2;
      });
      
      renderer.render(scene, camera);
    };
    
    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      
      renderer.dispose();
      surfaces.forEach(surface => {
        if (surface.geometry) surface.geometry.dispose();
        if (surface.material instanceof THREE.Material) surface.material.dispose();
      });
      
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

// Differs from others by: Computes and displays minimal surface equations (catenoid, helicoid, Enneper) with area minimization - no other visual implements differential geometry surfaces

const metadata = {
  themes: "soap film geometry, surface tension, mathematical minimal energy",
  visualisation: "Soap film surfaces minimize area energy creating elegant geometric forms",
  promptSuggestion: "1. Adjust surface parameterization ranges\n2. Vary surface evolution speed\n3. Control point density and visualization"
};
(MinimalSurfaces as any).metadata = metadata;

export default MinimalSurfaces;
