import React, { useEffect, useMemo, useRef, useState } from "react";
import galleryPresets from "./geometry_gallery_presets.json";
import { Upload, Search, Filter, RefreshCw, Download, Play, ImageDown, Settings } from "lucide-react";

/**
 * Geometry Web Gallery — single-file React app
 *
 * Features
 * - Load the 500-preset JSON (from our previous step) via the “Load presets” button
 * - Live search + family filter; sort by family or id; adjustable grid density
 * - Lazy canvas rendering (IntersectionObserver) so it stays fast
 * - Multiple renderers: escape_time (Mandelbrot/Julia), iter_map (de Jong / Clifford / Ikeda / Gumowski–Mira),
 *   ode (Lorenz / Rössler / Aizawa / Halvorsen), parametric_2d (Lissajous / Spirograph),
 *   polar_2d (Superformula / Rose), point_polar (Phyllotaxis), scalar_field (Interference)
 * - Slow/placeholder families: reaction_diffusion (stub preview), dla (optional slow render button), ifs (Barnsley fern — fast)
 * - Click a card for a larger render + PNG download
 *
 * Usage
 * 1) Click “Load presets” and select the JSON you downloaded: geometry_gallery_presets.json
 * 2) Filter, search, and click on any card to view/export
 */

// Presets are now loaded directly from the JSON file.

// ---------- Utilities ----------
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function hslToRgb(h, s, l) {
  // h [0,360), s,l [0,1]
  s = clamp(s, 0, 1); l = clamp(l, 0, 1);
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1=0,g1=0,b1=0;
  if (0 <= hp && hp < 1) [r1,g1,b1] = [c,x,0];
  else if (1 <= hp && hp < 2) [r1,g1,b1] = [x,c,0];
  else if (2 <= hp && hp < 3) [r1,g1,b1] = [0,c,x];
  else if (3 <= hp && hp < 4) [r1,g1,b1] = [0,x,c];
  else if (4 <= hp && hp < 5) [r1,g1,b1] = [x,0,c];
  else if (5 <= hp && hp < 6) [r1,g1,b1] = [c,0,x];
  const m = l - c/2;
  return [Math.round(255*(r1+m)), Math.round(255*(g1+m)), Math.round(255*(b1+m))];
}

function nicePalette(iter, maxIter) {
  if (iter >= maxIter) return [0, 0, 0];
  const t = iter / maxIter;
  const h = 360 * t * 4; // 4 cycles
  const [r,g,b] = hslToRgb(h, 0.6, 0.5 + 0.2*Math.sin(6.283*t));
  return [r,g,b];
}

// Map world coords to pixel grid
function worldToViewport(x, y, bounds, W, H) {
  const [xmin, xmax, ymin, ymax] = bounds;
  const sx = (x - xmin) / (xmax - xmin);
  const sy = (y - ymin) / (ymax - ymin);
  return [Math.round(sx * (W-1)), Math.round((1 - sy) * (H-1))];
}

// ---------- Canvas renderer component (lazy renders when visible) ----------
function useOnScreen(ref) {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting), {
      root: null, threshold: 0.05,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return isIntersecting;
}

