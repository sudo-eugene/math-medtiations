import type { NatureScene, SceneParams } from "@/lib/animations";

let container: HTMLDivElement | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let width = 0;
let height = 0;
let dpr = 1;
let currentParams: SceneParams = {};

type Dot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number; // for blinking
  size: number;
};

let dots: Dot[] = [];
let dotCount = 0;
let tunneling = 0.02;

function setSize(el: HTMLDivElement) {
  width = el.clientWidth || window.innerWidth;
  height = el.clientHeight || window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (!canvas) return;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function initDots() {
  dots = [];
  for (let i = 0; i < dotCount; i++) {
    const sp = 12 + Math.random() * 24;
    dots.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: rand(-sp, sp) * 0.01,
      vy: rand(-sp, sp) * 0.01,
      phase: Math.random() * Math.PI * 2,
      size: 1.3 + Math.random() * 2.5,
    });
  }
}

function step(t: number) {
  if (!ctx) return;
  const bg = currentParams.background || "#0b0f14";
  const fg = currentParams.fg || "#c9d1d9";
  const accent = currentParams.accent || "#58a6ff";

  // Fade trail for quantum "afterglow"
  ctx.fillStyle = typeof bg === 'string' ? bg : "#000";
  ctx.globalAlpha = 0.12;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;

  // Gentle field center (gravity-like)
  const cx = width * 0.5;
  const cy = height * 0.5;

  for (const d of dots) {
    // Quantum-like jitter
    d.vx += (Math.random() - 0.5) * 0.02;
    d.vy += (Math.random() - 0.5) * 0.02;

    // Attraction to center
    const dx = cx - d.x;
    const dy = cy - d.y;
    d.vx += dx * 0.00007;
    d.vy += dy * 0.00007;

    // Mild friction
    d.vx *= 0.995;
    d.vy *= 0.995;

    // Update position
    d.x += d.vx;
    d.y += d.vy;

    // Tunneling: occasionally teleport to random location
    if (Math.random() < tunneling) {
      d.x = Math.random() * width;
      d.y = Math.random() * height;
      d.vx *= 0.2;
      d.vy *= 0.2;
    }

    // Wrap around bounds
    if (d.x < 0) d.x += width; else if (d.x > width) d.x -= width;
    if (d.y < 0) d.y += height; else if (d.y > height) d.y -= height;

    // Blinking via phase
    d.phase += 0.06 + (currentParams.speed ? (currentParams.speed * 0.03) : 0);
    const glow = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(d.phase));

    // Draw dot and halo
    ctx.beginPath();
    ctx.fillStyle = accent as string;
    ctx.globalAlpha = 0.25 * glow;
    ctx.arc(d.x, d.y, d.size * 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = fg as string;
    ctx.globalAlpha = 0.85 * glow;
    ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }
}

const scene: NatureScene = {
  metadata: { key: "advanced.quantum_dots", title: "Quantum Dots", family: "advanced" },
  mount(el: HTMLDivElement, params: SceneParams) {
    container = el;
    currentParams = { ...params };

    dotCount = Math.floor(120 + (params.complexity ? params.complexity * 220 : 180));
    tunneling = 0.01 + (params.speed ? params.speed * 0.03 : 0.02);

    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D not supported");
    setSize(el);
    el.appendChild(canvas);
    initDots();

    // Prime background
    ctx.fillStyle = (currentParams.background as string) || "#0b0f14";
    ctx.fillRect(0, 0, width, height);
  },
  update(t: number) {
    step(t);
  },
  resize() {
    if (!container || !canvas) return;
    setSize(container);
    initDots();
  },
  dispose() {
    if (canvas && canvas.parentElement) canvas.parentElement.removeChild(canvas);
    container = null;
    canvas = null;
    ctx = null;
    dots = [];
  }
};

export default scene;
