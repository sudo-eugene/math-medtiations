import type { NatureScene, SceneParams } from "@/lib/animations";

let container: HTMLDivElement | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let width = 0;
let height = 0;
let dpr = 1;
let currentParams: SceneParams = {};

type Star = { r: number; theta: number; layer: number; jitter: number; arm: number; brightness: number };
let stars: Star[] = [];

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

function initStars() {
  const count = Math.max(800, Math.min(8000, currentParams.starCount ?? 2600));
  const arms = Math.max(2, Math.min(6, currentParams.arms ?? 4));
  const spread = Math.max(0.2, Math.min(1.2, currentParams.spread ?? 0.55));

  stars = new Array(count).fill(0).map((_, i) => {
    const layer = Math.floor(Math.random() * 3); // parallax layers
    const arm = Math.floor(Math.random() * arms);
    const r = Math.pow(Math.random(), 0.7) * (Math.min(width, height) * 0.48);
    const baseTheta = (arm / arms) * Math.PI * 2 + r * 0.012 * (Math.random() * 0.5 + 0.75);
    const jitter = (Math.random() - 0.5) * spread * (0.2 + 0.8 * (1 - r / (Math.min(width, height) * 0.48)));
    const brightness = 0.6 + Math.random() * 0.8;
    return { r, theta: baseTheta, layer, jitter, arm, brightness };
  });
}

function draw(t: number) {
  if (!ctx) return;
  const bg = currentParams.background || "#F7F5EE";
  const fg = currentParams.fg || "#1E1E1C";
  const accent = currentParams.accent || "#A67C5E";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const spin = currentParams.spin ?? 0.12;

  // faint rings
  ctx.strokeStyle = `${accent}22`;
  ctx.lineWidth = 1;
  for (let r = 60; r < Math.min(width, height) * 0.5; r += 40) {
    ctx.beginPath();
    const rr = r + Math.sin(t * 0.5 + r * 0.01) * 3;
    ctx.arc(cx, cy, rr, 0, Math.PI * 2);
    ctx.stroke();
  }

  // draw stars
  for (const s of stars) {
    const theta = s.theta + spin * t * (1 + s.layer * 0.2);
    const x = cx + Math.cos(theta + s.jitter) * s.r;
    const y = cy + Math.sin(theta + s.jitter) * s.r * 0.92;
    const size = (1 + s.layer) * 0.7;

    // occasional twinkle
    const tw = 0.85 + 0.35 * Math.sin(t * 2 + s.r * 0.02 + s.theta * 3);

    ctx.beginPath();
    ctx.arc(x, y, size * tw, 0, Math.PI * 2);
    // Bright star points
    ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + 0.65 * s.brightness})`;
    ctx.fill();

    // accent core
    if (s.brightness > 1.0) {
      ctx.beginPath();
      ctx.arc(x, y, (size * tw) / 2, 0, Math.PI * 2);
      ctx.fillStyle = `${accent}55`;
      ctx.fill();
    }
  }

  // soft core glow
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.35);
  grd.addColorStop(0, `${accent}33`);
  grd.addColorStop(1, `${bg}00`);
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.min(width, height) * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

const scene: NatureScene = {
  metadata: { key: "galaxy.spiral", title: "Galaxy Spiral", family: "galaxy" },
  mount(el: HTMLDivElement, params: SceneParams) {
    container = el;
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D not supported");
    currentParams = { ...params };
    setSize(el);
    el.appendChild(canvas);
    initStars();
    draw(0);
  },
  update(t: number) {
    if (!container) return;
    draw(t || 0);
  },
  resize() {
    if (!container || !canvas) return;
    setSize(container);
    initStars();
  },
  dispose() {
    if (canvas && canvas.parentElement) canvas.parentElement.removeChild(canvas);
    container = null;
    canvas = null;
    ctx = null;
    currentParams = {};
    stars = [];
  },
};

export default scene;
