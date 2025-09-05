import React, { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'

const EmptyParticles = ({ count = 45000 }) => {
  const mountRef = useRef(null)
  const animationRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const geometryRef = useRef(null)
  const materialRef = useRef(null)
  const pointsRef = useRef(null)
  const resizeObserverRef = useRef(null)
  const timeoutsRef = useRef([])
  
  useEffect(() => {
    if (!mountRef.current) return
    
    // Get container dimensions
    const container = mountRef.current
    const width = container.clientWidth
    const height = container.clientHeight
    
    const scene = new THREE.Scene()
    sceneRef.current = scene
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    cameraRef.current = camera
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
      stencil: false,
      depth: true
    })
    rendererRef.current = renderer
    
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    
    camera.position.z = 5
    scene.background = new THREE.Color('#F0EEE6')
    
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
        
        // Optimized vertex shader - pre-compute constants and minimize operations
        void main() {
          vColor = customColor;
          vec3 pos = position;
          
          // Calculate radial distance and angle with optimized math
          float radius = length(pos.xz);
          float angle = atan(pos.z, pos.x);
          float height = pos.y;
          
          // Pre-compute common calculations
          float vessel = smoothstep(0.3, 0.7, radius) * smoothstep(1.0, 0.7, radius);
          
          // Simplified rotation
          angle += time * 0.08;
          
          // Simplified space calculation
          float space = sin(time * 0.3 + radius * 3.0) * 0.1;
          
          // Combine calculations with fewer temporary variables
          float newRadius = (radius + space) * vessel;
          
          vec3 newPos;
          newPos.x = cos(angle) * newRadius;
          newPos.z = sin(angle) * newRadius;
          newPos.y = height * vessel - 1.2;
          
          // Scale for canvas size
          newPos *= 2.75;
          
          vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
          gl_PointSize = size * (128.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float opacity;
        varying vec3 vColor;
        void main() {
          // Optimized circle calculation with early exit
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = dot(center, center); // Use squared distance to avoid sqrt
          
          if (dist > 0.25) discard; // dist*dist > 0.5*0.5
          
          float alpha = (1.0 - smoothstep(0.2025, 0.25, dist)) * opacity; // Pre-computed squared values
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      vertexColors: true
    })
    materialRef.current = particleMaterial
    
    // Pre-allocate typed arrays for better memory management
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    
    // Generate particles - defining the vessel through stillness and movement
    let i3 = 0
    for (let i = 0; i < count; i++) {
      // Create vessel-like distribution - empty space holding infinite potential
      const t = i / count
      const radius = Math.pow(t, 0.5)
      const angle = t * Math.PI * 40
      
      // Pre-calculate height
      const vesselHeight = Math.sin(t * Math.PI) * 1.8
      
      // Add randomness
      const randRadius = radius + (Math.random() - 0.5) * 0.05
      const randAngle = angle + (Math.random() - 0.5) * 0.1
      
      // Directly write to typed arrays
      positions[i3] = Math.cos(randAngle) * randRadius
      positions[i3 + 1] = vesselHeight
      positions[i3 + 2] = Math.sin(randAngle) * randRadius

      // Simplified color calculation
      const shade = 0.1 + Math.sqrt(radius) * 0.1 + Math.random() * 0.02
      colors[i3] = shade
      colors[i3 + 1] = shade
      colors[i3 + 2] = shade

      // Optimized size calculation
      sizes[i] = (1.0 - Math.abs(vesselHeight * 0.5)) * 0.2 + 0.1
      
      i3 += 3
    }
    
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
    geometryRef.current = geometry
    
    const points = new THREE.Points(geometry, particleMaterial)
    pointsRef.current = points
    scene.add(points)
    
    // Optimized animation loop with requestAnimationFrame control
    const clock = new THREE.Clock()
    let lastTime = 0
    const targetFPS = 60
    const targetInterval = 1000 / targetFPS
    
    const animate = (currentTime) => {
      animationRef.current = requestAnimationFrame(animate)
      
      const deltaTime = currentTime - lastTime
      if (deltaTime < targetInterval) return
      
      lastTime = currentTime - (deltaTime % targetInterval)
      
      const time = clock.getElapsedTime()
      particleMaterial.uniforms.time.value = time
      
      renderer.render(scene, camera)
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    let resizeTimeout = null
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      
      resizeTimeout = setTimeout(() => {
        if (!mountRef.current) return
        
        const container = mountRef.current
        const width = container.clientWidth
        const height = container.clientHeight
        
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
      }, 100)
    }
    
    window.addEventListener('resize', handleResize, { passive: true })
    
    let observerTimeout = null
    const resizeObserverCallback = () => {
      if (observerTimeout) clearTimeout(observerTimeout)
      observerTimeout = setTimeout(handleResize, 100)
    }
    
    const resizeObserver = new ResizeObserver(resizeObserverCallback)
    resizeObserverRef.current = resizeObserver
    
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current)
    }
    
    timeoutsRef.current.push(() => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      if (observerTimeout) clearTimeout(observerTimeout)
    })
    
    return () => {
      timeoutsRef.current.forEach(clearFn => clearFn())
      timeoutsRef.current = []
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      
      window.removeEventListener('resize', handleResize)
      
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }
      
      if (sceneRef.current && pointsRef.current) {
        sceneRef.current.remove(pointsRef.current)
      }
      
      if (geometryRef.current) {
        geometryRef.current.dispose()
        geometryRef.current = null
      }
      
      if (materialRef.current) {
        materialRef.current.dispose()
        materialRef.current = null
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose()
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement)
        }
        rendererRef.current.forceContextLoss()
        rendererRef.current = null
      }
      
      sceneRef.current = null;
      cameraRef.current = null;
      pointsRef.current = null;
    }
  }, [count])
  
  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}

const ParticleVessel = () => {
  return <EmptyParticles />
}

const metadata = {
  themes: "impartiality, empty potential, stillness as power",
  visualization: "Particles define a vessel through their movement around emptiness, showing how stillness contains infinite possibility",
  promptSuggestion: "1. Add subtle void variations\n2. Create empty vessel patterns\n3. Vary spatial definitions naturally\n4. Introduce gentle utility waves\n5. Make emptiness follow natural forms"
}

ParticleVessel.metadata = metadata
export default ParticleVessel
