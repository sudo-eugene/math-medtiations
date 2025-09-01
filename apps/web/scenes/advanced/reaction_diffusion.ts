import type { NatureScene, SceneParams } from "@/lib/animations";

let container: HTMLDivElement | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let width = 0;
let height = 0;
let dpr = 1;

// Simulation grid (decoupled from canvas size for perf)
let gw = 220;
let gh = 220;
let A: Float32Array | null = null; // chemical A
let B: Float32Array | null = null; // chemical B
let A2: Float32Array | null = null;
let B2: Float32Array | null = null;

let feed = 0.037;
let kill = 0.06;
let dA = 1.0;
let dB = 0.5;
let stepsPerFrame = 6;

let offscreen: HTMLCanvasElement | null = null;
let offctx: CanvasRenderingContext2D | null = null;

let currentParams: SceneParams = {};

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

  // Choose grid size proportionally but capped
  const target = Math.max(120, Math.min(280, Math.floor(Math.min(width, height) / 3)));
  gw = target;
  gh = target;

  offscreen = document.createElement("canvas");
  offscreen.width = gw;
  offscreen.height = gh;
  offctx = offscreen.getContext("2d");
}

function idx(x: number, y: number) {
  return y * gw + x;
}

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function initSim() {
  A = new Float32Array(gw * gh);
  B = new Float32Array(gw * gh);
  A2 = new Float32Array(gw * gh);
  B2 = new Float32Array(gw * gh);

  // Init: A=1 everywhere, B=0; seed B in a small region
  for (let i = 0; i < A.length; i++) A[i] = 1;
  const cx = Math.floor(gw / 2);
  const cy = Math.floor(gh / 2);
  for (let y = cy - 6; y <= cy + 6; y++) {
    for (let x = cx - 6; x <= cx + 6; x++) {
      if (x >= 0 && y >= 0 && x < gw && y < gh) B[idx(x, y)] = 1;
    }
  }
}

// 3x3 Laplacian weights commonly used for Gray-Scott
const wC = -1.0;
const wN = 0.2;
const wD = 0.05;

function laplace(arr: Float32Array, x: number, y: number) {
  const xm = (x - 1 + gw) % gw, xp = (x + 1) % gw;
  const ym = (y - 1 + gh) % gh, yp = (y + 1) % gh;
  const c = arr[idx(x, y)] * wC;
  const n = (arr[idx(xm, y)] + arr[idx(xp, y)] + arr[idx(x, ym)] + arr[idx(x, yp)]) * wN;
  const d = (arr[idx(xm, ym)] + arr[idx(xp, ym)] + arr[idx(xm, yp)] + arr[idx(xp, yp)]) * wD;
  return c + n + d;
}

function step() {
  if (!A || !B || !A2 || !B2) return;
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const i = idx(x, y);
      const a = A[i];
      const b = B[i];
      const ra = dA * laplace(A, x, y) - a * b * b + feed * (1 - a);
      const rb = dB * laplace(B, x, y) + a * b * b - (kill + feed) * b;
      A2[i] = clamp01(a + ra);
      B2[i] = clamp01(b + rb);
    }
  }
  // swap buffers
  const tA = A; A = A2; A2 = tA;
  const tB = B; B = B2; B2 = tB;
}

function render() {
  if (!ctx || !offctx || !offscreen || !A || !B) return;
  const img = offctx.createImageData(gw, gh);
  const data = img.data;
  const bg = (currentParams.background as string) || "#F4F6F8";
  const fg = (currentParams.fg as string) || "#1F2B3D";
  const accent = (currentParams.accent as string) || "#4A6B85";

  // Parse colors to RGB
  function hexToRgb(hex: string) {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
    if (!m) return { r: 255, g: 255, b: 255 };
    return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
  }
  const c1 = hexToRgb(bg);
  const c2 = hexToRgb(accent);
  const c3 = hexToRgb(fg);

  for (let i = 0; i < gw * gh; i++) {
    const a = A[i];
    const b = B[i];
    const v = clamp01(a - b + 0.5); // map pattern value
    // smooth blend bg -> accent -> fg
    const t = v < 0.5 ? v * 2 : (v - 0.5) * 2;
    const from = v < 0.5 ? c1 : c2;
    const to = v < 0.5 ? c2 : c3;
    const R = Math.round(from.r + (to.r - from.r) * t);
    const G = Math.round(from.g + (to.g - from.g) * t);
    const Bc = Math.round(from.b + (to.b - from.b) * t);
    const o = i * 4;
    data[o] = R; data[o + 1] = G; data[o + 2] = Bc; data[o + 3] = 255;
  }
  offctx.putImageData(img, 0, 0);

  // Draw scaled to main canvas
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(offscreen, 0, 0, width, height);
}

const scene: NatureScene = {
  metadata: { key: "advanced.reaction_diffusion", title: "Reaction-Diffusion", family: "advanced" },
  mount(el: HTMLDivElement, params: SceneParams) {
    container = el;
    currentParams = { ...params };

    // Params
    feed = typeof params.feed === "number" ? params.feed : 0.037 + (params.complexity ? (params.complexity - 0.6) * 0.02 : 0);
    kill = typeof params.kill === "number" ? params.kill : 0.06 + (params.speed ? (params.speed - 0.3) * 0.02 : 0);
    stepsPerFrame = Math.max(1, Math.min(16, Math.floor((params.speed ?? 0.6) * 10)));

    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D not supported");
    setSize(el);
    el.appendChild(canvas);

    initSim();
    // initial render
    for (let i = 0; i < 40; i++) step();
    render();
  },
  update(t: number) {
    for (let i = 0; i < stepsPerFrame; i++) step();
    render();
  },
  resize() {
    if (!container || !canvas) return;
    setSize(container);
    initSim(); // re-init to match new grid size
  },
  dispose() {
    if (canvas && canvas.parentElement) canvas.parentElement.removeChild(canvas);
    container = null;
    canvas = null;
    ctx = null;
    A = B = A2 = B2 = null;
    offscreen = null; offctx = null;
  }
};

export default scene;
