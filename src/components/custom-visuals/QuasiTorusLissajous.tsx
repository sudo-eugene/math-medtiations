// Themes: torus, quasiperiodic, thread
// Visualisation: A glimmering thread winds quasiperiodically over a torus
// Unique mechanism: Incommensurate-angle Lissajous trajectory on a torus surface

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';
import * as THREE from 'three';

const QuasiTorusLissajous: React.FC<VisualProps> = ({ width, height }) => {
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

    const N = 9000;
    const positions = new Float32Array(N*3);
    const sizes = new Float32Array(N).fill(1.8);

    const R = 1.0, r = 0.38;
    const w1 = Math.PI * 2 * (1/3);
    const w2 = Math.PI * 2 * (Math.SQRT2/5); // incommensurate
    const phi = Math.PI / 7;

    const updatePositions = (time:number)=>{
      for (let i=0;i<N;i++){
        const t = (i * 0.002 + time*0.08);
        const u = t * w1;
        const v = t * w2 + phi;
        const x = (R + r*Math.cos(v)) * Math.cos(u);
        const y = (R + r*Math.cos(v)) * Math.sin(u);
        const z = r * Math.sin(v);
        positions[i*3]=x; positions[i*3+1]=y; positions[i*3+2]=z;
      }
    };

    updatePositions(0);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

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
        float alpha = smoothstep(0.46, 0.42, d) * 0.26;
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
      const t = clock.getElapsedTime();
      updatePositions(t);
      (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return ()=>{
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      scene.remove(points);
      geo.dispose(); mat.dispose(); renderer.dispose();
      if (renderer.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement);
    };
  },[width,height]);

  return <div ref={mountRef} style={{width:`${width}px`,height:`${height}px`, background:'#F0EEE6', overflow:'hidden'}}/>;
};

const metadata = {
  themes: "torus,lissajous,quasiperiodic,points",
  visualisation: "Quasiperiodic thread winding over a torus",
  promptSuggestion: "1. Keep N modest\n2. Animate angles\n3. Soft points"
};
(QuasiTorusLissajous as any).metadata = metadata;

export default QuasiTorusLissajous;

// Differs from others by: incommensurate-angle Lissajous motion on a torus
