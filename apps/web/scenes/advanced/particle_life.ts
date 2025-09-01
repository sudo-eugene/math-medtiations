import type { NatureScene, SceneParams } from "@/lib/animations";

let container: HTMLDivElement | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let width = 0;
let height = 0;
let dpr = 1;
let currentParams: SceneParams = {};

let n = 0; // particle count
let k = 0; // species count
let radius = 60; // interaction radius
let maxSpeed = 2.0;
let sampleNeighbors = 64; // per particle per frame

let pos: Float32Array | null = null; // [x,y]*n
let vel: Float32Array | null = null; // [vx,vy]*n
let spc: Uint8Array | null = null;   // [s]*n
let rules: Float32Array | null = null; // [k*k] attraction strengths in [-1,1]

function setSize(el: HTMLDivElement) {
  width = el.clientWidth || window.innerWidth;
  height = el.clientHeight || window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (!canvas) return;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function init() {
  const seed = (currentParams.seed ?? 424242) as number;
  const rnd = seededRandom(seed);

  n = Math.floor(400 + ((currentParams.complexity ?? 0.8) as number) * 600);
  k = Math.max(2, Math.min(6, Math.floor(2 + ((currentParams.complexity ?? 0.8) as number) * 4)));
  radius = Math.max(30, Math.min(120, Math.floor(50 + ((currentParams.speed ?? 0.6) as number) * 60)));
  sampleNeighbors = Math.max(24, Math.min(96, Math.floor(48 + ((currentParams.complexity ?? 0.8) as number) * 60)));
  maxSpeed = 1.4 + ((currentParams.speed ?? 0.6) as number) * 1.4;

  pos = new Float32Array(n * 2);
  vel = new Float32Array(n * 2);
  spc = new Uint8Array(n);
  rules = new Float32Array(k * k);

  // positions
  for (let i = 0; i < n; i++) {
    pos[i * 2] = rnd() * width;
    pos[i * 2 + 1] = rnd() * height;
  }
  // velocities
  for (let i = 0; i < n; i++) {
    vel[i * 2] = (rnd() - 0.5) * maxSpeed * 0.5;
    vel[i * 2 + 1] = (rnd() - 0.5) * maxSpeed * 0.5;
  }
  // species
  for (let i = 0; i < n; i++) spc[i] = Math.floor(rnd() * k) as number;

  // rules: cluster-friendly with some repulsion
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      const idx = i * k + j;
      const base = i === j ? 0.8 : 0.3; // self-attract more strongly
      const noise = (rnd() - 0.5) * 0.6;
      rules[idx] = Math.max(-1, Math.min(1, base + noise));
    }
  }

  // prime background
  if (ctx) {
    const bg = (currentParams.background as string) || "#0c0d10";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
  }
}

function step(t: number) {
  if (!ctx || !pos || !vel || !spc || !rules) return;
  const fg = (currentParams.fg as string) || "#d1e3ff";
  const accent = (currentParams.accent as string) || "#8fb8ff";
  const secondary = (currentParams.secondary as string) || "#7aa2f7";

  // soft fade
  ctx.fillStyle = (currentParams.background as string) || "#0c0d10";
  ctx.globalAlpha = 0.1;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;

  const rad2 = radius * radius;

  // Update velocities via sparse neighbor sampling
  for (let i = 0; i < n; i++) {
    const ix = i * 2;
    const iy = ix + 1;
    const si = spc[i];

    let ax = 0, ay = 0;
    for (let s = 0; s < sampleNeighbors; s++) {
      const j = Math.floor(Math.random() * n);
      if (j === i) continue;
      const jx = j * 2;
      const jy = jx + 1;
      const dx = pos[jx] - pos[ix];
      const dy = pos[jy] - pos[iy];
      const d2 = dx * dx + dy * dy;
      if (d2 > 0 && d2 < rad2) {
        const sj = spc[j];
        const f = rules[si * k + sj]; // attraction strength
        const inv = 1 / Math.sqrt(d2);
        const w = (1 - d2 / rad2) * f * 0.05; // falloff and scaling
        ax += dx * inv * w;
        ay += dy * inv * w;
      }
    }

    vel[ix] += ax;
    vel[iy] += ay;

    // friction and clamp
    vel[ix] *= 0.985;
    vel[iy] *= 0.985;
    const sp = Math.hypot(vel[ix], vel[iy]);
    const ms = maxSpeed;
    if (sp > ms) { vel[ix] = (vel[ix] / sp) * ms; vel[iy] = (vel[iy] / sp) * ms; }
  }

  // Integrate positions and wrap
  for (let i = 0; i < n; i++) {
    const ix = i * 2;
    const iy = ix + 1;
    const px = pos[ix];
    const py = pos[iy];
    pos[ix] = px + vel[ix];
    pos[iy] = py + vel[iy];

    if (pos[ix] < 0) pos[ix] += width; else if (pos[ix] > width) pos[ix] -= width;
    if (pos[iy] < 0) pos[iy] += height; else if (pos[iy] > height) pos[iy] -= height;

    // Draw trail segment
    const col = spc[i] % 3 === 0 ? fg : spc[i] % 3 === 1 ? secondary : accent;
    ctx.strokeStyle = col as string;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(pos[ix], pos[iy]);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

const scene: NatureScene = {
  metadata: { key: "advanced.particle_life", title: "Particle Life", family: "advanced" },
  mount(el: HTMLDivElement, params: SceneParams) {
    container = el;
    currentParams = { ...params };
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D not supported");
    setSize(el);
    el.appendChild(canvas);
    init();
  },
  update(t: number) {
    step(t);
  },
  resize() {
    if (!container || !canvas) return;
    setSize(container);
    init();
  },
  dispose() {
    if (canvas && canvas.parentElement) canvas.parentElement.removeChild(canvas);
    container = null;
    canvas = null;
    ctx = null;
    pos = vel = null;
    spc = null;
    rules = null;
  }
};

export default scene;
