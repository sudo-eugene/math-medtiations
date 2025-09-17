// Themes: toroidal flow, circulating breath, balanced fountain
// Visualisation: Points stream along a torus, rising and looping like a calm fountain
// Unique mechanism: Parametric torus points advected via per-point flow speeds with shader-driven rendering
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

const ToroidalStreamFountain: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | undefined>();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF0EEE6);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const rng = createRng(0x4cc19ae3);
    const count = 22000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const paramsU = new Float32Array(count);
    const paramsV = new Float32Array(count);
    const speedU = new Float32Array(count);
    const speedV = new Float32Array(count);

    const major = 1.5;
    const minor = 0.55;

    for (let i = 0; i < count; i++) {
      paramsU[i] = rng() * Math.PI * 2;
      paramsV[i] = rng() * Math.PI * 2;
      speedU[i] = 0.2 + rng() * 0.4;
      speedV[i] = 0.1 + rng() * 0.3;
      sizes[i] = 0.9 + rng() * 1.4;
    }

    const updatePositions = () => {
      for (let i = 0; i < count; i++) {
        const u = paramsU[i];
        const v = paramsV[i];
        const cosU = Math.cos(u);
        const sinU = Math.sin(u);
        const cosV = Math.cos(v);
        const sinV = Math.sin(v);
        const radial = major + minor * cosV;
        const idx = i * 3;
        positions[idx] = radial * cosU;
        positions[idx + 1] = radial * sinU;
        positions[idx + 2] = minor * sinV;
      }
    };

    updatePositions();

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
          float breathing = 0.08 * sin(uTime * 0.4 + transformed.z * 1.2);
          transformed += breathing * normalize(vec3(transformed.xy, 0.0));
          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          gl_PointSize = aSize * (280.0 / -mvPosition.z);
          vAlpha = 0.25 + 0.25 * sin(uTime * 0.6 + transformed.y * 1.4);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float d = length(uv);
          if (d > 0.5) discard;
          float alpha = vAlpha * smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const clock = new THREE.Clock();
    const twoPi = Math.PI * 2;

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      for (let i = 0; i < count; i++) {
        paramsU[i] += delta * speedU[i] * 0.4;
        paramsV[i] += delta * speedV[i] * 0.5;
        paramsV[i] += 0.2 * delta * Math.sin(elapsed * 0.5 + paramsU[i]);
        if (paramsU[i] > twoPi) paramsU[i] -= twoPi;
        if (paramsU[i] < 0) paramsU[i] += twoPi;
        if (paramsV[i] > twoPi) paramsV[i] -= twoPi;
        if (paramsV[i] < 0) paramsV[i] += twoPi;
      }
      updatePositions();
      geometry.attributes.position.needsUpdate = true;

      points.rotation.x = 0.4 + Math.sin(elapsed * 0.1) * 0.1;
      points.rotation.y += delta * 0.12;
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
  themes: 'torus,flow,fountain',
  visualisation: 'Streaming torus fountain of points',
  promptSuggestion: '1. Picture breath circulating on a torus\n2. Follow looping flows rising and settling\n3. Imagine a balanced fountain of particles'
};
(ToroidalStreamFountain as any).metadata = metadata;

export default ToroidalStreamFountain;

// Differs from others by: Advects torus parameter coordinates to animate a shader-rendered point fountain.
