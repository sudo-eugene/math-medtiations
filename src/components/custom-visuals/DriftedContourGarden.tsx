// Themes: contour wandering, gentle drift, meditative mapping
// Visualisation: Contour lines drift across the canvas, redrawing level sets of a slowly morphing scalar field
// Unique mechanism: Samples multiple contour levels of a time-varying scalar field and traces them via marching squares to draw drifting contours
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const DriftedContourGarden: React.FC<VisualProps> = ({ width, height }) => {
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

    const cols = 80;
    const rows = 60;
    const cellW = width / cols;
    const cellH = height / rows;
    const field = new Float32Array(cols * rows);
    const levels = [-0.55, -0.25, 0, 0.25, 0.55];

    const index = (x: number, y: number) => y * cols + x;

    const marchingLines: number[][] = [];

    const sampleField = (time: number) => {
      const t = time * 0.0006;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const nx = (x / cols - 0.5) * 2;
          const ny = (y / rows - 0.5) * 2;
          const value = Math.sin(nx * 3 + t) + Math.cos(ny * 4 - t * 0.7) + 0.5 * Math.sin((nx * ny) * 5 + t * 0.9);
          field[index(x, y)] = value;
        }
      }
    };

    const interpolate = (a: number, b: number, level: number) => {
      const t = (level - a) / (b - a + 1e-6);
      return Math.max(0, Math.min(1, t));
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.035)';
      ctx.fillRect(0, 0, width, height);

      sampleField(time);
      marchingLines.length = 0;

      for (let y = 0; y < rows - 1; y++) {
        for (let x = 0; x < cols - 1; x++) {
          const idx0 = index(x, y);
          const idx1 = index(x + 1, y);
          const idx2 = index(x + 1, y + 1);
          const idx3 = index(x, y + 1);
          const v0 = field[idx0];
          const v1 = field[idx1];
          const v2 = field[idx2];
          const v3 = field[idx3];

          for (let l = 0; l < levels.length; l++) {
            const level = levels[l];
            let caseIndex = 0;
            if (v0 > level) caseIndex |= 1;
            if (v1 > level) caseIndex |= 2;
            if (v2 > level) caseIndex |= 4;
            if (v3 > level) caseIndex |= 8;
            if (caseIndex === 0 || caseIndex === 15) continue;

            const x0 = x * cellW;
            const y0 = y * cellH;

            const edges = [] as Array<[number, number]>;
            if ((caseIndex & 1) !== (caseIndex & 2)) {
              const tInterp = interpolate(v0, v1, level);
              edges.push([x0 + tInterp * cellW, y0]);
            }
            if ((caseIndex & 2) !== (caseIndex & 4)) {
              const tInterp = interpolate(v1, v2, level);
              edges.push([x0 + cellW, y0 + tInterp * cellH]);
            }
            if ((caseIndex & 4) !== (caseIndex & 8)) {
              const tInterp = interpolate(v2, v3, level);
              edges.push([x0 + tInterp * cellW, y0 + cellH]);
            }
            if ((caseIndex & 8) !== (caseIndex & 1)) {
              const tInterp = interpolate(v3, v0, level);
              edges.push([x0, y0 + tInterp * cellH]);
            }
            if (edges.length === 2) {
              marchingLines.push([...edges[0], ...edges[1], level]);
            }
          }
        }
      }

      ctx.lineWidth = 0.7;
      for (let i = 0; i < marchingLines.length; i++) {
        const [x1, y1, x2, y2, level] = marchingLines[i];
        const alpha = 0.06 + Math.abs(level as number) * 0.08;
        ctx.strokeStyle = `rgba(25,25,25,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
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
  themes: 'contour,marching-squares,garden',
  visualisation: 'Marching-squares contours drift across a field',
  promptSuggestion: '1. Watch level sets slide in harmony\n2. Imagine mapping gentle terrain\n3. Let the drifting contours steady your mind'
};
(DriftedContourGarden as any).metadata = metadata;

export default DriftedContourGarden;

// Differs from others by: Uses marching squares on a time-varying scalar field to draw drifting contour lines.
