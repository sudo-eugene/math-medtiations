import React, { useEffect, useRef, useState } from 'react';
import { VisualProps } from '../../types';

// Themes: empty source, emergence, cycles of being
// Visualization: ASCII branches grow from a central trunk using simple
// L-system-like rules. Older branches fade as new ones emerge, cycling
// endlessly with a random seed each time.

interface Branch {
  x: number;
  y: number;
  angle: number;
  length: number;
}

const charSets = [
  ['|', '|', ':', '.', ' '], // vertical
  ['/', '/', '.', '.', ' '], // right
  ['\\', '\\', '.', '.', ' '] // left
];
const maxAge = charSets[0].length - 1;
const baseAngle = 0.5; // branching angle

const createSeededRandom = (seed: number) => {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
};

const EmergentTreeOfVoid: React.FC<VisualProps> = ({ width, height }) => {
  const [lines, setLines] = useState<string[]>([]);
  const branchesRef = useRef<Branch[]>([]);
  const ageGridRef = useRef<number[][]>([]);
  const orientGridRef = useRef<number[][]>([]);
  const randRef = useRef<() => number>(() => Math.random());
  const iterationRef = useRef(0);
  const colsRef = useRef(0);
  const rowsRef = useRef(0);

  useEffect(() => {
    const fontSize = 12;
    const charWidth = 8;
    const charHeight = 12;
    const cols = Math.floor(width / charWidth);
    const rows = Math.floor(height / charHeight);
    colsRef.current = cols;
    rowsRef.current = rows;

    const ageGrid = Array.from({ length: rows }, () => Array(cols).fill(maxAge));
    const orientGrid = Array.from({ length: rows }, () => Array(cols).fill(0));
    ageGridRef.current = ageGrid;
    orientGridRef.current = orientGrid;

    const reset = () => {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          ageGrid[y][x] = maxAge;
          orientGrid[y][x] = 0;
        }
      }
      const seed = Math.floor(Math.random() * 2147483647);
      randRef.current = createSeededRandom(seed);
      const trunkLength = Math.floor(rows / 4);
      const startX = Math.floor(cols / 2);
      const startY = rows - 1;
      branchesRef.current = [{ x: startX, y: startY, angle: -Math.PI / 2, length: trunkLength }];
      iterationRef.current = 0;
    };

    const step = () => {
      const cols = colsRef.current;
      const rows = rowsRef.current;
      const ageGrid = ageGridRef.current;
      const orientGrid = orientGridRef.current;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (ageGrid[y][x] < maxAge) ageGrid[y][x]++;
        }
      }

      const rand = randRef.current;
      const nextBranches: Branch[] = [];

      for (const b of branchesRef.current) {
        let x = b.x;
        let y = b.y;
        const dx = Math.cos(b.angle);
        const dy = Math.sin(b.angle);

        for (let i = 0; i < b.length; i++) {
          x += dx;
          y += dy;
          const cx = Math.round(x);
          const cy = Math.round(y);
          if (cx < 0 || cx >= cols || cy < 0 || cy >= rows) break;
          ageGrid[cy][cx] = 0;
          const absDx = Math.abs(dx);
          let orient = 0;
          if (absDx > 0.3) orient = dx > 0 ? 1 : 2;
          orientGrid[cy][cx] = orient;
        }

        const endX = Math.round(x);
        const endY = Math.round(y);
        const newLength = b.length * (0.7 + rand() * 0.1);
        if (newLength > 1) {
          const angleVar = rand() * 0.2;
          nextBranches.push({ x: endX, y: endY, angle: b.angle - baseAngle + angleVar, length: newLength });
          nextBranches.push({ x: endX, y: endY, angle: b.angle + baseAngle - angleVar, length: newLength });
        }
      }

      branchesRef.current = nextBranches;
      iterationRef.current++;
      if (iterationRef.current > 6 || nextBranches.length === 0) {
        reset();
      }

      const newLines = ageGrid.map((row, y) =>
        row
          .map((age, x) => {
            const orient = orientGrid[y][x];
            return charSets[orient][Math.min(age, maxAge)];
          })
          .join('')
      );
      setLines(newLines);
    };

    reset();
    step();

    let lastTime = 0;
    let frameId: number;
    const animate = (time: number) => {
      if (time - lastTime > 250) {
        step();
        lastTime = time;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [width, height]);

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: '#F0EEE6',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: '12px',
        color: '#333333',
        overflow: 'hidden'
      }}
    >
      <pre style={{ margin: 0 }}>
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </pre>
    </div>
  );
};

export default EmergentTreeOfVoid;
