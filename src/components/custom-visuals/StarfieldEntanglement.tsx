import { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: quantum curiosity, mirrored realities, unseen bonds
// Visualization: Entangled star pairs drift together across two layers, occasionally collapsing in flashes of certainty

const StarfieldEntanglement: React.FC<VisualProps> = ({ width, height }) => {
  const frontRef = useRef<HTMLCanvasElement | null>(null);
  const backRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const front = frontRef.current;
    const back = backRef.current;
    if (!front || !back) return;

    front.width = width;
    front.height = height;
    back.width = width;
    back.height = height;

    const frontCtx = front.getContext('2d');
    const backCtx = back.getContext('2d');
    if (!frontCtx || !backCtx) return;

    interface Pair {
      x: number;
      y: number;
      vx: number;
      vy: number;
      flash: number;
    }

    const numPairs = 120;
    const flashDuration = 15;
    const collapseProbability = 0.002;

    const createPair = (): Pair => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 0.3;
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        flash: 0,
      };
    };

    const pairs: Pair[] = Array.from({ length: numPairs }, createPair);
    let animationFrameId: number;

    const update = () => {
      frontCtx.fillStyle = 'black';
      frontCtx.fillRect(0, 0, width, height);
      backCtx.fillStyle = 'black';
      backCtx.fillRect(0, 0, width, height);

      for (const pair of pairs) {
        if (pair.flash > 0) {
          const intensity = pair.flash / flashDuration;
          const radius = 2 + (1 - intensity) * 4;

          frontCtx.fillStyle = `rgba(255,255,200,${0.5 + 0.5 * intensity})`;
          frontCtx.beginPath();
          frontCtx.arc(pair.x, pair.y, radius, 0, Math.PI * 2);
          frontCtx.fill();

          backCtx.fillStyle = `rgba(255,255,200,${0.3 + 0.3 * intensity})`;
          backCtx.beginPath();
          backCtx.arc(width - pair.x, height - pair.y, radius, 0, Math.PI * 2);
          backCtx.fill();

          pair.flash -= 1;
          if (pair.flash === 0) {
            Object.assign(pair, createPair());
          }
          continue;
        }

        pair.x += pair.vx;
        pair.y += pair.vy;

        if (pair.x < 0) pair.x += width;
        if (pair.x >= width) pair.x -= width;
        if (pair.y < 0) pair.y += height;
        if (pair.y >= height) pair.y -= height;

        if (Math.random() < collapseProbability) {
          pair.flash = flashDuration;
        }

        frontCtx.fillStyle = 'rgba(255,255,255,0.9)';
        frontCtx.beginPath();
        frontCtx.arc(pair.x, pair.y, 1.2, 0, Math.PI * 2);
        frontCtx.fill();

        backCtx.fillStyle = 'rgba(255,255,255,0.4)';
        backCtx.beginPath();
        backCtx.arc(width - pair.x, height - pair.y, 1.0, 0, Math.PI * 2);
        backCtx.fill();
      }

      animationFrameId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationFrameId);
  }, [width, height]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <canvas ref={backRef} style={{ position: 'absolute', left: 0, top: 0 }} />
      <canvas ref={frontRef} style={{ position: 'absolute', left: 0, top: 0 }} />
    </div>
  );
};

const metadata = {
  themes: 'quantum curiosity, mirrored realities, unseen bonds',
  visualization: 'Entangled star pairs drift together across two layers, occasionally collapsing in flashes of certainty',
  promptSuggestion:
    '1. Increase pair count\n2. Introduce color variance\n3. Adjust collapse frequency\n4. Explore mirrored transformations\n5. Add interactive measurement triggers',
};

StarfieldEntanglement.metadata = metadata;

export default StarfieldEntanglement;
