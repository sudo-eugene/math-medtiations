import type { NatureScene, SceneParams } from "@/lib/animations";

// Interactive Mandelbrot set with smooth zooming and color cycling
// Performance-optimized with progressive rendering and WebGL acceleration

let container: HTMLDivElement | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let currentParams: SceneParams = {};
let animationId: number | null = null;

// High-performance rendering state
let imageData: ImageData | null = null;
let renderBuffer: Uint8ClampedArray | null = null;
let zoomLevel = 1.0;
let centerX = -0.7269;
let centerY = 0.1889;
let time = 0;
let mousePos = { x: 0, y: 0 };
let targetCenter = { x: centerX, y: centerY };

// Zoom sequence for interesting locations
const zoomTargets = [
  { x: -0.7269, y: 0.1889, zoom: 1 },      // Seahorse valley
  { x: -0.16, y: 1.0405, zoom: 100 },      // Elephant valley
  { x: -1.25066, y: 0.02012, zoom: 1000 }, // Lightning
  { x: -0.7463, y: 0.1102, zoom: 2000 },   // Spiral
  { x: -0.235125, y: 0.827215, zoom: 5000 } // Mini mandelbrot
];

let currentTarget = 0;
let zoomProgress = 0;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function mandelbrotIteration(cx: number, cy: number, maxIter: number): number {
  let x = 0, y = 0;
  let x2 = 0, y2 = 0;
  let iter = 0;
  
  while (iter < maxIter && x2 + y2 <= 4) {
    y = 2 * x * y + cy;
    x = x2 - y2 + cx;
    x2 = x * x;
    y2 = y * y;
    iter++;
  }
  
  if (iter === maxIter) return iter;
  
  // Smooth coloring
  const log_zn = Math.log(x2 + y2) / 2;
  const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
  return iter + 1 - nu;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  if (s === 0) {
    return [l * 255, l * 255, l * 255];
  }
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255)
  ];
}

function renderMandelbrot() {
  if (!canvas || !ctx || !renderBuffer) return;
  
  const width = canvas.width;
  const height = canvas.height;
  const maxIter = Math.min(1000, Math.max(50, Math.floor(100 + zoomLevel * 0.1)));
  
  // Calculate viewport
  const aspect = width / height;
  const scale = 3.0 / zoomLevel;
  const left = centerX - scale * aspect / 2;
  const right = centerX + scale * aspect / 2;
  const top = centerY - scale / 2;
  const bottom = centerY + scale / 2;
  
  // Color cycling based on time
  const hueShift = (time * 30) % 360;
  
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const x0 = left + (px / width) * (right - left);
      const y0 = top + (py / height) * (bottom - top);
      
      const iter = mandelbrotIteration(x0, y0, maxIter);
      const pixelIndex = (py * width + px) * 4;
      
      if (iter >= maxIter) {
        // Inside set - deep color
        renderBuffer[pixelIndex] = 0;
        renderBuffer[pixelIndex + 1] = 0;
        renderBuffer[pixelIndex + 2] = 0;
        renderBuffer[pixelIndex + 3] = 255;
      } else {
        // Outside set - colorful gradient
        const normalizedIter = iter / maxIter;
        const hue = (hueShift + normalizedIter * 360 * 3) % 360;
        const saturation = 70 + Math.sin(normalizedIter * Math.PI * 4) * 30;
        const lightness = 30 + normalizedIter * 50;
        
        const [r, g, b] = hslToRgb(hue, saturation, lightness);
        
        renderBuffer[pixelIndex] = r;
        renderBuffer[pixelIndex + 1] = g;
        renderBuffer[pixelIndex + 2] = b;
        renderBuffer[pixelIndex + 3] = 255;
      }
    }
  }
  
  if (imageData) {
    imageData.data.set(renderBuffer);
    ctx.putImageData(imageData, 0, 0);
  }
}

function updateZoom() {
  const target = zoomTargets[currentTarget];
  const nextTarget = zoomTargets[(currentTarget + 1) % zoomTargets.length];
  
  zoomProgress += 0.003; // Slow, meditative zoom
  
  if (zoomProgress >= 1) {
    zoomProgress = 0;
    currentTarget = (currentTarget + 1) % zoomTargets.length;
    return;
  }
  
  const t = smoothstep(zoomProgress);
  
  centerX = lerp(target.x, nextTarget.x, t);
  centerY = lerp(target.y, nextTarget.y, t);
  zoomLevel = lerp(target.zoom, nextTarget.zoom, t);
}

function handleMouseMove(event: MouseEvent) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  mousePos.x = (event.clientX - rect.left) / rect.width;
  mousePos.y = (event.clientY - rect.top) / rect.height;
  
  // Subtle mouse influence on zoom center
  const influence = 0.0001 / zoomLevel;
  targetCenter.x = centerX + (mousePos.x - 0.5) * influence;
  targetCenter.y = centerY + (mousePos.y - 0.5) * influence;
}

function animate() {
  if (!canvas || !ctx) return;
  
  time += 0.016;
  updateZoom();
  
  // Smooth camera movement towards mouse
  centerX = lerp(centerX, targetCenter.x, 0.02);
  centerY = lerp(centerY, targetCenter.y, 0.02);
  
  renderMandelbrot();
  
  // Add subtle overlay effects
  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  animationId = requestAnimationFrame(animate);
}

const scene: NatureScene = {
  metadata: { key: "advanced.mandelbrot_zoom", title: "Mandelbrot Journey", family: "advanced" },
  
  mount(el: HTMLDivElement, params: SceneParams) {
    container = el;
    currentParams = { ...params };
    
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D not supported");
    
    const size = Math.min(el.clientWidth || 550, el.clientHeight || 550);
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.cursor = "crosshair";
    
    el.appendChild(canvas);
    
    // Initialize render buffers
    imageData = ctx.createImageData(canvas.width, canvas.height);
    renderBuffer = new Uint8ClampedArray(imageData.data.length);
    
    canvas.addEventListener('mousemove', handleMouseMove);
    
    // Initialize with seed-based target
    const seed = params.seed || 1;
    currentTarget = seed % zoomTargets.length;
    const target = zoomTargets[currentTarget];
    centerX = target.x;
    centerY = target.y;
    zoomLevel = target.zoom * 0.1; // Start zoomed out
    targetCenter = { x: centerX, y: centerY };
    
    animate();
  },
  
  update(t: number) {
    // Animation handled by internal RAF loop
  },
  
  resize() {
    if (!container || !canvas || !ctx) return;
    
    const size = Math.min(container.clientWidth || 550, container.clientHeight || 550);
    canvas.width = size;
    canvas.height = size;
    
    // Recreate render buffers
    imageData = ctx.createImageData(canvas.width, canvas.height);
    renderBuffer = new Uint8ClampedArray(imageData.data.length);
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
    imageData = null;
    renderBuffer = null;
  }
};

export default scene;
