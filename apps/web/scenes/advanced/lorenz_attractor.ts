import type { NatureScene, SceneParams } from "@/lib/animations";

// 3D Lorenz Attractor with particle trails and interactive camera
// Demonstrates chaos theory and sensitive dependence on initial conditions

let container: HTMLDivElement | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let currentParams: SceneParams = {};
let animationId: number | null = null;

// Lorenz system parameters
const sigma = 10;
const rho = 28;
const beta = 8/3;

// Simulation state
let particles: Array<{
  x: number; y: number; z: number;
  trail: Array<{x: number; y: number; z: number; age: number}>;
  color: [number, number, number];
}> = [];

let time = 0;
let cameraAngle = 0;
let cameraElevation = 0.3;
let mousePos = { x: 0, y: 0 };

function initParticles(count: number, seed: number) {
  particles = [];
  
  // Seeded random for reproducible chaos
  let rng = seed;
  const random = () => {
    rng = (rng * 9301 + 49297) % 233280;
    return rng / 233280;
  };
  
  for (let i = 0; i < count; i++) {
    // Start near the attractor with slight variations
    const x = 1 + (random() - 0.5) * 0.1;
    const y = 1 + (random() - 0.5) * 0.1;
    const z = 1 + (random() - 0.5) * 0.1;
    
    // Each particle gets a unique color
    const hue = (i / count) * 360;
    const color: [number, number, number] = [
      Math.floor(127 + 127 * Math.sin((hue + 0) * Math.PI / 180)),
      Math.floor(127 + 127 * Math.sin((hue + 120) * Math.PI / 180)),
      Math.floor(127 + 127 * Math.sin((hue + 240) * Math.PI / 180))
    ];
    
    particles.push({
      x, y, z,
      trail: [],
      color
    });
  }
}

function updateLorenzSystem(dt: number) {
  for (const particle of particles) {
    // Lorenz equations
    const dx = sigma * (particle.y - particle.x);
    const dy = particle.x * (rho - particle.z) - particle.y;
    const dz = particle.x * particle.y - beta * particle.z;
    
    // Integrate using Runge-Kutta 4th order for stability
    const k1x = dx * dt;
    const k1y = dy * dt;
    const k1z = dz * dt;
    
    const x2 = particle.x + k1x * 0.5;
    const y2 = particle.y + k1y * 0.5;
    const z2 = particle.z + k1z * 0.5;
    
    const dx2 = sigma * (y2 - x2);
    const dy2 = x2 * (rho - z2) - y2;
    const dz2 = x2 * y2 - beta * z2;
    
    const k2x = dx2 * dt;
    const k2y = dy2 * dt;
    const k2z = dz2 * dt;
    
    const x3 = particle.x + k2x * 0.5;
    const y3 = particle.y + k2y * 0.5;
    const z3 = particle.z + k2z * 0.5;
    
    const dx3 = sigma * (y3 - x3);
    const dy3 = x3 * (rho - z3) - y3;
    const dz3 = x3 * y3 - beta * z3;
    
    const k3x = dx3 * dt;
    const k3y = dy3 * dt;
    const k3z = dz3 * dt;
    
    const x4 = particle.x + k3x;
    const y4 = particle.y + k3y;
    const z4 = particle.z + k3z;
    
    const dx4 = sigma * (y4 - x4);
    const dy4 = x4 * (rho - z4) - y4;
    const dz4 = x4 * y4 - beta * z4;
    
    const k4x = dx4 * dt;
    const k4y = dy4 * dt;
    const k4z = dz4 * dt;
    
    // Update position
    particle.x += (k1x + 2*k2x + 2*k3x + k4x) / 6;
    particle.y += (k1y + 2*k2y + 2*k3y + k4y) / 6;
    particle.z += (k1z + 2*k2z + 2*k3z + k4z) / 6;
    
    // Add to trail
    particle.trail.push({
      x: particle.x,
      y: particle.y,
      z: particle.z,
      age: 0
    });
    
    // Age trail points and remove old ones
    particle.trail = particle.trail.filter(point => {
      point.age += dt;
      return point.age < 3; // 3 second trail
    });
    
    // Limit trail length for performance
    if (particle.trail.length > 500) {
      particle.trail.shift();
    }
  }
}

