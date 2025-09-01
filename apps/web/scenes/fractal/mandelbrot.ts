import type { NatureScene, SceneParams } from "@/lib/animations";

let container: HTMLDivElement | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let width = 0;
let height = 0;
let dpr = 1;
let currentParams: SceneParams = {};
let progressY = 0;
let done = false;

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

function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [0, 0, 0];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] as const;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function drawRows(t: number) {
  if (!ctx) return;
  const bg = currentParams.background || "#F0EFE9";
  const fg = currentParams.fg || "#1E1E1C";
  const accent = currentParams.accent || "#5E8CA6";

  // paint background once
  if (progressY === 0) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
  }

  const maxIter = Math.max(60, Math.min(600, currentParams.maxIterations ?? 160));
  const zoom = Math.max(0.2, Math.min(20, currentParams.zoom ?? 1.6));
  const cx = typeof currentParams.centerX === "number" ? currentParams.centerX : -0.75;
  const cy = typeof currentParams.centerY === "number" ? currentParams.centerY : 0.0;
  const hueShift = currentParams.hueShift ?? 0.0;

  const w = width;
  const h = height;
  const scale = (2.5 / zoom) / Math.min(w, h);

  const rowsPerFrame = Math.max(1, Math.floor(h / 220));
  const imgData = ctx.createImageData(w, rowsPerFrame);
  const data = imgData.data;

  for (let ry = 0; ry < rowsPerFrame && progressY < h; ry++, progressY++) {
    const y0 = (progressY - h / 2) * scale + cy;
    for (let x = 0; x < w; x++) {
      const x0 = (x - w / 2) * scale + cx;
      let a = 0, b = 0;
      let i = 0;
      let aa = 0, bb = 0, ab = 0;
      while (i < maxIter && (aa + bb) <= 4) {
        ab = a * b;
        a = aa - bb + x0;
        b = 2 * ab + y0;
        aa = a * a;
        bb = b * b;
        i++;
      }

      const p = (ry * w + x) * 4;
      if (i === maxIter) {
        // interior: deep color
        const [fr, fgB, fb] = hexToRgb(fg);
        data[p] = fr; data[p + 1] = fgB; data[p + 2] = fb; data[p + 3] = 255;
      } else {
        const mu = i - Math.log(Math.log(Math.sqrt(aa + bb))) / Math.log(2);
        const norm = (mu / maxIter) % 1;
        // palette between accent -> bg with slight time shift
        const [ar, ag, ab2] = hexToRgb(accent);
        const [br, bg2, bb2] = hexToRgb(bg);
        const shift = (norm + 0.15 * Math.sin(t * 0.5) + hueShift) % 1;
        const r = Math.floor(lerp(ar, br, shift));
        const g = Math.floor(lerp(ag, bg2, shift));
        const bcol = Math.floor(lerp(ab2, bb2, shift));
        data[p] = r; data[p + 1] = g; data[p + 2] = bcol; data[p + 3] = 255;
      }
    }
  }

  ctx.putImageData(imgData, 0, progressY - rowsPerFrame);
  if (progressY >= h) done = true;
}

const scene: NatureScene = {
  metadata: { key: "fractal.mandelbrot", title: "Mandelbrot", family: "fractal" },
  mount(el: HTMLDivElement, params: SceneParams) {
    container = el;
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D not supported");
    currentParams = { ...params };
    setSize(el);
    el.appendChild(canvas);
    progressY = 0;
    done = false;
    drawRows(0);
  },
  update(t: number) {
    if (!container) return;
    if (!done) drawRows(t || 0);
  },
  resize() {
    if (!container || !canvas) return;
    setSize(container);
    progressY = 0;
    done = false;
  },
  dispose() {
    if (canvas && canvas.parentElement) canvas.parentElement.removeChild(canvas);
    container = null;
    canvas = null;
    ctx = null;
    currentParams = {};
    progressY = 0;
    done = false;
  },
};

export default scene;
