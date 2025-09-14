// Themes: galaxy, spiral, dust
// Visualisation: Dusty spiral arms slowly rotating in space
// Unique mechanism: Logarithmic spiral arm sampling with jittered radial distribution

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';
import * as THREE from 'three';

const SpiralGalaxyDrizzle: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement|null>(null);
  const rafRef = useRef<number|undefined>();

  useEffect(()=>{
    const mount = mountRef.current; if(!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF0EEE6);
    const camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 100);
    camera.position.set(0,0,3.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0xF0EEE6, 1);
    mount.appendChild(renderer.domElement);

    let s = 424242424 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    const N = 16000;
    const positions = new Float32Array(N*3);
    const sizes = new Float32Array(N);
    const arms = 3;
    const spread = 0.2;
    const a = 0.25; // spiral tightness

    for(let i=0;i<N;i++){
      const arm = i % arms;
      const r = Math.pow(rnd(), 0.6) * 1.2 + 0.05;
      const theta = Math.log(r+0.5) / a + arm*(Math.PI*2/arms) + (rnd()-0.5)*spread;
      const x = r * Math.cos(theta) + (rnd()-0.5)*0.02;
      const y = (rnd()-0.5)*0.03; // thin disk
      const z = r * Math.sin(theta) + (rnd()-0.5)*0.02;
      positions[i*3]=x; positions[i*3+1]=y; positions[i*3+2]=z;
      sizes[i] = 1.6 * (0.7 + rnd()*0.3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes,1));

    const vertex = `
      attribute float size;
      uniform float sizeScale;
      void main(){
        vec4 mvPosition = modelViewMatrix * vec4(position,1.0);
        float psize = size * sizeScale * (70.0 / max(0.001, -mvPosition.z));
        gl_PointSize = clamp(psize, 1.0, 3.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
    const fragment = `
      precision mediump float;
      void main(){
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d = length(uv);
        float alpha = smoothstep(0.46, 0.42, d) * 0.24;
        gl_FragColor = vec4(vec3(0.1), alpha);
      }
    `;
    const mat = new THREE.ShaderMaterial({
      vertexShader: vertex, fragmentShader: fragment,
      transparent: true, depthWrite: false,
      uniforms: { sizeScale: { value: 1.0 } }
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    const clock = new THREE.Clock();
    const render = ()=>{
      const dt = clock.getDelta();
      points.rotation.y += dt*0.07;
      points.rotation.z += dt*0.03;
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return ()=>{
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      scene.remove(points); geo.dispose(); mat.dispose(); renderer.dispose();
      if (renderer.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement);
    };
  },[width,height]);

  return <div ref={mountRef} style={{width:`${width}px`,height:`${height}px`, background:'#F0EEE6', overflow:'hidden'}}/>;
};

const metadata = {
  themes: "galaxy,spiral,arms,points",
  visualisation: "Dusty spiral arms rotate calmly",
  promptSuggestion: "1. Use 2-3 arms\n2. Soft jitter\n3. Slow rotation"
};
(SpiralGalaxyDrizzle as any).metadata = metadata;

export default SpiralGalaxyDrizzle;

// Differs from others by: logarithmic spiral arm distribution for point galaxy
