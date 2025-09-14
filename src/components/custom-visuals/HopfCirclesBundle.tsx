// Themes: linked circles, sphere, bundle
// Visualisation: Linked circles shimmer over a sphere like a Hopf bundle
// Unique mechanism: Points on circles defined by fixed dot product with varying directions on S²

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';
import * as THREE from 'three';

const HopfCirclesBundle: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement|null>(null);
  const rafRef = useRef<number|undefined>();
  useEffect(()=>{
    const mount = mountRef.current; if(!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF0EEE6);
    const camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 100);
    camera.position.set(0,0,3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0xF0EEE6, 1);
    renderer.autoClear = true;
    mount.appendChild(renderer.domElement);

    // PRNG
    let s = 1234509876 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    // Generate many circles on sphere using x·u = c, for random u and c
    const circles = 34;
    const ptsPer = 72;
    const total = circles * ptsPer;
    const positions = new Float32Array(total*3);
    const sizes = new Float32Array(total);

    let idx = 0;
    for(let i=0;i<circles;i++){
      // Direction u on sphere
      const uz = rnd()*2 - 1;
      const uphi = rnd()*Math.PI*2;
      const ux = Math.sqrt(1-uz*uz)*Math.cos(uphi);
      const uy = Math.sqrt(1-uz*uz)*Math.sin(uphi);
      const u = new THREE.Vector3(ux, uy, uz).normalize();
      // Circle latitude via dot=c
      const c = (rnd()*1.6 - 0.8); // -0.8..0.8
      // Orthonormal basis in plane orthogonal to u
      const rwx = rnd()*2-1, rwy = rnd()*2-1, rwz = rnd()*2-1;
      const rand = new THREE.Vector3(rwx, rwy, rwz);
      // Project and normalize to get v perpendicular to u
      const v = rand.sub(u.clone().multiplyScalar(rand.dot(u))).normalize();
      const w = new THREE.Vector3().crossVectors(u, v).normalize();
      const r = Math.sqrt(Math.max(0, 1 - c*c));
      for(let j=0;j<ptsPer;j++){
        const a = j/ptsPer * Math.PI*2;
        const p = new THREE.Vector3().addScaledVector(u, c).addScaledVector(v, r*Math.cos(a)).addScaledVector(w, r*Math.sin(a));
        positions[idx*3] = p.x;
        positions[idx*3+1] = p.y;
        positions[idx*3+2] = p.z;
        sizes[idx] = 1.2 * (0.6 + 0.4 * Math.abs(c));
        idx++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const vertex = `
      attribute float size;
      uniform float sizeScale;
      varying float vAlpha;
      void main(){
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float psize = size * sizeScale * (70.0 / max(0.001, -mvPosition.z));
        gl_PointSize = clamp(psize, 1.0, 3.2);
        vAlpha = 0.28;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
    const fragment = `
      precision mediump float;
      varying float vAlpha;
      void main(){
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d = length(uv);
        float alpha = smoothstep(0.46, 0.42, d) * vAlpha;
        gl_FragColor = vec4(vec3(0.1), alpha);
      }
    `;
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      uniforms: { sizeScale: { value: 1.0 } }
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const clock = new THREE.Clock();
    const render = ()=>{
      const dt = clock.getDelta();
      points.rotation.y += dt*0.15;
      points.rotation.x += dt*0.07;
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return ()=>{
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      scene.remove(points);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement);
    };
  },[width,height]);

  return <div ref={mountRef} style={{ width: `${width}px`, height: `${height}px`, background:'#F0EEE6', overflow:'hidden' }} />;
};

const metadata = {
  themes: "sphere,circles,hopf,linked,points",
  visualisation: "Linked circles shimmering on a sphere",
  promptSuggestion: "1. Vary circle latitudes\n2. Slow rotation\n3. Subtle point sizes"
};
(HopfCirclesBundle as any).metadata = metadata;

export default HopfCirclesBundle;

// Differs from others by: fixed-dot-product circles on S² approximating Hopf-like fiber circles
