import React, { useEffect, useRef, useState } from 'react';
import { VisualProps } from '../../types';

// Themes: paradox of wisdom, hidden truth beneath appearances, embracing contradictions
// Visualization: An ASCII mandala that reveals complex patterns through simple characters, embodying how profound wisdom often appears deceptively simple

const AnimatedAsciiMandala: React.FC<VisualProps> = ({ width: containerWidth, height: containerHeight }) => {
  const [frame, setFrame] = useState(0);
  const [asciiGrid, setAsciiGrid] = useState<string[][]>([]);
  const requestRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  
  // The path into light begins with simple forms
  const fontSize = 12;
  const charWidth = fontSize * 0.7; // Approximate character width
  const charHeight = fontSize * 1.2; // Approximate character height
  const width = Math.floor(containerWidth / charWidth);
  const height = Math.floor(containerHeight / charHeight);
  const density = '.·•○●'; // From emptiness to fullness
  
  // Initialize grid on component mount
  useEffect(() => {
    if (width <= 0 || height <= 0) {
      mountedRef.current = false;
      setAsciiGrid([]);
      return;
    }

    mountedRef.current = true;

    // Create empty grid
    const grid = Array(height).fill(null).map(() => Array(width).fill(' '));
    setAsciiGrid(grid);
    setFrame(0);
    
    // Animation loop
    const animate = () => {
      if (!mountedRef.current) return;
      setFrame(prevFrame => prevFrame + 1);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      mountedRef.current = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      requestRef.current = null;
    };
  }, [width, height]);
  
  // Update ASCII grid based on animation frame
  useEffect(() => {
    // Only update if component is still mounted
    if (!mountedRef.current) return;
    
    // Create a new empty grid
    const newGrid = Array(height).fill().map(() => Array(width).fill(' '));
    
    // Draw patterns
    drawMandala(newGrid, frame);
    
    if (mountedRef.current) {
      setAsciiGrid(newGrid);
    }
  }, [frame]);
  
  // What seems unsophisticated holds the greatest wisdom
  const drawMandala = (grid: string[][], frame: number) => {
    const centerX = Math.floor(width / 2);  // Finding the still point
    const centerY = Math.floor(height / 2);  // Where opposites meet
    
    // Draw central line
    for (let y = 1; y < height - 1; y++) {
      const lineOpacity = 0.3 + Math.sin(frame * 0.005 + y * 0.1) * 0.1;
      if (lineOpacity > 0.2) {
        grid[y][centerX] = '|';
      }
    }
    
    // Draw central circular pattern
    drawCirclePattern(grid, centerX, centerY, frame);
    
    // Draw radiating patterns
    const numPatterns = 6;
    for (let i = 0; i < numPatterns; i++) {
      const radius = 5 + i * 3;
      const points = 6 + i * 2;
      
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const breathingFactor = 0.2 * Math.sin(frame * 0.025 + i * 0.5 + j * 0.2);
        const x = Math.round(centerX + Math.cos(angle) * (radius + breathingFactor * radius));
        const y = Math.round(centerY + Math.sin(angle) * (radius + breathingFactor * radius));
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
          // Intensity based on animation frame
          const intensityPhase = (Math.sin(frame * 0.015 + i * 0.4 + j * 0.8) + 1) / 2;
          const char = getCharForIntensity(intensityPhase);
          grid[y][x] = char;
          
          // Mirror on the other side for symmetry
          const mirrorX = 2 * centerX - x;
          if (mirrorX >= 0 && mirrorX < width) {
            grid[y][mirrorX] = char;
          }
        }
        
        // Add secondary points
        if (i > 0 && j % 2 === 0) {
          const secondaryRadius = radius * 0.7;
          const x2 = Math.round(centerX + Math.cos(angle + 0.2) * secondaryRadius);
          const y2 = Math.round(centerY + Math.sin(angle + 0.2) * secondaryRadius);
          
          if (x2 >= 0 && x2 < width && y2 >= 0 && y2 < height) {
            const intensityPhase = (Math.sin(frame * 0.025 + i * 0.3 + j) + 1) / 2;
            const char = getCharForIntensity(intensityPhase * 0.8);
            grid[y2][x2] = char;
            
            // Mirror
            const mirrorX2 = 2 * centerX - x2;
            if (mirrorX2 >= 0 && mirrorX2 < width) {
              grid[y2][mirrorX2] = char;
            }
          }
        }
      }
    }
    
    // Add connection lines between points
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI;
      const radius = 10 + i % 5 * 3;
      const x = Math.round(centerX + Math.cos(angle) * radius);
      const y = Math.round(centerY + Math.sin(angle) * radius);
      
      if (x >= 0 && x < width && y >= 0 && y < height) {
        // Only draw if the cell is empty
        if (grid[y][x] === ' ') {
          const intensityPhase = (Math.sin(frame * 0.02 + i * 0.2) + 1) / 3;
          const char = getCharForIntensity(intensityPhase);
          if (char !== ' ') {
            grid[y][x] = char;
            
            // Mirror
            const mirrorX = 2 * centerX - x;
            if (mirrorX >= 0 && mirrorX < width && grid[y][mirrorX] === ' ') {
              grid[y][mirrorX] = char;
            }
          }
        }
      }
    }
  };
  
  // Draw central circular pattern
  const drawCirclePattern = (grid: string[][], centerX: number, centerY: number, frame: number) => {
    // Center point
    const centerIntensity = (Math.sin(frame * 0.025) + 1) / 2;
    grid[centerY][centerX] = getCharForIntensity(centerIntensity, true);
    
    // Draw circular patterns
    for (let r = 0; r < 3; r++) {
      const radius = 2 + r * 2;
      const points = 8 + r * 4;
      
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const breathingFactor = 0.2 * Math.sin(frame * 0.025 + r + i * 0.1);
        const x = Math.round(centerX + Math.cos(angle) * (radius + breathingFactor));
        const y = Math.round(centerY + Math.sin(angle) * (radius + breathingFactor));
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const intensityPhase = (Math.sin(frame * 0.02 + r * 0.3 + i * 0.2) + 1) / 2;
          grid[y][x] = getCharForIntensity(intensityPhase, true);
        }
      }
    }
  };
  
  // The perfect form has no shape, yet shapes arise from emptiness
  const getCharForIntensity = (intensity: number, isCenter = false) => {
    if (intensity < 0.1) return ' ';  // The void that contains all possibilities
    
    // For center elements, use more prominent characters
    if (isCenter) {
      // For center, map to higher density characters
      const index = Math.min(Math.floor(intensity * density.length), density.length - 1);
      return density[Math.max(index, 2)]; // Always use at least '•' for center
    } else {
      const index = Math.min(Math.floor(intensity * density.length), density.length - 1);
      return density[index];
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: `${containerWidth}px`,
      height: `${containerHeight}px`,
      backgroundColor: '#F0EEE6',
      overflow: 'hidden',
      borderRadius: '8px',
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
    }}>
      <pre style={{
        fontFamily: 'monospace',
        fontSize: `${fontSize}px`,
        lineHeight: '1.2em',
        letterSpacing: '0.1em',
        textAlign: 'center',
        color: '#333',
        margin: 0
      }}>
        {asciiGrid.map((row, i) => (
          <div key={i}>
            {row.map((char, j) => {
              // Calculate color based on character
              let opacity = 1.0;
              switch (char) {
                case '●': opacity = 0.95; break;
                case '○': opacity = 0.8; break;
                case '•': opacity = 0.7; break;
                case '·': opacity = 0.6; break;
                case '.': opacity = 0.5; break;
                case '|': opacity = 0.45; break;
                case ' ': opacity = 0; break;
              }
              
              return (
                <span 
                  key={j} 
                  style={{
                    color: `rgba(50, 50, 50, ${opacity})`,
                    display: 'inline-block',
                    width: '0.6em'  // Fixed width for better alignment
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>
        ))}
      </pre>
    </div>
  );
};

export default AnimatedAsciiMandala;
