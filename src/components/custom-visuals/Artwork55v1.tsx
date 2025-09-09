import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';
import * as THREE from 'three';

const metadata = {
  themes: "world as sacred, accept things as they are, time for everything",
  visualization: "Branches grow and recede in their own time, accepting their natural cycles",
  promptSuggestion: "1. Enhance fractal complexity\n2. Add more growth patterns\n3. Develop stronger divisions\n4. Create clearer evolution\n5. Increase sense of emergence"
};

// Animation constants
const LINGER_START = 0.6;
const LINGER_END = 0.8;
const DELAY_PER_LEVEL = 0.15;
const GROWTH_MULTIPLIER = 3; // Increased from 2 for faster growth
const CROSS_BRACE_COUNT = 2;
const WAVE_AMPLITUDE = 0.05;

// Smooth easing function
const easeInOut = (t: number): number => {
  return t < 0.5
    ? 2 * t * t
    : -1 + (4 - 2 * t) * t;
};

interface BranchProps {
  start: [number, number, number];
  length: number;
  angle: number;
  depth: number;
  maxDepth: number;
  scale: number;
}

class FractalBranch {
  private lines: THREE.Line[] = [];
  private children: FractalBranch[] = [];
  private group: THREE.Group;
  private disposed: boolean = false;

  constructor(
    private props: BranchProps,
    private parent: THREE.Group
  ) {
    this.group = new THREE.Group();
    this.parent.add(this.group);
  }

