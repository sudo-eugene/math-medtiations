// Themes: phyllotaxis, sphere, shell
// Visualisation: A spherical shell of points rotates calmly
// Unique mechanism: Spherical Vogel spiral (phyllotaxis) point placement

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';
import * as THREE from 'three';

const SphericalPhyllotaxisShell: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement|null>(null);
  const rafRef = useRef<number|undefined>();
  useEffect(()=>{
    const mount = mountRef.current; if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF0EEE6);
    const camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 100);
    camera.position.set(0,0,3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0xF0EEE6, 1);
    mount.appendChild(renderer.domElement);

    // PRNG
    let s = 987651234 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    const N = 15000;
    const positions = new Float32Array(N*3);
    const sizes = new Float32Array(N);
    const ga = Math.PI * (3 - Math.sqrt(5)); // golden angle
    for (let i=0;i<N;i++){
      const t = (i + 0.5)/N;
      const z = 1 - 2*t;
      const r = Math.sqrt(1 - z*z);
      const theta = i * ga;
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      positions[i*3] = x;
      positions[i*3+1] = y;
      positions[i*3+2] = z;
      sizes[i] = 1.6;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const vertex = `
      attribute float size;
      uniform float sizeScale;
      void main(){
        vec4 mvPosition = modelViewMatrix * vec4(position,1.0);
        float psize = size * sizeScale * (70.0 / max(0.001, -mvPosition.z));
        gl_PointSize = clamp(psize, 1.0, 3.2);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
    const fragment = `
      precision mediump float;
      void main(){
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d = length(uv);
        float alpha = smoothstep(0.46, 0.42, d) * 0.25;
        gl_FragColor = vec4(vec3(0.1), alpha);
      }
    `;
    const mat = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      uniforms: { sizeScale: { value: 1.0 } }
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    const clock = new THREE.Clock();
    const render = ()=>{
      const dt = clock.getDelta();
      points.rotation.y += dt*0.12;
      points.rotation.x += dt*0.04;
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return ()=>{
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      scene.remove(points);
      geo.dispose(); mat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement);
    };
  },[width,height]);

  return <div ref={mountRef} style={{width:`${width}px`,height:`${height}px`, background:'#F0EEE6', overflow:'hidden'}}/>;
};

const metadata = {
  themes: "phyllotaxis,sphere,shell,points",
  visualisation: "Spherical phyllotaxis shell slowly rotating",
  promptSuggestion: "1. Keep N moderate\n2. Subtle rotation\n3. Gentle opacity"
};
(SphericalPhyllotaxisShell as any).metadata = metadata;

export default SphericalPhyllotaxisShell;

// Differs from others by: spherical Vogel spiral distribution (phyllotaxis on S²)