function project3D(x: number, y: number, z: number): [number, number, number] {
  // Apply camera rotation
  const cosAngle = Math.cos(cameraAngle);
  const sinAngle = Math.sin(cameraAngle);
  const cosElev = Math.cos(cameraElevation);
  const sinElev = Math.sin(cameraElevation);
  
  // Rotate around Y axis
  const rotX = x * cosAngle - z * sinAngle;
  const rotZ = x * sinAngle + z * cosAngle;
  
  // Rotate around X axis
  const rotY = y * cosElev - rotZ * sinElev;
  const finalZ = y * sinElev + rotZ * cosElev;
  
  // Perspective projection
  const distance = 100;
  const scale = distance / (distance + finalZ + 50);
  
  return [
    rotX * scale * 8 + (canvas?.width || 550) / 2,
    rotY * scale * 8 + (canvas?.height || 550) / 2,
    scale
  ];
}

function render() {
  if (!canvas || !ctx) return;
  
  const bg = currentParams.background || '#0a0a0a';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Update camera based on mouse and time
  cameraAngle = time * 0.1 + (mousePos.x - 0.5) * 0.5;
  cameraElevation = 0.3 + Math.sin(time * 0.05) * 0.2 + (mousePos.y - 0.5) * 0.3;
  
  // Collect all trail points for depth sorting
  const allPoints: Array<{
    x: number; y: number; z: number; scale: number;
    color: [number, number, number]; alpha: number;
  }> = [];
  
  for (const particle of particles) {
    for (let i = 0; i < particle.trail.length; i++) {
      const point = particle.trail[i];
      const [projX, projY, scale] = project3D(point.x, point.y, point.z);
      
      const alpha = (1 - point.age / 3) * 0.8; // Fade with age
      
      allPoints.push({
        x: projX,
        y: projY,
        z: scale,
        scale,
        color: particle.color,
        alpha
      });
    }
  }
  
  // Sort by depth (back to front)
  allPoints.sort((a, b) => a.z - b.z);
  
  // Draw trail points
  for (const point of allPoints) {
    if (point.x < 0 || point.x > canvas.width || point.y < 0 || point.y > canvas.height) continue;
    
    const size = Math.max(0.5, point.scale * 2);
    const [r, g, b] = point.color;
    
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${point.alpha})`;
    ctx.beginPath();
    ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add glow effect for brighter points
    if (point.alpha > 0.5) {
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${point.alpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, size * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Draw current particle positions as bright dots
  for (const particle of particles) {
    const [projX, projY, scale] = project3D(particle.x, particle.y, particle.z);
    
    if (projX < 0 || projX > canvas.width || projY < 0 || projY > canvas.height) continue;
    
    const size = Math.max(2, scale * 4);
    const [r, g, b] = particle.color;
    
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.beginPath();
    ctx.arc(projX, projY, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Bright core
    ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
    ctx.beginPath();
    ctx.arc(projX, projY, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function handleMouseMove(event: MouseEvent) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  mousePos.x = (event.clientX - rect.left) / rect.width;
  mousePos.y = (event.clientY - rect.top) / rect.height;
}

function animate() {
  if (!canvas || !ctx) return;
  
  time += 0.016;
  updateLorenzSystem(0.005); // Small time step for stability
  render();
  
  animationId = requestAnimationFrame(animate);
}

const scene: NatureScene = {
  metadata: { key: "advanced.lorenz_attractor", title: "Lorenz Attractor", family: "advanced" },
  
  mount(el: HTMLDivElement, params: SceneParams) {
    container = el;
    currentParams = { ...params };
    
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D not supported");
    
    canvas.width = 550;
    canvas.height = 550;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.cursor = "crosshair";
    
    el.appendChild(canvas);
    
    canvas.addEventListener('mousemove', handleMouseMove);
    
    // Initialize with seed-based parameters
    const seed = params.seed || 1;
    const particleCount = Math.max(3, Math.min(12, Math.floor(seed % 8) + 3));
    
    initParticles(particleCount, seed);
    mousePos = { x: 0.5, y: 0.5 };
    
    animate();
  },
  
  update(t: number) {
    // Animation handled by internal RAF loop
  },
  
  resize() {
    if (!container || !canvas) return;
    // Keep fixed size for performance
  },
  
  dispose() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    
    if (canvas) {
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
    }
    
    container = null;
    canvas = null;
    ctx = null;
    currentParams = {};
    particles = [];
  }
};

export default scene;
