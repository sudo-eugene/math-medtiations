// Themes: molecular calm, potential wells, floating points
// Visualisation: Points hover in 3D Morse potential wells, pulsing gently
// Unique mechanism: Positions points using Morse potential minima and updates them with a shader-based point cloud in Three.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const MorsePotentialPoints: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | undefined>();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF0EEE6);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const rng = createRng(0x6fdc8a31);
    const count = 24000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const depth = (x: number, y: number, z: number) => {
      const wells = [
        { center: new THREE.Vector3(-1.2, -0.6, 0.4), depth: 1.2 },
        { center: new THREE.Vector3(1.1, 0.4, -0.2), depth: 1.0 },
        { center: new THREE.Vector3(0.2, -0.2, 1.1), depth: 0.9 }
      ];
      let potential = 0;
      for (let i = 0; i < wells.length; i++) {
        const w = wells[i];
        const dx = x - w.center.x;
        const dy = y - w.center.y;
        const dz = z - w.center.z;
        const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const De = w.depth;
        potential += De * Math.pow(1 - Math.exp(-1.2 * (r - 0.6)), 2);
      }
      return potential;
    };

    let filled = 0;
    let attempts = 0;
    while (filled < count && attempts < count * 10) {
      attempts++;
      const x = (rng() * 2 - 1) * 2.5;
      const y = (rng() * 2 - 1) * 2.5;
      const z = (rng() * 2 - 1) * 2.5;
      const pot = depth(x, y, z);
      if (pot < 0.4) {
        const idx = filled * 3;
        positions[idx] = x;
        positions[idx + 1] = y;
        positions[idx + 2] = z;
        sizes[filled] = 1.2 + rng() * 1.2;
        filled++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x1f1f1f) },
      },
      vertexShader: `
        attribute float aSize;
        uniform float uTime;
        varying float vAlpha;
        void main() {
          vec3 displaced = position;
          float pulse = 0.12 * sin(uTime + displaced.z * 2.0);
          displaced += pulse * normalize(displaced + vec3(0.0001));
          vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
          gl_PointSize = aSize * (280.0 / -mvPosition.z);
          vAlpha = 0.25 + 0.25 * sin(uTime * 0.6 + displaced.x * 1.3);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float d = dot(uv, uv);
          if (d > 0.25) discard;
          float alpha = vAlpha * smoothstep(0.25, 0.0, d);
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      points.rotation.y += delta * 0.12;
      points.rotation.x += delta * 0.07;
      material.uniforms.uTime.value = elapsed;
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      scene.clear();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [width, height]);

  return (
    <div ref={mountRef} style={{ width: `${width}px`, height: `${height}px`, background: '#F0EEE6', overflow: 'hidden' }} />
  );
};

const metadata = {
  themes: 'morse,potential,points',
  visualisation: 'Morse potential wells hold shimmering points',
  promptSuggestion: '1. Picture molecular wells humming softly\n2. Watch points pulse in conserved depth\n3. Breathe with the floating lattice'
};
(MorsePotentialPoints as any).metadata = metadata;

export default MorsePotentialPoints;

// Differs from others by: Places a point cloud in minima of Morse potential wells and animates it via a Three.js shader.
