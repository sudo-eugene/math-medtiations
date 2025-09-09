import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';
import * as THREE from 'three';

// themes: simplicity over learning, return to intuition, being the center
// visualization: Particles naturally drawn to a center point, finding harmony in simplicity

const VortexParticleSystemExact: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Three.js components
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(width, height);
    renderer.setClearColor(0xF0EEE6, 1);
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }
    
    camera.position.z = 7;
    
    // Create particles
    const particleCount = 25000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);
    const indices = new Float32Array(particleCount);
    
    // Let particles find their natural path to the center
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Distribute particles in vortex pattern
      const t = Math.random();
      const angle = t * Math.PI * 20; // Multiple rotations for spiral effect
      
      // Spiral shape
      const radius = 0.6 + t * 2.2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      // Add vertical component for 3D spiral
      const z = (t - 0.5) * 5;
      
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      
      // Vary sizes for depth effect
      sizes[i] = 0.03 + 0.04 * Math.random();
      opacities[i] = 0.4 + 0.6 * Math.random();
      indices[i] = i;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particles.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    particles.setAttribute('index', new THREE.BufferAttribute(indices, 1));
    
    // Custom shader material
    const particleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x333333) }, // Dark gray
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        attribute float index;
        uniform float time;
        varying float vOpacity;
        
        void main() {
          vOpacity = opacity;
          
          // Get the original position
          vec3 pos = position;
          
          // Movement guided by intuition rather than rules
          float i = index;
          float speed = 0.2 + 0.2 * fract(i / 1000.0);
          float angle = time * speed + i * 0.001;
          
          // Twist the vortex based on y position
          float twistAmount = sin(time * 0.3) * 0.5;
          float twist = pos.y * twistAmount;
          
          // Apply twist and contraction/expansion
          float r = length(pos.xy);
          float breathe = 1.0 + sin(time * 0.5) * 0.1;
          r *= breathe;
          
          float theta = atan(pos.y, pos.x) + twist;
          pos.x = r * cos(theta);
          pos.y = r * sin(theta);
          
          // Add some vertical oscillation
          pos.z += sin(time * 0.2 + i * 0.01) * 0.2;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (50.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vOpacity;
        
        void main() {
          if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
          gl_FragColor = vec4(color, vOpacity);
        }
      `,
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    let animationId = null;
    
    // Animation loop
    const animate = (time) => {
      time *= 0.0005; // Convert to seconds (half speed)
      
      // Update time uniform for vertex shader animation
      particleMaterial.uniforms.time.value = time;
      
      // Animate camera position for more dynamic view
      camera.position.x = Math.sin(time * 0.1) * 1.5;
      camera.position.y = Math.cos(time * 0.15) * 1.0;
      camera.lookAt(scene.position);
      
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
      particles.dispose();
      particleMaterial.dispose();
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

export default VortexParticleSystemExact;