  update(phase: number): void {
    if (this.disposed) return;

    const { start, length, angle, depth, maxDepth, scale } = this.props;
    const [sx, sy, sz] = start;

    // Calculate growth factor with smooth transitions but no decay
    const atMaxDepth = depth === maxDepth;
    
    let growthFactor;
    // Modified to remove decay phase - branches remain extended once grown
    if (phase >= 0.9) {
      // Always maintain full extension once grown
      growthFactor = 1;
    } else if (atMaxDepth && phase > LINGER_START) {
      growthFactor = 1;
    } else {
      // Slower, more deliberate growth
      const growthPhase = Math.min(1, Math.max(0, (phase - depth * DELAY_PER_LEVEL) * GROWTH_MULTIPLIER));
      growthFactor = easeInOut(growthPhase);
    }

    const actualLength = length * growthFactor;
    const ex = sx + Math.cos(angle) * actualLength;
    const ey = sy + Math.sin(angle) * actualLength;
    const ez = sz;

    // Create or update lines
    if (this.lines.length === 0) {
      // Create main branch line
      const mainGeometry = new THREE.BufferGeometry();
      const mainPoints = new Float32Array([sx, sy, sz, ex, ey, ez]);
      mainGeometry.setAttribute('position', new THREE.BufferAttribute(mainPoints, 3));
      const mainMaterial = new THREE.LineBasicMaterial({ 
        color: 0x333333,
        transparent: true,
        opacity: 0.4,
        linewidth: 0.5
      });
      const mainLine = new THREE.Line(mainGeometry, mainMaterial);
      this.group.add(mainLine);
      this.lines.push(mainLine);

      // Add cross braces
      if (growthFactor > 0.3) {
        const crossLength = length * (0.2 + Math.sin(phase * Math.PI * 2) * 0.05);
        const crossAngle1 = angle + Math.PI/2;
        const crossAngle2 = angle - Math.PI/2;
        
        for (let i = 0; i < CROSS_BRACE_COUNT; i++) {
          const t = (i + 1) / 4;
          const px = sx + (ex - sx) * t;
          const py = sy + (ey - sy) * t;
          const pz = sz + (ez - sz) * t;
          
          const wave = Math.sin(t * Math.PI * 2 + phase * Math.PI * 4) * WAVE_AMPLITUDE;
          
          const crossGeometry = new THREE.BufferGeometry();
          const crossPoints = new Float32Array([
            px + Math.cos(crossAngle1) * crossLength * (t + wave),
            py + Math.sin(crossAngle1) * crossLength * (t + wave),
            pz,
            px + Math.cos(crossAngle2) * crossLength * (t + wave),
            py + Math.sin(crossAngle2) * crossLength * (t + wave),
            pz
          ]);
          crossGeometry.setAttribute('position', new THREE.BufferAttribute(crossPoints, 3));
          const crossMaterial = new THREE.LineBasicMaterial({ 
            color: 0x333333,
            transparent: true,
            opacity: 0.4,
            linewidth: 0.5
          });
          const crossLine = new THREE.Line(crossGeometry, crossMaterial);
          this.group.add(crossLine);
          this.lines.push(crossLine);
        }
      }
    } else {
      // Update existing main branch
      const mainLine = this.lines[0];
      const positions = mainLine.geometry.attributes.position.array as Float32Array;
      positions[3] = ex;
      positions[4] = ey;
      positions[5] = ez;
      mainLine.geometry.attributes.position.needsUpdate = true;

      // Update cross braces
      if (this.lines.length > 1 && growthFactor > 0.3) {
        const crossLength = length * (0.2 + Math.sin(phase * Math.PI * 2) * 0.05);
        
        for (let i = 0; i < CROSS_BRACE_COUNT; i++) {
          const lineIndex = i + 1;
          if (lineIndex < this.lines.length) {
            const crossLine = this.lines[lineIndex];
            const positions = crossLine.geometry.attributes.position.array as Float32Array;
            const t = (i + 1) / 4;
            const px = sx + (ex - sx) * t;
            const py = sy + (ey - sy) * t;
            const pz = sz + (ez - sz) * t;
            
            const wave = Math.sin(t * Math.PI * 2 + phase * Math.PI * 4) * WAVE_AMPLITUDE;
            const crossAngle1 = angle + Math.PI/2;
            const crossAngle2 = angle - Math.PI/2;
            
            positions[0] = px + Math.cos(crossAngle1) * crossLength * (t + wave);
            positions[1] = py + Math.sin(crossAngle1) * crossLength * (t + wave);
            positions[2] = pz;
            positions[3] = px + Math.cos(crossAngle2) * crossLength * (t + wave);
            positions[4] = py + Math.sin(crossAngle2) * crossLength * (t + wave);
            positions[5] = pz;
            
            crossLine.geometry.attributes.position.needsUpdate = true;
          }
        }
      }
    }

    // Accept each branch's time to grow, but don't modify structure after full growth
    if (depth < maxDepth && 
        !(phase >= 0.8 && depth > 0) && 
        phase >= depth * 0.15 &&
        phase < 0.95) { // Don't create or modify branches after growth complete
      
      const numBranches = 3 + (depth < 2 ? 1 : 0);
      
      // Create new branches if needed
      if (this.children.length === 0) {
        for (let i = 0; i < numBranches; i++) {
          const t = (i + 1) / (numBranches + 1);
          const spread = 0.8 + (depth * 0.1);
          const branchAngle = angle + (t - 0.5) * Math.PI * spread;
          
          const branchProps: BranchProps = {
            start: [
              sx + (ex - sx) * t,
              sy + (ey - sy) * t,
              sz + (ez - sz) * t
            ],
            length: length * (0.6 - depth * 0.05),
            angle: branchAngle,
            depth: depth + 1,
            maxDepth,
            scale: scale * 0.8
          };
          
          this.children.push(new FractalBranch(branchProps, this.group));
        }
      } else {
        // Update existing branch positions
        for (let i = 0; i < this.children.length; i++) {
          const t = (i + 1) / (numBranches + 1);
          this.children[i].props.start = [
            sx + (ex - sx) * t,
            sy + (ey - sy) * t,
            sz + (ez - sz) * t
          ];
        }
      }
    }

    // Update all children
    this.children.forEach(child => child.update(phase));

    // No cleanup needed since we're reversing instead of disposing
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    // Dispose children first
    this.children.forEach(child => child.dispose());
    this.children = [];

    // Dispose lines
    this.lines.forEach(line => {
      this.group.remove(line);
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    });
    this.lines = [];

    // Remove from parent
    this.parent.remove(this.group);
  }
}

class FractalSystem {
  private branches: FractalBranch[] = [];
  private group: THREE.Group;

  constructor(parentGroup: THREE.Group) {
    this.group = new THREE.Group();
    parentGroup.add(this.group);
    this.initialize();
  }

