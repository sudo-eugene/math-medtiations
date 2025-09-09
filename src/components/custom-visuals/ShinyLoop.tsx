import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';
import * as THREE from 'three'

const metadata = {
  themes: "Structure, Simplicity, Flow",
  visualization: "Wireframe Möbius strip with smooth animation",
  promptSuggestion: "1. Adjust the twist rate\n2. Change the ribbon dimensions\n3. Alter the motion dynamics\n4. Add more wireframe density\n5. Change the rotation speed"
}

const ShinyLoop: React.FC<VisualProps> = ({ width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    
    const numPoints = 300
    const ribbonWidth = 0.5
    const SPRING_STRENGTH = 0.03
    const DAMPING = 0.99
    const MOMENTUM = 0.95
    const GRAB_INFLUENCE = 3.0
    
    let mouse = { x: 0, y: 0, z: 0 }
    let target = { x: 0, y: 0, z: 0 }
    let velocity = { x: 0, y: 0, z: 0 }
    let isGrabbed = false
    let grabPoint = 0

    // Create ribbon geometry
    const createGeometry = () => {
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(numPoints * 2 * 3)
      const normals = new Float32Array(numPoints * 2 * 3)
      const indices = []

      // Create triangles
      for (let i = 0; i < numPoints - 1; i++) {
        indices.push(i * 2, i * 2 + 1, (i + 1) * 2)
        indices.push(i * 2 + 1, (i + 1) * 2 + 1, (i + 1) * 2)
      }

      // Close the loop for Möbius strip
      indices.push((numPoints - 1) * 2, (numPoints - 1) * 2 + 1, 0)
      indices.push((numPoints - 1) * 2 + 1, 1, 0)

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
      geometry.setIndex(indices)

      return geometry
    }

    // Create wireframe material
    const createMaterial = () => {
      return new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        wireframeLinewidth: 1,
        side: THREE.DoubleSide
      })
    }

    const dpr = window.devicePixelRatio || 1

    // Setup scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    
    renderer.setPixelRatio(Math.min(dpr, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0xF0EEE6)
    container.appendChild(renderer.domElement)

    // Create geometry and material
    const geometry = createGeometry()
    const material = createMaterial()
    const mesh = new THREE.Mesh(geometry, material)
    
    const groupRef = new THREE.Group()
    groupRef.add(mesh)
    scene.add(groupRef)

    // Position camera
    camera.position.set(0, 0, 4)
    camera.lookAt(0, 0, 0)

    // Mouse interaction handlers
    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      mouse.x = x * 3
      mouse.y = y * 3
      
      isGrabbed = true
    }

    const handlePointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      mouse.x = x * 3
      mouse.y = y * 3
    }

    const handlePointerUp = () => {
      isGrabbed = false
    }

    renderer.domElement.addEventListener('mousedown', handlePointerDown)
    renderer.domElement.addEventListener('mousemove', handlePointerMove)
    renderer.domElement.addEventListener('mouseup', handlePointerUp)
    renderer.domElement.addEventListener('mouseleave', handlePointerUp)

    // Animation loop
    let time = 0
    let animationFrameId: number
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      
      time += 0.0015
      
      // Update physics target
      if (isGrabbed) {
        target.x += (mouse.x - target.x) * 0.3
        target.y += (mouse.y - target.y) * 0.3
        target.z += (mouse.z - target.z) * 0.3
      }
      
      const positions = mesh.geometry.attributes.position.array
      const normals = mesh.geometry.attributes.normal.array
      
      for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1)
        const angle = t * Math.PI * 2
        
        // Calculate influence from grabbed point
        let influence = 0
        if (isGrabbed) {
          const distFromGrab = Math.abs(t - grabPoint)
          influence = Math.max(0, 1 - distFromGrab * GRAB_INFLUENCE)
          influence = Math.pow(influence, 2)
        }
        
        // Base radius with breathing effect (25% larger)
        const baseRadius = 1.875 + Math.sin(time * 0.5 + t * Math.PI * 2) * 0.125
        const radius = baseRadius * (1 - influence * 0.3)
        
        // Calculate base position
        let baseX = Math.cos(angle) * radius
        let baseY = Math.sin(angle) * radius
        let baseZ = 0
        
        // Apply grab influence
        if (influence > 0) {
          const targetOffsetX = (target.x - baseX) * influence
          const targetOffsetY = (target.y - baseY) * influence
          const targetOffsetZ = (target.z - baseZ) * influence
          
          baseX += targetOffsetX + velocity.x * influence
          baseY += targetOffsetY + velocity.y * influence
          baseZ += targetOffsetZ + velocity.z * influence
        }
        
        // Calculate twist
        const twist = t * Math.PI + time * 0.2 * (1 - influence * 0.5)
        
        // Add wave
        const wave = Math.sin(angle * 3 + time * 2) * 0.1
        const waveX = Math.cos(angle + Math.PI/2) * wave
        const waveY = Math.sin(angle + Math.PI/2) * wave
        const waveZ = Math.sin(angle * 2 + time) * 0.2
        
        // Calculate tangent vector
        const tangentX = -Math.sin(angle)
        const tangentY = Math.cos(angle)
        const tangentZ = 0
        
        // Calculate normal vector with twist
        const normalX = Math.cos(angle + twist)
        const normalY = Math.sin(angle + twist)
        const normalZ = Math.sin(twist)
        
        // Calculate binormal
        const binormalX = tangentY * normalZ - tangentZ * normalY
        const binormalY = tangentZ * normalX - tangentX * normalZ
        const binormalZ = tangentX * normalY - tangentY * normalX
        
        // Width variation
        const width = ribbonWidth * (1.0 + Math.sin(twist * 2) * 0.1)
        
        // Set positions
        const idx = i * 6
        positions[idx] = baseX + waveX + binormalX * width
        positions[idx + 1] = baseY + waveY + binormalY * width
        positions[idx + 2] = baseZ + waveZ + binormalZ * width
        positions[idx + 3] = baseX + waveX - binormalX * width
        positions[idx + 4] = baseY + waveY - binormalY * width
        positions[idx + 5] = baseZ + waveZ - binormalZ * width
        
        // Set normals
        normals[idx] = normalX
        normals[idx + 1] = normalY
        normals[idx + 2] = normalZ
        normals[idx + 3] = -normalX
        normals[idx + 4] = -normalY
        normals[idx + 5] = -normalZ
      }
      
      mesh.geometry.attributes.position.needsUpdate = true
      mesh.geometry.attributes.normal.needsUpdate = true
      
      renderer.render(scene, camera)
    }
    
    animate()


    // Cleanup
    return () => {
      
      renderer.domElement.removeEventListener('mousedown', handlePointerDown)
      renderer.domElement.removeEventListener('mousemove', handlePointerMove)
      renderer.domElement.removeEventListener('mouseup', handlePointerUp)
      renderer.domElement.removeEventListener('mouseleave', handlePointerUp)
      
      cancelAnimationFrame(animationFrameId)
      
      if (renderer) {
        renderer.dispose()
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
      }
      
      if (geometry) geometry.dispose()
      if (material) material.dispose()
    }
  }, [width, height])

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: `${width}px`,
        height: `${height}px`,
        margin: 0,
        background: '#F0EEE6',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    />
  )
}

export default ShinyLoop;
