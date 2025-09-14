import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const CellularAutomata: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resolution = 10;
    canvas.width = width;
    canvas.height = height;
    const cols = Math.floor(width / resolution);
    const rows = Math.floor(height / resolution);

    let grid = new Array(cols).fill(null)
      .map(() => new Array(rows).fill(null)
      .map(() => Math.floor(Math.random() * 2)));

    const drawGrid = () => {
      ctx.clearRect(0, 0, width, height);
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const cell = grid[col][row];
          ctx.beginPath();
          ctx.rect(col * resolution, row * resolution, resolution, resolution);
          ctx.fillStyle = cell ? 'white' : 'black';
          ctx.fill();
        }
      }
    };

    const updateGrid = () => {
      let nextGen = grid.map(arr => [...arr]);
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const cell = grid[col][row];
          let numNeighbors = 0;
          for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
              if (i === 0 && j === 0) continue;
              const x_cell = col + i;
              const y_cell = row + j;

              if (x_cell >= 0 && y_cell >= 0 && x_cell < cols && y_cell < rows) {
                const currentNeighbor = grid[col + i][row + j];
                numNeighbors += currentNeighbor;
              }
            }
          }

          // Rules
          if (cell === 1 && numNeighbors < 2) {
            nextGen[col][row] = 0;
          } else if (cell === 1 && numNeighbors > 3) {
            nextGen[col][row] = 0;
          } else if (cell === 0 && numNeighbors === 3) {
            nextGen[col][row] = 1;
          }
        }
      }
      grid = nextGen;
    };

    const animate = () => {
      updateGrid();
      drawGrid();
      requestAnimationFrame(animate);
    };

    animate();

  }, [width, height]);

  return <canvas ref={canvasRef} />;
};

export default CellularAutomata;
