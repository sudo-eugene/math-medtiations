// Themes: knot harmony, spatial chorus, looping calm
// Visualisation: A chorus of points traces a trefoil knot, pulsing softly in 3D space
// Unique mechanism: Samples a trefoil knot parametric curve and animates points along it using a phase-shifted Three.js point cloud
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

const TrefoilPointChorus: React.FC<VisualProps> = ({ width, height }) => {
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

    const count = 22000;
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const r = 1.6;
      const x = Math.sin(t) + 2 * Math.sin(2 * t);
      const y = Math.cos(t) - 2 * Math.cos(2 * t);
      const z = -Math.sin(3 * t);
      positions[i * 3] = r * x * 0.5;
      positions[i * 3 + 1] = r * y * 0.5;
      positions[i * 3 + 2] = r * z * 0.5;
      phases[i] = t;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x1c1c1c) },
      },
      vertexShader: `
        attribute float aPhase;
        uniform float uTime;
        varying float vAlpha;
        void main() {
          float shift = 0.14 * sin(uTime * 0.7 + aPhase * 2.0);
          vec3 displaced = position + shift * normalize(position + vec3(0.0001));
          vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
          gl_PointSize = 160.0 / -mvPosition.z;
          vAlpha = 0.24 + 0.22 * sin(uTime + aPhase * 3.0);
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
      points.rotation.y += delta * 0.18;
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
  themes: 'trefoil,knot,chorus',
  visualisation: 'Trefoil knot point cloud pulses softly',
  promptSuggestion: '1. Follow the knot looping in harmony\n2. Imagine a chorus humming in space\n3. Breathe with the rotating trefoil'
};
(TrefoilPointChorus as any).metadata = metadata;

export default TrefoilPointChorus;

// Differs from others by: Samples a trefoil knot parametric curve and animates it as a shader-driven Three.js point cloud.
