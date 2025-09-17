// Themes: resonant mist, standing calm, analytic bloom
// Visualisation: A cloud of particles oscillates according to Helmholtz eigenmodes, forming breathing shells
// Unique mechanism: Samples a 3D Helmholtz eigenmode field and animates particles via cosine-driven amplitudes in a Three.js point cloud
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

const HelmholtzPointCloud: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | undefined>();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF0EEE6);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const count = 26000;
    const positions = new Float32Array(count * 3);
    const amplitudes = new Float32Array(count);

    const eigenMode = (x: number, y: number, z: number) => {
      return (
        Math.sin(Math.PI * x) * Math.sin(2 * Math.PI * y) * Math.sin(Math.PI * z) +
        0.6 * Math.sin(2 * Math.PI * x) * Math.sin(Math.PI * y) * Math.sin(2 * Math.PI * z)
      );
    };

    let filled = 0;
    const rng = () => Math.random() * 2 - 1;
    while (filled < count) {
      const x = rng();
      const y = rng();
      const z = rng();
      const radius = Math.sqrt(x * x + y * y + z * z);
      if (radius > 1) continue;
      const mode = eigenMode((x + 1) / 2, (y + 1) / 2, (z + 1) / 2);
      positions[filled * 3] = x * 1.8;
      positions[filled * 3 + 1] = y * 1.8;
      positions[filled * 3 + 2] = z * 1.8;
      amplitudes[filled] = mode;
      filled++;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aAmplitude', new THREE.Float32BufferAttribute(amplitudes, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x1f1f1f) },
      },
      vertexShader: `
        attribute float aAmplitude;
        uniform float uTime;
        varying float vAlpha;
        void main() {
          float pulse = 0.18 * cos(uTime * 0.8 + aAmplitude * 3.14159);
          vec3 displaced = position + pulse * normalize(position + vec3(0.0001));
          vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
          gl_PointSize = 200.0 / -mvPosition.z;
          vAlpha = 0.25 + 0.25 * sin(uTime + aAmplitude * 6.283);
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
      points.rotation.y += delta * 0.16;
      points.rotation.x += delta * 0.1;
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
  themes: 'helmholtz,eigenmode,point-cloud',
  visualisation: 'Particles pulse with Helmholtz eigenmodes in 3D',
  promptSuggestion: '1. Imagine standing waves filling space\n2. Watch shells shimmer as eigenmodes breathe\n3. Let resonant mist calm your focus'
};
(HelmholtzPointCloud as any).metadata = metadata;

export default HelmholtzPointCloud;

// Differs from others by: Samples a 3D Helmholtz eigenmode field to animate a Three.js point cloud.
