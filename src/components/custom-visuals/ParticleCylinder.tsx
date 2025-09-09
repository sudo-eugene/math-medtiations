import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';
import * as THREE from 'three'

const metadata = {
  themes: "Source, Radiance, Forgiveness",
  visualization: "Particles radiating from a central source in gentle waves",
  promptSuggestion: "1. Add subtle radiance variations\n2. Create source-centered waves\n3. Vary emanation patterns naturally\n4. Introduce gentle pulse rhythms\n5. Make radiance follow natural flows"
}

const ParticleCylinder: React.FC<VisualProps> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    
    // Setup scene, camera, and renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0xF0EEE6)
    container.appendChild(renderer.domElement)
    
    // Set camera position
    camera.position.z = 6.25
    
    // Create particle material
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0.4 }
      },
      vertexShader: `
        uniform float time;
        attribute float size;
        attribute vec3 customColor;
        varying vec3 vColor;
        
        float rand(vec2 co) {
          return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }
        
        void main() {
          vColor = customColor;
          vec3 pos = position;
          
          // Calculate radial distance and angle
          float radius = length(pos.xz);
          float angle = atan(pos.z, pos.x);
          float height = pos.y;
          
          // Source pulse
          float pulse = sin(time * 2.0) * 0.2 + 0.8;
          
          // Radial waves emanating from center
          float wave = sin(radius * 3.0 - time * 3.0) * 0.2;
          
          // Vertical oscillation based on radius
          float verticalWave = cos(radius * 2.0 - time * 1.5) * 0.3;
          
          // Spiral rotation
          float rotationSpeed = 0.05 / (radius + 1.0);
          float newAngle = angle + time * rotationSpeed;
          
          // Apply transformations
          vec3 newPos;
          newPos.x = cos(newAngle) * (radius + wave) * pulse;
          newPos.z = sin(newAngle) * (radius + wave) * pulse;
          newPos.y = height + verticalWave;
          
          // Scale for canvas size
          newPos *= 2.34375;
          
          pos = newPos;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (100.0 / -mvPosition.z); // Set to exactly 100
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float opacity;
        varying vec3 vColor;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = (1.0 - smoothstep(0.45, 0.5, dist)) * opacity;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false
    })
    
    // Generate particles
    const count = 37500
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      // Create concentric rings with height variation
      const t = i / count
      const radius = Math.pow(t, 0.5) // Square root distribution for density
      const angle = t * Math.PI * 30 // Many rotations for spiral effect
      const height = (Math.random() - 0.5) * 2
      
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = height
      positions[i * 3 + 2] = Math.sin(angle) * radius

      // Rich grays with darker center
      const centerDist = Math.sqrt(radius)
      const baseShade = 0.02 + centerDist * 0.13
      const variation = Math.random() * 0.05
      const shade = baseShade + variation
      colors[i * 3] = shade
      colors[i * 3 + 1] = shade
      colors[i * 3 + 2] = shade

      // Larger particles near center
      sizes[i] = (1.0 - centerDist) * 0.164 + 0.133
    }
    
    // Create geometry and points
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
    const points = new THREE.Points(geometry, particleMaterial)
    scene.add(points)
    
    // Animation loop
    const clock = new THREE.Clock()
    let animationFrameId
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      
      const time = clock.getElapsedTime() * 0.4
      
      particleMaterial.uniforms.time.value = time
      
      renderer.render(scene, camera)
    }
    
    animate()
    
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      
      if (renderer) {
        renderer.dispose()
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
      }
      
      if (geometry) geometry.dispose()
      if (particleMaterial) particleMaterial.dispose()
    }
  }, [width, height]);
  
  return (
    <div 
      ref={mountRef}
      style={{ 
        margin: 0,
        background: '#F0EEE6',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: `${height}px`,
        width: `${width}px`,
        position: 'relative'
      }}
    />
  )
}

ParticleCylinder.metadata = metadata
export default ParticleCylinder
