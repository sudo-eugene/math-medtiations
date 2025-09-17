// Themes: quaternion precession, halo calm, spatial chorus
// Visualisation: A halo of points precesses via quaternion rotations, forming gentle spatial ribbons
// Unique mechanism: Applies time-varying quaternion rotations to a spherical point cloud and renders it with Three.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { VisualProps } from '../../types';

const QuaternionHaloPoints: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | undefined>();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF0EEE6);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const count = 22000;
    const positions = new Float32Array(count * 3);
    let idx = 0;
    for (let i = 0; i < count; i++) {
      const theta = Math.acos(1 - 2 * Math.random());
      const phi = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 0.3;
      positions[idx++] = radius * Math.sin(theta) * Math.cos(phi);
      positions[idx++] = radius * Math.sin(theta) * Math.sin(phi);
      positions[idx++] = radius * Math.cos(theta);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x202020) },
      },
      vertexShader: `
        uniform float uTime;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          float angle = 0.6 * sin(uTime * 0.8) + length(p) * 0.3;
          vec4 q = vec4(normalize(vec3(0.5, sin(uTime * 0.4), cos(uTime * 0.5))), cos(angle * 0.5));
          vec3 u = q.xyz;
          float s = q.w;
          vec3 rotated = 2.0 * dot(u, p) * u + (s * s - dot(u, u)) * p + 2.0 * s * cross(u, p);
          vec4 mvPosition = modelViewMatrix * vec4(rotated, 1.0);
          gl_PointSize = 170.0 / -mvPosition.z;
          vAlpha = 0.22 + 0.2 * sin(uTime + length(rotated));
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
      points.rotation.x += delta * 0.08;
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
  themes: 'quaternion,halo,point-cloud',
  visualisation: 'Quaternion precession drives a point halo',
  promptSuggestion: '1. Picture a halo rotating by quaternions\n2. Follow the chorus of spatial points\n3. Let the gentle precession calm you'
};
(QuaternionHaloPoints as any).metadata = metadata;

export default QuaternionHaloPoints;

// Differs from others by: Applies time-varying quaternion rotations to a spherical point cloud in Three.js to produce a halo.
