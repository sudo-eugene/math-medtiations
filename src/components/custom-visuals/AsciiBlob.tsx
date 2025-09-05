import React, { useEffect, useRef, useState } from 'react';

// Themes: form from formlessness, potential in emptiness, constant transformation
// Visualization: An ASCII blob that constantly shifts and changes, representing the formless potential from which all things arise

const AsciiBlob = () => {
  const [grid, setGrid] = useState([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const width = 80;
    const height = 40;

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
  }, []);

  return (
    <div style={{ fontFamily: 'monospace', whiteSpace: 'pre', backgroundColor: '#F0EEE6', padding: '20px' }}>
      {grid.map((row, i) => (
        <div key={i}>{row}</div>
      ))}
    </div>
  );
};

export default AsciiBlob;