function CanvasCard({ preset, pixelSize = 240, onClick, dense=false }) {
  const canvasRef = useRef(null);
  const holderRef = useRef(null);
  const visible = useOnScreen(holderRef);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const W = canvas.width; const H = canvas.height;
    ctx.fillStyle = '#0b0b10';
    ctx.fillRect(0,0,W,H);

    const { family, params, renderer_hint } = preset;
    const viewBounds = preset.view_bounds || null;
    const type = renderer_hint?.type || 'escape_time';

    const drawEscape = () => {
      // Supports Mandelbrot & Julia (by family)
      const maxIter = params.max_iter || 400;
      let bounds = params.bounds || [-2.5, 1.5, -1.5, 1.5];
      if (family === 'mandelbrot' && params.centre && params.zoom) {
        const [cx, cy] = params.centre; const zoom = params.zoom; // smaller => wider view
        const aspect = W / H;
        const w = 3.5 / zoom; const h = (w / aspect);
        bounds = [cx - w/2, cx + w/2, cy - h/2, cy + h/2];
      }
      const escapeR = params.escape_radius || 2.0;
      const imageData = ctx.createImageData(W, H);
      const d = imageData.data;
      for (let py = 0; py < H; py++) {
        const y0 = bounds[2] + (bounds[3]-bounds[2]) * (py / (H-1));
        for (let px = 0; px < W; px++) {
          const x0 = bounds[0] + (bounds[1]-bounds[0]) * (px / (W-1));
          let x = 0, y = 0, iter = 0;
          if (family === 'julia') { x = x0; y = y0; }
          while (x*x + y*y <= escapeR*escapeR && iter < maxIter) {
            const xt = x*x - y*y + (family === 'julia' ? params.c_re : x0);
            const yt = 2*x*y + (family === 'julia' ? params.c_im : y0);
            x = xt; y = yt; iter++;
          }
          const idx = 4*(py*W + px);
          const [r,g,b] = nicePalette(iter, maxIter);
          d[idx] = r; d[idx+1] = g; d[idx+2] = b; d[idx+3] = 255;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };

    const drawIFS = () => {
      const points = Math.min(params.points || 150000, 200000);
      let x = 0, y = 0;
      ctx.fillStyle = 'white';
      const bounds = viewBounds || [-3,3,-6,1];
      for (let i = 0; i < points; i++) {
        const r = Math.random();
        let acc = 0; let map = null;
        for (const m of params.maps) { acc += m.p; if (r <= acc) { map = m; break; } }
        if (!map) map = params.maps[params.maps.length-1];
        const xn = map.a*x + map.b*y + map.e;
        const yn = map.c*x + map.d*y + map.f;
        x = xn; y = yn;
        if (i > (params.discard || 100)) {
          const [px, py] = worldToViewport(x, y, bounds, W, H);
          ctx.fillRect(px, py, 1, 1);
        }
      }
    };

    const drawIterMap = () => {
      const steps = Math.min(params.steps || 500000, dense ? 250000 : 120000);
      const discard = params.discard || 1000;
      let x = 0.1, y = 0.0;
      const img = ctx.getImageData(0,0,W,H);
      const data = img.data;
      const plot = (x, y) => {
        const [px, py] = worldToViewport(x, y, viewBounds || [-3,3,-3,3], W, H);
        const idx = 4*(py*W + px);
        const v = 220; // white ink accumulation
        data[idx] = Math.min(255, data[idx] + v);
        data[idx+1] = Math.min(255, data[idx+1] + v);
        data[idx+2] = Math.min(255, data[idx+2] + v);
        data[idx+3] = 255;
      };
      for (let i = 0; i < steps; i++) {
        if (preset.family === 'de_jong') {
          const { a,b,c,d } = params; const xn = Math.sin(a*y) - Math.cos(b*x); const yn = Math.sin(c*x) - Math.cos(d*y); x = xn; y = yn;
        } else if (preset.family === 'clifford') {
          const { a,b,c,d } = params; const xn = Math.sin(a*y) + c*Math.cos(a*x); const yn = Math.sin(b*x) + d*Math.cos(b*y); x = xn; y = yn;
        } else if (preset.family === 'ikeda') {
          const { u } = params; const t = 0.4 - 6/(1 + x*x + y*y); const xn = 1 + u*(x*Math.cos(t) - y*Math.sin(t)); const yn = u*(x*Math.sin(t) + y*Math.cos(t)); x = xn; y = yn;
        } else if (preset.family === 'gumowski_mira') {
          const { a,b } = params; const f = (x) => a*x + (2*(1-a)*x*x)/(1+x*x); const xn = b*y + f(x); const yn = -x + f(xn); x = xn; y = yn;
        }
        if (i > discard) plot(x, y);
      }
      ctx.putImageData(img, 0, 0);
    };

    const drawODE = () => {
      const steps = Math.min(params.steps || 80000, dense ? 70000 : 50000);
      const dt = params.dt || 0.01;
      let [x,y,z] = params.xyz0 || [0.1, 0, 0];
      const bounds = viewBounds || [-30,30,-30,30];
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      const project = (x,y,z) => [x*0.8 + z*0.2, y*0.8 - z*0.1]; // simple oblique
      const deriv = (x,y,z) => {
        if (preset.family === 'lorenz') {
          const { sigma, rho, beta } = params; return [sigma*(y-x), x*(rho - z) - y, x*y - beta*z];
        } else if (preset.family === 'rossler') {
          const { a,b,c } = params; return [-(y+z), x + a*y, b + z*(x - c)];
        } else if (preset.family === 'aizawa') {
          const { a,b,c,d,e,f } = params; return [ (z - b)*x - d*y, d*x + (z - b)*y, c + a*z - (z*z*z)/3 - (x*x + y*y)*(1 + e*z) + f*z*(x*x*x) ];
        } else if (preset.family === 'halvorsen') {
          const { a } = params; return [ -a*x - 4*y - 4*z - y*y, -a*y - 4*z - 4*x - z*z, -a*z - 4*x - 4*y - x*x ];
        }
        return [0,0,0];
      };
      for (let i=0;i<steps;i++) {
        // RK4
        const k1 = deriv(x,y,z);
        const k2 = deriv(x + dt*k1[0]/2, y + dt*k1[1]/2, z + dt*k1[2]/2);
        const k3 = deriv(x + dt*k2[0]/2, y + dt*k2[1]/2, z + dt*k2[2]/2);
        const k4 = deriv(x + dt*k3[0], y + dt*k3[1], z + dt*k3[2]);
        x += dt*(k1[0] + 2*k2[0] + 2*k3[0] + k4[0]) / 6;
        y += dt*(k1[1] + 2*k2[1] + 2*k3[1] + k4[1]) / 6;
        z += dt*(k1[2] + 2*k2[2] + 2*k3[2] + k4[2]) / 6;
        if (i % 2 === 0) {
          const [px, py] = worldToViewport(...project(x,y,z), bounds, canvas.width, canvas.height);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    };

    const drawParametric = () => {
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.0; ctx.beginPath();
      const N = params.samples || 4000;
      const aspect = W/H; const bounds = [-1.2*aspect, 1.2*aspect, -1.2, 1.2];
      const push = (x,y,i) => {
        const [px,py] = worldToViewport(x,y,bounds,W,H);
        if (i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      };
      if (preset.family === 'lissajous') {
        const {A,B,a,b,delta} = params;
        for (let i=0;i<N;i++) { const t = 2*Math.PI*i/(N-1); push(A*Math.sin(a*t+delta), B*Math.sin(b*t)); }
      } else if (preset.family === 'spirograph') {
        const {R,r,d,kind} = params; const Rr = kind === 'epi' ? R + r : R - r; const k = Rr / r;
        for (let i=0;i<N;i++) { const t = 2*Math.PI*i/(N-1); const x = Rr*Math.cos(t) - d*Math.cos(k*t); const y = Rr*Math.sin(t) - d*Math.sin(k*t); push(x/(R+Math.abs(r)+Math.abs(d)), y/(R+Math.abs(r)+Math.abs(d)), i); }
      }
      ctx.stroke();
    };

    const drawPolar2D = () => {
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.0; ctx.beginPath();
      const N = params.samples || 3000; const aspect = W/H; const S = 1.2;
      const toXY = (r,theta) => [ (r*Math.cos(theta))/S * aspect, (r*Math.sin(theta))/S ];
      const push = (x,y,i) => { const [px,py]=worldToViewport(x,y,[-1,1,-1,1],W,H); if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); };
      if (preset.family === 'superformula') {
        const {m,a,b,n1,n2,n3} = params; const sf = (phi)=>{ const t1 = Math.pow(Math.abs(Math.cos(m*phi/4)/a), n2); const t2 = Math.pow(Math.abs(Math.sin(m*phi/4)/b), n3); const r = Math.pow(t1+t2, -1/n1); return r; };
        for (let i=0;i<N;i++){ const t = 2*Math.PI*i/(N-1); const r = sf(t); const [x,y]=toXY(r,t); push(x,y,i); }
      } else if (preset.family === 'rose_curve') {
        const { k_num, k_den, A } = params; const k = k_num / k_den;
        for (let i=0;i<N;i++){ const t = 2*Math.PI*i/(N-1); const r = A*Math.cos(k*t); const [x,y]=toXY(Math.abs(r), t + (r<0?Math.PI:0)); push(x,y,i); }
      }
      ctx.stroke();
    };

    const drawPhyllotaxis = () => {
      const n = Math.min(params.n_points || 2000, dense ? 4000 : 2400);
      const ang = (params.divergence_deg || 137.507) * Math.PI/180;
      ctx.fillStyle = '#d1fae5';
      for (let i=0;i<n;i++) { const r = (params.scale||0.7) * Math.sqrt(i)/Math.sqrt(n); const t = i*ang; const x = r*Math.cos(t); const y = r*Math.sin(t); const [px,py]=worldToViewport(x,y,[-1,1,-1,1], W,H); ctx.fillRect(px,py,1,1); }
    };

    const drawScalarField = () => {
      const imageData = ctx.createImageData(W,H); const d = imageData.data;
      const ks = params.k_vectors || [[1,0,1],[0.309,0.951,1],[ -0.809,0.588,1]]; const ph = params.phases || [0,1,2];
      for (let py=0;py<H;py++) {
        const y = -1 + 2*py/(H-1);
        for (let px=0;px<W;px++) { const x=-1 + 2*px/(W-1); let v=0; for (let i=0;i<ks.length;i++){ const [kx,ky,kmag]=ks[i]; v += Math.cos((kx*x + ky*y)*kmag*Math.PI + (ph[i]||0)); } v /= ks.length; const c = Math.round(255*(v*0.5+0.5)); const idx=4*(py*W+px); d[idx]=c; d[idx+1]=c; d[idx+2]=c; d[idx+3]=255; }
      }
      ctx.putImageData(imageData,0,0);
    };

    const drawNewtonBasins = () => {
      // Very simple Newton for z^n - 1 like polynomials; we will parse n from string if possible
      const maxIter = params.max_iter || 40; const tol = params.tolerance || 1e-6; const bounds = params.bounds || [-2,2,-2,2];
      const imageData = ctx.createImageData(W,H); const d = imageData.data;
      // Try detect n in "z**n - 1"
      let n = 3; const m = /z\*\*(\d+)/.exec(params.polynomial || "z**3 - 1"); if (m) n = parseInt(m[1]);
      for (let py=0; py<H; py++) {
        const y0 = bounds[2] + (bounds[3]-bounds[2]) * (py / (H-1));
        for (let px=0; px<W; px++) {
          const x0 = bounds[0] + (bounds[1]-bounds[0]) * (px / (W-1));
          let x = x0, y = y0, k = 0; let converged = false;
          while (k < maxIter) {
            // z_{k+1} = z - f(z)/f'(z) for z^n - 1 => n*z^{n-1}
            // Compute z^{n-1} using polar
            const r = Math.hypot(x,y); const theta = Math.atan2(y,x);
            if (r === 0) { break; }
            const rn = Math.pow(r, n-1); const re = rn * Math.cos((n-1)*theta); const im = rn * Math.sin((n-1)*theta);
            // f(z) = z^n - 1 => z*z^{n-1} - 1
            const f_re = x*re - y*im - 1; const f_im = x*im + y*re;
            const df_re = n * re; const df_im = n * im;
            const denom = df_re*df_re + df_im*df_im; if (denom === 0) break;
            // z - f/df
            const zx = x - (f_re*df_re + f_im*df_im)/denom; const zy = y - (f_im*df_re - f_re*df_im)/denom;
            if (Math.hypot(zx-x, zy-y) < tol) { x=zx; y=zy; converged = true; break; }
            x=zx; y=zy; k++;
          }
          const idx = 4*(py*W+px);
          if (!converged) { d[idx]=d[idx+1]=d[idx+2]=0; d[idx+3]=255; continue; }
          // Identify root angle
          const ang = (Math.atan2(y,x) + 2*Math.PI) % (2*Math.PI);
          const hue = 360 * (ang / (2*Math.PI)); const [r,g,b] = hslToRgb(hue, 0.7, 0.55);
          d[idx]=r; d[idx+1]=g; d[idx+2]=b; d[idx+3]=255;
        }
      }
      ctx.putImageData(imageData,0,0);
    };

    const drawReactionDiffusionStub = () => {
      // Fast stub: Perlin-less smooth noise via summed sines to suggest spots/stripes
      const imageData = ctx.createImageData(W,H); const d = imageData.data; const F = params.F || 0.04; const k = params.k || 0.06;
      for (let py=0;py<H;py++) {
        for (let px=0;px<W;px++) {
          const x = px/W, y = py/H; let v = 0;
          v += Math.sin(12*x + 8*y);
          v += 0.5*Math.sin(22*x - 11*y + 1.7);
          v += 0.25*Math.sin(40*x + 3*y + 0.3);
          v = v/1.75;
          const s = 0.5 + 0.5*Math.sin(8*v + 30*(F-0.03) - 20*(k-0.06));
          const c = Math.round(255*s);
          const idx=4*(py*W+px); d[idx]=c; d[idx+1]=c; d[idx+2]=c; d[idx+3]=255;
        }
      }
      ctx.putImageData(imageData,0,0);
    };

    const drawDLAStub = () => {
      // Very small DLA grow for preview (fast-ish)
      const N = 4000; const center = [Math.floor(W/2), Math.floor(H/2)];
      const grid = new Uint8Array(W*H);
      const idx = (x,y)=>4*(y*W+x);
      const set = (x,y)=>{ const i=y*W+x; grid[i]=1; const j=idx(x,y); const img = ctx.getImageData(0,0,W,H); const d=img.data; d[j]=230; d[j+1]=245; d[j+2]=255; d[j+3]=255; ctx.putImageData(img,0,0); };
      set(center[0], center[1]);
      const isTouching = (x,y)=>{ for(let dy=-1;dy<=1;dy++){ for(let dx=-1;dx<=1;dx++){ const nx=x+dx, ny=y+dy; if(nx>=0&&nx<W&&ny>=0&&ny<H){ if(grid[ny*W+nx]) return true; } } } return false; };
      for (let i=0;i<N;i++){
        let x = Math.floor(Math.random()*W), y = 0;
        for (let t=0;t<2000;t++) {
          const r = Math.random(); if (r<0.25) x++; else if (r<0.5) x--; else if (r<0.75) y++; else y--;
          if (x<1||x>=W-1||y<1||y>=H-1) break;
          if (isTouching(x,y)) { grid[y*W+x]=1; break; }
        }
      }
      // Render final grid
      const img = ctx.getImageData(0,0,W,H); const d = img.data;
      for (let y=0;y<H;y++) for (let x=0;x<W;x++) if (grid[y*W+x]) {
        const j=4*(y*W+x); d[j]=230; d[j+1]=245; d[j+2]=255; d[j+3]=255; }
      ctx.putImageData(img,0,0);
    };

    try {
      if (type === 'escape_time') drawEscape();
      else if (type === 'iter_map') drawIterMap();
      else if (type === 'ode') drawODE();
      else if (type === 'parametric_2d') drawParametric();
      else if (type === 'polar_2d') drawPolar2D();
      else if (type === 'point_polar') drawPhyllotaxis();
      else if (type === 'scalar_field') drawScalarField();
      else if (type === 'ifs') drawIFS();
      else if (type === 'newton_basins') drawNewtonBasins();
      else if (type === 'reaction_diffusion') drawReactionDiffusionStub();
      else if (type === 'dla') drawDLAStub();
      else drawEscape();
    } catch (e) {
      ctx.fillStyle = '#fcd34d'; ctx.fillText('Render error', 8, 20);
      console.error(e);
    }
  }, [visible, preset, pixelSize, dense]);

  const downloadPNG = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const link = document.createElement('a');
    link.download = preset.id.replace(/[:]/g,'_') + ".png";
    link.href = canvas.toDataURL('image/png'); link.click();
  };

  return (
    <div ref={holderRef} className="group rounded-2xl bg-neutral-900 border border-neutral-800 p-3 shadow-md hover:shadow-lg transition cursor-pointer" onClick={() => onClick?.(preset)}>
      <canvas ref={canvasRef} width={pixelSize} height={Math.round(pixelSize*0.66)} className="w-full rounded-xl bg-black" />
      <div className="mt-2 flex items-center justify-between text-xs text-neutral-300">
        <div className="truncate"><span className="font-medium text-neutral-100">{preset.family}</span> · {preset.preset_index.toString().padStart(2,'0')}</div>
        <button title="Download PNG" onClick={(e)=>{e.stopPropagation(); downloadPNG();}} className="opacity-0 group-hover:opacity-100 transition text-neutral-300 hover:text-white"><ImageDown size={16} /></button>
      </div>
    </div>
  );
}

// ---------- Modal for big render ----------
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-5xl p-4" onClick={(e)=>e.stopPropagation()}>
        <div className="flex justify-end"><button onClick={onClose} className="text-neutral-300 hover:text-white">Close</button></div>
        {children}
      </div>
    </div>
  );
}

