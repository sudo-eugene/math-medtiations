import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';
import * as THREE from 'three';

// themes: harmony of opposites, cyclical breath, balance in motion
// visualization: Two mirrored particle fields breathe in unison while rotating in opposite directions

const PulsatingYinYangNebula: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(width, height);
    renderer.setClearColor(0xF0EEE6, 1);
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    camera.position.z = 5;

    const particleCount = 12000;
    const yinGeometry = new THREE.BufferGeometry();
    const yangGeometry = new THREE.BufferGeometry();

    const positions = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random());
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = 0;

      phases[i] = Math.random() * Math.PI * 2;
      opacities[i] = 1 - radius; // fade near edges
    }

    yinGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    yinGeometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    yinGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

    const mirroredPositions = positions.slice();
    for (let i = 0; i < particleCount; i++) {
      mirroredPositions[i * 3] *= -1; // mirror across vertical axis
    }
    yangGeometry.setAttribute('position', new THREE.BufferAttribute(mirroredPositions, 3));
    yangGeometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    yangGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

    const vertexShader = `
      attribute float phase;
      attribute float opacity;
      uniform float time;
      uniform float direction;
      varying float vOpacity;

      void main() {
        vec3 p = position;
        float r = length(p.xy);
        float theta = atan(p.y, p.x);

        float breathe = 1.0 + 0.1 * sin(time * 2.0 + phase);
        r *= breathe;
        theta += direction * time * 0.6;

        p.x = r * cos(theta);
        p.y = r * sin(theta);

        vOpacity = opacity * (1.0 - smoothstep(0.7, 1.0, r));

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = 2.0 * (60.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform vec3 color;
      varying float vOpacity;

      void main() {
        if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
        gl_FragColor = vec4(color, vOpacity);
      }
    `;

    const yinMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        time: { value: 0 },
        direction: { value: 1.0 },
        color: { value: new THREE.Color(0x111111) }
      },
      vertexShader,
      fragmentShader
    });

    const yangMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        time: { value: 0 },
        direction: { value: -1.0 },
        color: { value: new THREE.Color(0xaaaaaa) }
      },
      vertexShader,
      fragmentShader
    });

    const yinParticles = new THREE.Points(yinGeometry, yinMaterial);
    const yangParticles = new THREE.Points(yangGeometry, yangMaterial);

    scene.add(yinParticles);
    scene.add(yangParticles);

    let animationId: number | null = null;

    const animate = (t: number) => {
      const time = t * 0.001;
      yinMaterial.uniforms.time.value = time;
      yangMaterial.uniforms.time.value = time;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      yinGeometry.dispose();
      yangGeometry.dispose();
      yinMaterial.dispose();
      yangMaterial.dispose();
      renderer.dispose();
    };
  }, [width, height]);

  return (
    <div
      ref={mountRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      className="flex justify-center items-center bg-[#F0EEE6]"
    />
  );
};

export default PulsatingYinYangNebula;
