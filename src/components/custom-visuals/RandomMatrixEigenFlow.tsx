// Themes: linear algebra calm, eigen harmony, analytic drift
// Visualisation: Eigenvectors of a smoothly varying random matrix fan across the canvas like analytic petals
// Unique mechanism: Generates a time-varying symmetric matrix, computes its eigenvectors/eigenvalues via power iteration, and uses them to draw flowing rays
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const normalize = (v: number[]) => {
  const len = Math.hypot(...v);
  return v.map((x) => x / (len || 1));
};

const multiplyMatrixVector = (m: number[][], v: number[]) => {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
  ];
};

const RandomMatrixEigenFlow: React.FC<VisualProps> = ({ width, height }) => {
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

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0004;
      const base = [
        [Math.sin(t), Math.cos(t * 1.3) * 0.6, Math.sin(t * 0.7) * 0.4],
        [Math.cos(t * 0.9) * 0.6, Math.sin(t * 1.1), Math.cos(t * 0.6) * 0.5],
        [Math.sin(t * 1.2) * 0.4, Math.cos(t * 0.8) * 0.5, Math.sin(t * 1.5)]
      ];
      const matrix = base.map((row, i) => row.map((_, j) => (base[i][j] + base[j][i]) / 2));

      const eigenvectors: number[][] = [];
      let residualMatrix = matrix.map((row) => [...row]);
      for (let k = 0; k < 3; k++) {
        let v = normalize([Math.random(), Math.random(), Math.random()]);
        for (let iter = 0; iter < 12; iter++) {
          v = normalize(multiplyMatrixVector(residualMatrix, v));
        }
        eigenvectors.push(v);
        const lambda = v[0] * (residualMatrix[0][0] * v[0] + residualMatrix[0][1] * v[1] + residualMatrix[0][2] * v[2]) +
          v[1] * (residualMatrix[1][0] * v[0] + residualMatrix[1][1] * v[1] + residualMatrix[1][2] * v[2]) +
          v[2] * (residualMatrix[2][0] * v[0] + residualMatrix[2][1] * v[1] + residualMatrix[2][2] * v[2]);
        // Deflate using rank-1 update
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            residualMatrix[i][j] -= lambda * v[i] * v[j];
          }
        }
      }

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.35;
      const colors = [0.08, 0.12, 0.16];

      for (let i = 0; i < eigenvectors.length; i++) {
        const vec = eigenvectors[i];
        ctx.strokeStyle = `rgba(25,25,25,${colors[i]})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - vec[0] * scale, cy - vec[1] * scale);
        ctx.lineTo(cx + vec[0] * scale, cy + vec[1] * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + vec[0] * scale * 0.6, cy + vec[1] * scale * 0.6);
        ctx.stroke();
      }

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
  themes: 'eigenvectors,analytic,flow',
  visualisation: 'Eigenvectors of a drifting matrix fan across the plane',
  promptSuggestion: '1. Observe analytic directions aligning\n2. Let eigen petals drift around center\n3. Imagine linear algebra whispering calm'
};
(RandomMatrixEigenFlow as any).metadata = metadata;

export default RandomMatrixEigenFlow;

// Differs from others by: Computes eigenvectors of a time-varying symmetric matrix via power iteration to drive the visual.