function BigRender({ preset }) {
  const canvasRef = useRef(null);
  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return; const ctx = canvas.getContext('2d');
    // Reuse CanvasCard drawing by constructing a fake component? Simpler: duplicate small switch with higher resolution.
    const W = 960, H = 640; canvas.width=W; canvas.height=H;
    const small = <CanvasCard preset={preset} pixelSize={960} dense onClick={()=>{}} />;
    // Hack: render small card into this canvas by invoking the same code path is awkward in React.
    // Instead, trigger a custom event our small renderer listens to — simpler approach: setTimeout to let CanvasCard useEffect run.
  }, [preset]);
  // Instead of re-implementing, we simply mount another CanvasCard inside the modal with a larger pixelSize
  return (
    <div>
      <CanvasCard preset={preset} pixelSize={960} dense />
      <div className="mt-3 text-sm text-neutral-300">
        <div className="font-mono text-xs break-all">{preset.id}</div>
        <div className="opacity-80">{preset.notes}</div>
        <details className="mt-2">
          <summary className="cursor-pointer">Parameters</summary>
          <pre className="mt-2 bg-neutral-950 p-3 rounded-xl overflow-auto text-xs">{JSON.stringify(preset.params, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
}

// ---------- Main App ----------
export default function GeometryGallery() {
  const [presets, setPresets] = useState(galleryPresets);
  const [query, setQuery] = useState("");
  const [familyFilter, setFamilyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("family");
  const [grid, setGrid] = useState(3); // 3..6
  const [selected, setSelected] = useState(null);

  const families = useMemo(()=>Array.from(new Set(presets.map(p=>p.family))).sort(), [presets]);

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase();
    let out = presets.filter(p => (familyFilter === 'all' || p.family === familyFilter) && (!q || p.id.toLowerCase().includes(q) || p.family.toLowerCase().includes(q)));
    if (sortBy === 'family') out.sort((a,b)=> a.family.localeCompare(b.family) || a.preset_index - b.preset_index);
    else if (sortBy === 'id') out.sort((a,b)=> a.id.localeCompare(b.id));
    return out;
  }, [presets, query, familyFilter, sortBy]);

  
  const gridCols = `grid-cols-1 sm:grid-cols-2 md:grid-cols-${grid} xl:grid-cols-${grid+1}`;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <SEO
        title="Interactive Geometry Gallery | 500+ Math Fractals & Attractors"
        description="Dive into an infinite collection of mathematical beauty. Explore Mandelbrot sets, Julia fractals, chaotic attractors, and flow fields in our interactive geometry gallery."
        keywords="fractal gallery, mandelbrot set, julia set, chaos theory, interactive math, webgl art, algorithm visualization, math art, creative coding"
        url="/gallery"
      />
      <header className="sticky top-0 z-40 backdrop-blur bg-neutral-950/80 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2">
          <div className="text-lg font-semibold tracking-wide">Geometry Gallery</div>
          <div className="ml-auto flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800">
              <Search size={16} className="opacity-70" />
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search id or family" className="bg-transparent focus:outline-none text-sm placeholder:text-neutral-500" />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800">
              <Filter size={16} className="opacity-70" />
              <select value={familyFilter} onChange={e=>setFamilyFilter(e.target.value)} className="bg-transparent text-sm focus:outline-none">
                <option value="all">All families</option>
                {families.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800">
              <Settings size={16} className="opacity-70" />
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="bg-transparent text-sm focus:outline-none">
                <option value="family">Sort by family</option>
                <option value="id">Sort by id</option>
              </select>
              <span className="mx-1">·</span>
              <label className="text-sm">Grid {grid}</label>
              <input type="range" min={2} max={6} value={grid} onChange={e=>setGrid(parseInt(e.target.value))} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-neutral-400 text-sm mb-4">Click any tile to open a large render and export a PNG.</p>
        <div className={`grid ${gridCols} gap-4`}>
          {filtered.map(p => (
            <CanvasCard key={p.id} preset={p} onClick={setSelected} />
          ))}
        </div>
      </main>

      <Modal open={!!selected} onClose={()=>setSelected(null)}>
        {selected && <BigRender preset={selected} />}
      </Modal>

      <footer className="max-w-7xl mx-auto px-4 pb-10 pt-4 text-xs text-neutral-500">
        <div>Families supported: escape-time fractals, iterated maps, ODE attractors, parametric/polar curves, phyllotaxis, interference fields, IFS ferns, Newton basins. Reaction–diffusion and DLA use fast preview stubs in thumbnails.</div>
      </footer>
    </div>
  );
}
