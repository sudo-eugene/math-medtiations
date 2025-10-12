import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { VisualProps } from '../../types';

// themes: forms emerge from emptiness then return
// visualization: an endless ASCII cascade where fleeting shapes surface then dissolve back into the void

interface Shape {
  pattern: string[];
  x: number;
  y: number;
  ttl: number;
}

const shapePatterns: string[][] = [
  ['###', '# #', '###'],
  [' /\\ ', '/  \\', '\\  /', ' \\/ '],
  ['  *  ', ' *** ', '*****', ' *** ', '  *  '],
  ['====', ' ===', '  = '],
  ['@@@@', '@@@@', '@@@@']
];

const EternalAsciiWaterfall: React.FC<VisualProps> = ({ width, height }) => {
  const [grid, setGrid] = useState<string[]>([]);
  const animationRef = useRef<number | null>(null);
  const shapesRef = useRef<Shape[]>([]);
  const cols = Math.floor(width / 10);
  const rows = Math.floor(height / 10);

  const randomRow = useCallback(() => {
    const palette = [' ', '.', ':', '-', '=', '*', '#', '@', '▓', '█'];
    let row = '';
    for (let i = 0; i < cols; i++) {
      const bias = Math.random();
      const index = Math.floor(Math.pow(bias, 0.45) * (palette.length - 1));
      row += palette[index];
    }
    return row;
  }, [cols]);

  const spawnShape = useCallback(() => {
    const pattern = shapePatterns[Math.floor(Math.random() * shapePatterns.length)];
    const shapeWidth = pattern[0].length;
    const x = Math.floor(Math.random() * Math.max(1, cols - shapeWidth));
    shapesRef.current.push({ pattern, x, y: 0, ttl: rows });
  }, [cols, rows]);

  useEffect(() => {
    const emptyRow = ' '.repeat(cols);
    setGrid(Array(rows).fill(emptyRow));
    shapesRef.current = [];
  }, [cols, rows]);

  const step = useCallback(() => {
    // Occasionally birth a new shape
    if (Math.random() < 0.08) {
      spawnShape();
    }

    // Move shapes downward and reduce ttl
    shapesRef.current.forEach(shape => {
      shape.y += 1;
      shape.ttl -= 1;
    });
    shapesRef.current = shapesRef.current.filter(s => s.ttl > 0 && s.y < rows);

    setGrid(prev => {
      const newRow = randomRow();
      const baseGrid = [newRow, ...prev.slice(0, rows - 1)];
      const gridChars = baseGrid.map(row => row.split(''));

      // Draw shapes over the flowing grid
      shapesRef.current.forEach(shape => {
        shape.pattern.forEach((rowStr, j) => {
          for (let k = 0; k < rowStr.length; k++) {
            const ch = rowStr[k];
            if (ch !== ' ') {
              const y = shape.y + j;
              const x = shape.x + k;
              if (y >= 0 && y < rows && x >= 0 && x < cols) {
                gridChars[y][x] = ch;
              }
            }
          }
        });
      });

      return gridChars.map(chars => chars.join(''));
    });

    animationRef.current = requestAnimationFrame(step);
  }, [randomRow, rows, spawnShape]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(step);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [step]);

  const containerStyle = useMemo(() => ({
    width: `${width}px`,
    height: `${height}px`,
    background: '#F0EEE6',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }), [width, height]);

  const preStyle = useMemo(() => ({
    fontFamily: 'monospace',
    fontSize: '10px',
    lineHeight: '1',
    margin: 0,
    color: '#1f1f1f',
    userSelect: 'none' as const
  }), []);

  return (
    <div style={containerStyle}>
      <pre style={preStyle}>
        {grid.map((row, i) => (
          <div key={i}>{row}</div>
        ))}
      </pre>
    </div>
  );
};

export default EternalAsciiWaterfall;