  // Initialize the sacred pattern
  private initialize(): void {
    const count = 6;
    const scale = 2;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const branchProps: BranchProps = {
        start: [
          Math.cos(angle) * scale * 0.2,
          Math.sin(angle) * scale * 0.2,
          0
        ],
        length: scale,
        angle: angle + Math.PI/2,
        depth: 0,
        maxDepth: 7,
        scale: scale
      };
      
      this.branches.push(new FractalBranch(branchProps, this.group));
    }
  }

  update(time: number): void {
    this.branches.forEach(branch => branch.update(time));
  }

  dispose(): void {
    this.branches.forEach(branch => branch.dispose());
    this.branches = [];
    this.group.parent?.remove(this.group);
  }
}

const Artwork55v1: React.FC<VisualProps> = ({ width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<() => void>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(new THREE.Color('rgb(240, 238, 231)'));
    containerRef.current.appendChild(renderer.domElement);

    // Position camera
    camera.position.z = 5;

    // Create main group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.4);
    pointLight.position.set(-5, 3, -5);
    scene.add(pointLight);

    // Create fractal system
    const fractalSystem = new FractalSystem(mainGroup);

    // Animation timing control
    const clock = new THREE.Clock();
    let animationFrameId: number | null = null;
    let lastFrameTime = 0;
    
    // Slow down the overall animation
    const CYCLE_LENGTH = 60; // 60 seconds total cycle
    const GROWTH_PHASE_LENGTH = 25; // First 25 seconds for growth
    const FRAME_RATE = 20; // 20 fps for smoother motion
    const frameInterval = 1000 / FRAME_RATE; // milliseconds between frames
    
    // Animation function with time delta control
    const animate = (currentTime: number) => {
      // Initialize lastFrameTime on first frame
      if (!lastFrameTime) {
        lastFrameTime = currentTime;
      }
      
      const deltaTime = currentTime - lastFrameTime;
      
      // Only update animation when enough time has passed (mimics setInterval at 15fps)
      if (deltaTime >= frameInterval) {
        const elapsedTime = clock.getElapsedTime();
        const cycleTime = elapsedTime % CYCLE_LENGTH;
        
        // Simple two-phase animation:
        // 1. Growth phase
        // 2. Spin phase
        
        // Determine which phase we're in
        const isGrowthComplete = cycleTime >= GROWTH_PHASE_LENGTH;
        
        // Set time value for fractal update
        // (always 1.0 after growth phase to keep branches fully extended)
        const time = isGrowthComplete ? 1.0 : (cycleTime / GROWTH_PHASE_LENGTH);
        
        // Update fractal
        fractalSystem.update(time);
        
        // Handle rotation based on phase
        if (isGrowthComplete) {
          // SPIN PHASE: Simple constant rotation around z-axis (in-plane rotation)
          const spinStartTime = elapsedTime - GROWTH_PHASE_LENGTH;
          const verySlowRotationSpeed = 0.025; // Increased rotation speed
          mainGroup.rotation.z = spinStartTime * verySlowRotationSpeed;
          
          // Keep x and y rotation fixed to maintain the same plane
          mainGroup.rotation.x = 0;
          mainGroup.rotation.y = 0; 
        } else {
          // GROWTH PHASE: No rotation during growth
          mainGroup.rotation.x = 0;
          mainGroup.rotation.y = 0;
          mainGroup.rotation.z = 0;
        }
        
        renderer.render(scene, camera);
        
        // Update lastFrameTime, accounting for any remainder to prevent drift
        lastFrameTime = currentTime - (deltaTime % frameInterval);
      }
      
      // Continue animation loop
      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation
    animationFrameId = requestAnimationFrame(animate);

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Store cleanup function
    cleanupRef.current = () => {
      window.removeEventListener('resize', handleResize);
      
      // Cancel animation frame to prevent memory leaks
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      // Dispose of Three.js resources
      fractalSystem.dispose();
      
      // Dispose of geometries and materials
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        } else if (object instanceof THREE.Line) {
          object.geometry.dispose();
          (object.material as THREE.Material).dispose();
        }
      });
      
      // Clear the scene
      scene.clear();
      
      // Dispose of lights
      ambientLight.dispose();
      directionalLight.dispose();
      pointLight.dispose();
      
      // Dispose of renderer and force context loss
      renderer.dispose();
      renderer.forceContextLoss();
      
      // Remove renderer from DOM
      if (containerRef.current && renderer.domElement.parentNode) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Clear ref
      cleanupRef.current = null;
    };

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [width, height]);

  return <div ref={containerRef} style={{ width: `${width}px`, height: `${height}px` }} />;
};

(Artwork55v1 as any).metadata = metadata;
export default Artwork55v1;
