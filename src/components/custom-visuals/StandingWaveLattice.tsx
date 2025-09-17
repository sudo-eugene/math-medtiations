// Themes: standing waves, lattice, shimmer
// Visualisation: A cubic lattice shimmers with superposed standing waves
// Unique mechanism: 3D grid points displaced by multi-axis sinusoids with time phase

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';
import * as THREE from 'three';

const StandingWaveLattice: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement|null>(null);
  const rafRef = useRef<number|undefined>();
  useEffect(()=>{
    const mount = mountRef.current; if(!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF0EEE6);
    const camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 100);
    camera.position.set(0,0,3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0xF0EEE6, 1);
    mount.appendChild(renderer.domElement);

    const n = 26;
    const total = n*n*n;
    const positions = new Float32Array(total*3);
    const sizes = new Float32Array(total).fill(1.6);
    let idx=0;
    for(let z=0; z<n; z++){
      for(let y=0; y<n; y++){
        for(let x=0; x<n; x++){
          const X = (x/(n-1) - 0.5) * 2.0;
          const Y = (y/(n-1) - 0.5) * 2.0;
          const Z = (z/(n-1) - 0.5) * 2.0;
          positions[idx*3] = X;
          positions[idx*3+1] = Y;
          positions[idx*3+2] = Z;
          idx++;
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes,1));

    const vertex = `
      attribute float size;
      uniform float sizeScale;
      uniform float time;
      varying float vAlpha;
      void main(){
        vec3 p = position;
        float a = sin(3.0*p.x + time) + sin(3.0*p.y + 1.3*time) + sin(3.0*p.z + 0.7*time);
        p *= 1.0 + 0.03 * a;
        vec4 mvPosition = modelViewMatrix * vec4(p,1.0);
        float psize = size * sizeScale * (70.0 / max(0.001, -mvPosition.z));
        gl_PointSize = clamp(psize, 1.0, 2.8);
        vAlpha = 0.22;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
    const fragment = `
      precision mediump float;
      varying float vAlpha;
      void main(){
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d = length(uv);
        float alpha = smoothstep(0.5, 0.45, d) * vAlpha;
        gl_FragColor = vec4(vec3(0.1), alpha);
      }
    `;
    const mat = new THREE.ShaderMaterial({
      vertexShader: vertex, fragmentShader: fragment,
      transparent: true, depthWrite: false,
      uniforms: { sizeScale: { value: 1.0 }, time: { value: 0 } }
    });

    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    const clock = new THREE.Clock();
    const render = ()=>{
      const t = clock.getElapsedTime();
      (mat.uniforms.time as any).value = t;
      pts.rotation.y += 0.005;
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return ()=>{
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      scene.remove(pts);
      geo.dispose(); mat.dispose(); renderer.dispose();
      if (renderer.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement);
    };
  },[width,height]);

  return <div ref={mountRef} style={{width:`${width}px`,height:`${height}px`, background:'#F0EEE6', overflow:'hidden'}}/>;
};

const metadata = {
  themes: "lattice,standing-waves,points,shimmer",
  visualisation: "Cubic lattice shimmering with standing waves",
  promptSuggestion: "1. Keep grid ~26^3\n2. Low amplitude\n3. Slow rotation"
};
(StandingWaveLattice as any).metadata = metadata;

export default StandingWaveLattice;

// Differs from others by: 3D standing-wave displacement on a cubic point lattice
