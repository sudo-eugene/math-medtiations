import type { NatureScene, SceneParams } from "@/lib/animations";

let container: HTMLDivElement | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let width = 0;
let height = 0;
let dpr = 1;
let currentParams: SceneParams = {};

let x = 0, y = 0; // state
let a = 1.7, b = 1.3, c = 0.6, d = 1.2; // coefficients (Clifford-like)
let pointsPerFrame = 8000;

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

function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function init() {
  const seed = (currentParams.seed ?? 12345) as number;
  const rnd = seededRandom(seed);
  // coefficients in ranges producing interesting structures
  a = -2 + rnd() * 4; // [-2,2]
  b = -2 + rnd() * 4;
  c = -2 + rnd() * 4;
  d = -2 + rnd() * 4;

  // ensure not too degenerate
  if (Math.abs(a) + Math.abs(b) + Math.abs(c) + Math.abs(d) < 1.5) {
    a += 1.2; b -= 1.1; c += 0.8; d -= 0.7;
  }

  x = (rnd() - 0.5) * 0.2;
  y = (rnd() - 0.5) * 0.2;

  // adjust draw density
  const complexity = (currentParams.complexity ?? 0.8) as number; // [0.6,1]
  pointsPerFrame = Math.floor(4000 + complexity * 12000);

  if (!ctx) return;
  // prime background
  const bg = (currentParams.background as string) || "#0b0f14";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
}

function step(t: number) {
  if (!ctx) return;
  const fg = (currentParams.fg as string) || "#e6edf3";
  const accent = (currentParams.accent as string) || "#58a6ff";
  const secondary = (currentParams.secondary as string) || fg;

  // very soft fade for trails
  ctx.fillStyle = (currentParams.background as string) || "#0b0f14";
  ctx.globalAlpha = 0.05;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.translate(width / 2, height / 2);
  const scale = Math.min(width, height) * 0.18; // viewport scale

  // draw many points with subtle color cycling
  for (let i = 0; i < pointsPerFrame; i++) {
    const nx = Math.sin(a * y) + c * Math.cos(a * x);
    const ny = Math.sin(b * x) + d * Math.cos(b * y);
    x = nx; y = ny;

    const px = x * scale;
    const py = y * scale;

    // Color varies by local velocity
    const v = Math.hypot(nx - x, ny - y);
    const col = v > 0.6 ? accent : v > 0.25 ? secondary : fg;

    ctx.fillStyle = col;
    ctx.globalAlpha = 0.14;
    ctx.fillRect(px, py, 1.1, 1.1);
  }

  ctx.restore();
}

const scene: NatureScene = {
  metadata: { key: "advanced.strange_attractor", title: "Strange Attractor", family: "advanced" },
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
  }
};

export default scene;
