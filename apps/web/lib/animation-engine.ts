/**
 * Advanced Animation Engine for 365 Unique Mathematical Meditations
 * 
 * This engine generates unique animations by combining:
 * - Core mathematical families (fractals, physics, geometry)
 * - Parametric variations based on day number
 * - Performance optimizations (TypedArrays, WebGL)
 * - Interactive elements
 */

export type AnimationFamily = 
  | 'torus_field' | 'mandelbrot_zoom' | 'julia_morph' | 'lorenz_attractor'
  | 'double_pendulum' | 'wave_interference' | 'voronoi_growth' | 'lsystem_fractal'
  | 'particle_life' | 'reaction_diffusion' | 'flow_field' | 'sacred_geometry'
  | 'fibonacci_spiral' | 'galaxy_formation' | 'quantum_dots' | 'neural_network'
  | 'cellular_automata' | 'strange_attractor' | 'fourier_epicycles' | 'hyperbolic_tiling';

export interface AnimationParams {
  // Core parameters
  family: AnimationFamily;
  seed: number; // Based on day number for reproducibility
  complexity: number; // 0-1 scale
  speed: number;
  
  // Visual parameters
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  
  // Interactive parameters
  mouseInfluence: number;
  touchResponse: boolean;
  
  // Performance parameters
  particleCount?: number;
  iterationDepth?: number;
  renderQuality: 'low' | 'medium' | 'high' | 'ultra';
  
  // Family-specific parameters
  [key: string]: any;
}

export interface AdvancedScene {
  family: AnimationFamily;
  mount(container: HTMLDivElement, params: AnimationParams): void;
  update(deltaTime: number, totalTime: number): void;
  handleInteraction(event: MouseEvent | TouchEvent): void;
  resize(width: number, height: number): void;
  dispose(): void;
  
  // Performance monitoring
  getPerformanceMetrics(): {
    fps: number;
    memoryUsage: number;
    renderTime: number;
  };
}

// Deterministic random number generator for reproducible animations
export class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  
  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

// Generate unique parameters for each day
export function generateDayParams(dayNumber: number): AnimationParams {
  const rng = new SeededRandom(dayNumber);
  
  // Select animation family based on day
  const families: AnimationFamily[] = [
    'torus_field', 'mandelbrot_zoom', 'julia_morph', 'lorenz_attractor',
    'double_pendulum', 'wave_interference', 'voronoi_growth', 'lsystem_fractal',
    'particle_life', 'reaction_diffusion', 'flow_field', 'sacred_geometry',
    'fibonacci_spiral', 'galaxy_formation', 'quantum_dots', 'neural_network',
    'cellular_automata', 'strange_attractor', 'fourier_epicycles', 'hyperbolic_tiling'
  ];
  
  const family = families[dayNumber % families.length];
  
  // Generate color palette based on day
  const hue = (dayNumber * 137.508) % 360; // Golden angle for color distribution
  const saturation = rng.range(15, 35);
  const lightness = rng.range(85, 95);
  
  return {
    family,
    seed: dayNumber,
    complexity: rng.range(0.6, 0.95),
    speed: rng.range(0.3, 1.2),
    
    background: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    primary: `hsl(${hue}, ${saturation + 20}%, ${lightness - 70}%)`,
    secondary: `hsl(${(hue + 120) % 360}, ${saturation + 10}%, ${lightness - 50}%)`,
    accent: `hsl(${(hue + 240) % 360}, ${saturation + 15}%, ${lightness - 60}%)`,
    
    mouseInfluence: rng.range(0.2, 0.8),
    touchResponse: true,
    renderQuality: 'high',
    
    // Family-specific parameters will be added by each scene
  };
}

// Performance optimization utilities
export class PerformanceManager {
  private frameCount = 0;
  private lastFpsUpdate = 0;
  private fps = 60;
  
  updateFPS(currentTime: number) {
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }
  }
  
  getFPS(): number {
    return this.fps;
  }
  
  shouldReduceQuality(): boolean {
    return this.fps < 30;
  }
}

// WebGL utilities for high-performance rendering
export class WebGLRenderer {
  private gl: WebGLRenderingContext | null = null;
  private programs: Map<string, WebGLProgram> = new Map();
  
  constructor(canvas: HTMLCanvasElement) {
    this.gl = (canvas.getContext('webgl') as WebGLRenderingContext | null)
      || (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null)
      || null;
    if (!this.gl) {
      throw new Error('WebGL not supported');
    }
  }
  
  createShaderProgram(vertexSource: string, fragmentSource: string): WebGLProgram | null {
    if (!this.gl) return null;
    
    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);
    
    if (!vertexShader || !fragmentShader) return null;
    
    const program = this.gl.createProgram();
    if (!program) return null;
    
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Shader program linking failed:', this.gl.getProgramInfoLog(program));
      return null;
    }
    
    return program;
  }
  
  private compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;
    
    const shader = this.gl.createShader(type);
    if (!shader) return null;
    
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation failed:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }
}
