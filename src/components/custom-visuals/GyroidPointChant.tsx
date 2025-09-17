// Themes: porous space, lattice chanting, spatial serenity
// Visualisation: A gyroid point cloud rotates softly, shimmering with breathing opacity
// Unique mechanism: Points sampled on a gyroid isosurface animated with a custom shader-based point size attribute
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

const GyroidPointChant: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | undefined>();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF0EEE6);

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const rng = createRng(0x7123b4aa);
    const count = 26000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    let filled = 0;
    const limit = count * 12;
    let attempts = 0;
    while (filled < count && attempts < limit) {
      attempts++;
      const x = (rng() * 2 - 1) * 2;
      const y = (rng() * 2 - 1) * 2;
      const z = (rng() * 2 - 1) * 2;
      const value = Math.sin(x) * Math.cos(y) + Math.sin(y) * Math.cos(z) + Math.sin(z) * Math.cos(x);
      if (Math.abs(value) < 0.25) {
        const idx = filled * 3;
        positions[idx] = x;
        positions[idx + 1] = y;
        positions[idx + 2] = z;
        sizes[filled] = 0.8 + rng() * 1.6;
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
        uColor: { value: new THREE.Color(0x202020) },
      },
      vertexShader: `
        attribute float aSize;
        uniform float uTime;
        varying float vAlpha;
        void main() {
          vec3 transformed = position;
          float wobble = 0.2 * sin(uTime * 0.6 + transformed.x * 1.2);
          transformed += 0.12 * vec3(
            sin(uTime * 0.3 + transformed.y * 0.8),
            cos(uTime * 0.35 + transformed.z * 0.7),
            sin(uTime * 0.4 + transformed.x * 0.6)
          );
          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          float size = aSize * (1.0 + wobble);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          vAlpha = 0.32 + 0.28 * sin(uTime * 0.5 + transformed.y * 1.1);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float dist = length(uv);
          if (dist > 0.5) discard;
          float alpha = vAlpha * smoothstep(0.5, 0.0, dist);
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
      points.rotation.y += delta * 0.22;
      points.rotation.x += delta * 0.13;
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
  themes: 'gyroid,lattice,chant',
  visualisation: 'Gyroid lattice of points humming softly',
  promptSuggestion: '1. Picture a porous labyrinth singing\n2. Follow the rotating lattice with your breath\n3. Sense the gyroid chanting in slow motion'
};
(GyroidPointChant as any).metadata = metadata;

export default GyroidPointChant;

// Differs from others by: Samples a gyroid isosurface and renders it with a shader using per-point sizes and breathing alpha.
