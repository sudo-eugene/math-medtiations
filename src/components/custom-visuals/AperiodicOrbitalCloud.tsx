// Themes: strange harmony, quasi-order, cosmic drift
// Visualisation: A drifting point cloud formed by an aperiodic orbital IFS shimmers with subtle breathing
// Unique mechanism: Iterated affine-orbital function system generates and animates a quasi-periodic 3D point set rendered with shaders
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

const AperiodicOrbitalCloud: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | undefined>();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF0EEE6);

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const rng = createRng(0x18cd4f9b);
    const count = 26000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const transforms = [
      { ax: 0.62, bx: -0.42, cx: 0.41, dx: 0.58, tx: -0.1, ty: 0.18, sx: 1.2, sy: 0.9, sz: 0.4, weight: 0.33 },
      { ax: 0.48, bx: 0.32, cx: -0.56, dx: 0.52, tx: 0.34, ty: -0.22, sx: 1.5, sy: 0.7, sz: 0.5, weight: 0.27 },
      { ax: 0.36, bx: -0.58, cx: 0.52, dx: 0.38, tx: -0.28, ty: -0.3, sx: 0.8, sy: 1.4, sz: 0.6, weight: 0.4 }
    ];
    const cumulativeWeights = transforms.reduce<number[]>((arr, t, idx) => {
      const prev = idx === 0 ? 0 : arr[idx - 1];
      arr.push(prev + t.weight);
      return arr;
    }, []);
    const totalWeight = cumulativeWeights[cumulativeWeights.length - 1];

    let x = 0;
    let y = 0;
    let z = 0;
    let filled = 0;
    const burnIn = 1000;
    const maxIter = 200000;
    for (let iter = 0; iter < maxIter && filled < count; iter++) {
      const r = rng() * totalWeight;
      let index = 0;
      while (index < cumulativeWeights.length && r > cumulativeWeights[index]) {
        index++;
      }
      const t = transforms[index] || transforms[transforms.length - 1];
      const nx = t.ax * x + t.bx * y + t.tx;
      const ny = t.cx * x + t.dx * y + t.ty;
      const orbital = Math.sin(nx * t.sx + ny * t.sy);
      const nz = 0.72 * z + t.sz * orbital;
      x = nx;
      y = ny;
      z = nz;
      if (iter > burnIn && iter % 4 === 0) {
        const idx = filled * 3;
        positions[idx] = x * 1.8;
        positions[idx + 1] = y * 1.8;
        positions[idx + 2] = z * 1.6;
        sizes[filled] = 1.1 + rng() * 1.2;
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
        uColor: { value: new THREE.Color(0x1e1e1e) },
      },
      vertexShader: `
        attribute float aSize;
        uniform float uTime;
        varying float vAlpha;
        void main() {
          vec3 transformed = position;
          float swirl = 0.18 * sin(uTime * 0.35 + transformed.z * 1.1);
          mat3 rot = mat3(
            cos(swirl), 0.0, sin(swirl),
            0.0, 1.0, 0.0,
            -sin(swirl), 0.0, cos(swirl)
          );
          transformed = rot * transformed;
          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          gl_PointSize = aSize * (260.0 / -mvPosition.z);
          vAlpha = 0.22 + 0.3 * sin(uTime * 0.4 + transformed.x * 1.3);
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
      points.rotation.y += delta * 0.1;
      points.rotation.x = 0.3 + Math.sin(elapsed * 0.2) * 0.12;
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
  themes: 'aperiodic,orbit,cloud',
  visualisation: 'Quasi-periodic orbital cloud drifting gently',
  promptSuggestion: '1. Follow a strange attractor unfolding\n2. Imagine each point tracing an endless orbit\n3. Sense quasi-order calming the space'
};
(AperiodicOrbitalCloud as any).metadata = metadata;

export default AperiodicOrbitalCloud;

// Differs from others by: Generates the point set with a custom aperiodic affine-orbital iterated function system before animating it.
