import React, { useEffect, useRef, useState } from 'react';
import { VisualProps } from '../../types';

// Themes: form from formlessness, potential in emptiness, constant transformation
// Visualization: An ASCII blob that constantly shifts and changes, representing the formless potential from which all things arise

const AsciiBlob: React.FC<VisualProps> = ({ width: containerWidth, height: containerHeight }) => {
  const [grid, setGrid] = useState([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const fontSize = 12;
    const charWidth = fontSize * 0.6;
    const charHeight = fontSize * 1.2;
    const width = Math.floor(containerWidth / charWidth);
    const height = Math.floor(containerHeight / charHeight);

    if (!width || !height) return;

    const draw = (time) => {
      const newGrid = [];
      for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
          const value = Math.sin(x * 0.1 + time) + Math.cos(y * 0.1 + time);
          if (value > 0.5) {
            row.push('#');
          } else if (value > 0) {
            row.push('*');
          } else {
            row.push(' ');
          }
        }
        newGrid.push(row.join(''));
      }
      setGrid(newGrid);
      animationRef.current = requestAnimationFrame(() => draw(time + 0.05));
    };

    draw(0);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [containerWidth, containerHeight]);

  const fontSize = 12;

  return (
    <div style={{
      width: `${containerWidth}px`,
      height: `${containerHeight}px`,
      fontFamily: 'monospace',
      fontSize: `${fontSize}px`,
      whiteSpace: 'pre',
      backgroundColor: '#F0EEE6',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div>
        {grid.map((row, i) => (
          <div key={i}>{row}</div>
        ))}
      </div>
    </div>
  );
};

export default AsciiBlob;
