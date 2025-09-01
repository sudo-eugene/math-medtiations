import type { NatureScene, SceneParams } from "@/lib/animations";

let container: HTMLDivElement | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let width = 0;
let height = 0;
let dpr = 1;
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
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

function drawSpiral(t: number) {
  if (!ctx || !canvas) return;
  const params = currentParams || {};
  const bg = params.background || "#F7F5EE";
  const fg = params.fg || "#1E1E1C";
  const accent = params.accent || "#BDAF9F";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;

  ctx.save();
  ctx.translate(cx, cy);

  // Gentle breathing and rotation
  const rot = t * 0.15;
  const scale = 0.9 + 0.06 * Math.sin(t * 0.9);
  ctx.rotate(rot);
  ctx.scale(scale, scale);

  // Golden logarithmic spiral: r = a * e^(k*theta)
  // Choose k so that every quarter-turn scales by golden ratio
  const phi = (1 + Math.sqrt(5)) / 2;
  const k = Math.log(phi) / (Math.PI / 2); // quarter turn => *phi
  const a = Math.min(width, height) * 0.02;

  const turns = Math.max(4, Math.min(10, params.turns ?? 7));
  const maxTheta = turns * Math.PI * 2;

  // Spiral path
  ctx.beginPath();
  for (let theta = 0; theta <= maxTheta; theta += 0.01) {
    const r = a * Math.exp(k * theta);
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    if (theta === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = fg;
  ctx.lineWidth = 1.25;
  ctx.globalAlpha = 0.85;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Secondary offset spiral for depth
  ctx.beginPath();
  for (let theta = 0; theta <= maxTheta; theta += 0.012) {
    const r = a * Math.exp(k * theta) * (1.0 + 0.03 * Math.sin(theta * 3 + t * 1.2));
    const x = r * Math.cos(theta + 0.35);
    const y = r * Math.sin(theta + 0.35);
    if (theta === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = accent;
  ctx.lineWidth = 0.75;
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Fibonacci circles along the spiral
  const circleCount = 24;
  for (let i = 0; i < circleCount; i++) {
    const theta = (i / (circleCount - 1)) * maxTheta;
    const r = a * Math.exp(k * theta);
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    const rr = Math.max(1, Math.min(8, r * 0.015));
    const pulse = 0.6 + 0.4 * Math.sin(t * 1.4 + i * 0.7);

    ctx.beginPath();
    ctx.arc(x, y, rr * pulse, 0, Math.PI * 2);
    ctx.fillStyle = fg;
    ctx.globalAlpha = 0.3 + 0.5 * (i / circleCount);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

const scene: NatureScene = {
  metadata: { key: "fibonacci.golden_spiral", title: "Golden Spiral", family: "fibonacci" },
  mount(el: HTMLDivElement, params: SceneParams) {
    container = el;
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D not supported");
    currentParams = { ...params };
    setSize(el);
    el.appendChild(canvas);
    // initial render
    drawSpiral(0);
  },
  update(t: number) {
    if (!container) return;
    drawSpiral(t || 0);
  },
  resize() {
    if (!container || !canvas) return;
    setSize(container);
  },
  dispose() {
    if (canvas && canvas.parentElement) canvas.parentElement.removeChild(canvas);
    container = null;
    canvas = null;
    ctx = null;
    currentParams = {};
  },
};

export default scene;
