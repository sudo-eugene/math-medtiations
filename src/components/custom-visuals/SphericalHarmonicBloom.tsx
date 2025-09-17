// Themes: harmonic bloom, spherical balance, calm projection
// Visualisation: Projected spherical harmonics paint blooming petals across the plane
// Unique mechanism: Evaluates spherical harmonic Y_l^m values over a latitude-longitude sampling and maps amplitude to ink intensity
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const factorial = (n: number) => {
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
};

const legendre = (l: number, m: number, x: number) => {
  let pmm = 1;
  if (m > 0) {
    const somx2 = Math.sqrt((1 - x) * (1 + x));
    let fact = 1;
    for (let i = 1; i <= m; i++) {
      pmm *= -fact * somx2;
      fact += 2;
    }
  }
  if (l === m) return pmm;
  let pmmp1 = x * (2 * m + 1) * pmm;
  if (l === m + 1) return pmmp1;
  let pll = 0;
  for (let ll = m + 2; ll <= l; ll++) {
    pll = ((2 * ll - 1) * x * pmmp1 - (ll + m - 1) * pmm) / (ll - m);
    pmm = pmmp1;
    pmmp1 = pll;
  }
  return pll;
};

const normalization = (l: number, m: number) => {
  const num = (2 * l + 1) * factorial(l - m);
  const den = 4 * Math.PI * factorial(l + m);
  return Math.sqrt(num / den);
};

const Ylm = (l: number, m: number, theta: number, phi: number) => {
  const norm = normalization(l, Math.abs(m));
  const plm = legendre(l, Math.abs(m), Math.cos(theta));
  if (m > 0) {
    return Math.sqrt(2) * norm * Math.cos(m * phi) * plm;
  } else if (m < 0) {
    return Math.sqrt(2) * norm * Math.sin(Math.abs(m) * phi) * plm;
  }
  return norm * plm;
};

const SphericalHarmonicBloom: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | undefined>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, width, height);

    const cols = 120;
    const rows = 80;
    const cellW = width / cols;
    const cellH = height / rows;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0004;
      const l = 4;
      const m = Math.floor(2 + 2 * Math.sin(t));

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const theta = (row / rows) * Math.PI;
          const phi = (col / cols) * Math.PI * 2 + t * 0.6;
          const value = Ylm(l, m, theta, phi);
          const alpha = Math.min(0.22, Math.abs(value) * 0.8);
          if (alpha < 0.015) continue;
          ctx.fillStyle = `rgba(30,30,30,${alpha})`;
          ctx.fillRect(col * cellW, row * cellH, cellW, cellH);
        }
      }

      ctx.strokeStyle = 'rgba(20,20,20,0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(width * 0.06, height * 0.06, width * 0.88, height * 0.88);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, width, height);
    };
  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, background: '#F0EEE6', overflow: 'hidden' }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

const metadata = {
  themes: 'spherical-harmonic,bloom,projection',
  visualisation: 'Projected spherical harmonics bloom across the page',
  promptSuggestion: '1. Imagine spherical harmonics projecting petals\n2. Feel global harmonies settling\n3. Let the bloom guide gentle focus'
};
(SphericalHarmonicBloom as any).metadata = metadata;

export default SphericalHarmonicBloom;

// Differs from others by: Evaluates spherical harmonic basis functions Y_l^m across the plane to modulate intensity.
