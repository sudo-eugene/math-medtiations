import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: perspective shifts, hidden paths, transformation through motion
// Visualization: A static ASCII maze distorted by rippling waves that subtly open new passages

const NonEuclideanRippleMaze: React.FC<VisualProps> = ({ width: containerWidth, height: containerHeight }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fontSize = 12;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const charWidth = fontSize * 0.6;
    const charHeight = fontSize * 1.2;
    const cols = Math.floor(containerWidth / charWidth);
    const rows = Math.floor(containerHeight / charHeight);

    if (!cols || !rows) return;

    const baseMaze = [
      '############################',
      '# #   #    #       #      #',
      '# ### # ## # ##### # #### #',
      '#     #    # #   # #    # #',
      '##### ###### # # # #### # #',
      '#   #      # # # #    #   #',
      '# # ###### # ### #### ### #',
      '# #      # #     #  #     #',
      '# ######## ####### ########',
      '#        #         #      #',
      '############################',
    ];

    const mazeH = baseMaze.length;
    const mazeW = baseMaze[0].length;

    let time = 0;
    let frame = 0;
    let animationId: number;
    let extraOpenings: { x: number; y: number }[] = [];

    const draw = () => {
      frame++;
      time += 0.05;

      // Occasionally shift openings to suggest non-Euclidean paths
      if (frame % 200 === 0) {
        extraOpenings = [];
        const count = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < count; i++) {
          extraOpenings.push({
            x: Math.floor(Math.random() * mazeW),
            y: Math.floor(Math.random() * mazeH),
          });
        }
      }

      let html = '';
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const nx = (x / cols) * mazeW;
          const ny = (y / rows) * mazeH;

          const waveX = nx + Math.sin((ny + time) * 1.2) * 0.5;
          const waveY = ny + Math.sin((nx + time) * 1.2) * 0.5;

          let mx = Math.floor((waveX % mazeW + mazeW) % mazeW);
          let my = Math.floor((waveY % mazeH + mazeH) % mazeH);

          let ch = baseMaze[my][mx];
          if (ch === '#' && extraOpenings.some(o => o.x === mx && o.y === my)) {
            ch = ' ';
          }
          html += ch;
        }
        html += '<br>';
      }

      canvas.innerHTML = html;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      canvas.innerHTML = '';
    };
  }, [containerWidth, containerHeight]);

  return (
    <div
      style={{
        margin: 0,
        background: '#F0EEE6',
        overflow: 'hidden',
        fontFamily: 'monospace',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
      }}
    >
      <div
        ref={canvasRef}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: '1',
          letterSpacing: '0',
          color: 'rgba(0,0,0,0.85)',
          userSelect: 'none',
          whiteSpace: 'pre',
        }}
      />
    </div>
  );
};

export default NonEuclideanRippleMaze;

