import React, { useRef, useEffect, useState } from 'react';
import { VisualProps } from '../../types';

// Interactive Mandelbrot Set with click-to-zoom functionality

const FractalZoom: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomState, setZoomState] = useState({
    centerX: -0.5,
    centerY: 0,
    zoom: 1,
    maxIterations: 100
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = width;
    canvas.height = height;

    const mandelbrot = (cx: number, cy: number, maxIter: number) => {
      let x = 0, y = 0;
      let iteration = 0;
      
      while (x * x + y * y <= 4 && iteration < maxIter) {
        const xtemp = x * x - y * y + cx;
        y = 2 * x * y + cy;
        x = xtemp;
        iteration++;
      }
      
      return iteration;
    };

    const getColor = (iterations: number, maxIter: number) => {
      if (iterations === maxIter) {
        return 'rgb(0, 0, 0)';
      }
      
      const hue = (iterations / maxIter) * 360;
      const saturation = 100;
      const lightness = iterations < maxIter ? 50 : 0;
      
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    const renderFractal = () => {
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      
      const scale = 4 / zoomState.zoom;
      const offsetX = zoomState.centerX - scale / 2;
      const offsetY = zoomState.centerY - scale / 2;
      
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const x = offsetX + (px / width) * scale;
          const y = offsetY + (py / height) * scale;
          
          const iterations = mandelbrot(x, y, zoomState.maxIterations);
          const pixelIndex = (py * width + px) * 4;
          
          if (iterations === zoomState.maxIterations) {
            data[pixelIndex] = 0;     // R
            data[pixelIndex + 1] = 0; // G
            data[pixelIndex + 2] = 0; // B
          } else {
            const color = iterations / zoomState.maxIterations;
            const r = Math.floor(255 * Math.sin(color * Math.PI));
            const g = Math.floor(255 * Math.sin(color * Math.PI + 2));
            const b = Math.floor(255 * Math.sin(color * Math.PI + 4));
            
            data[pixelIndex] = r;
            data[pixelIndex + 1] = g;
            data[pixelIndex + 2] = b;
          }
          data[pixelIndex + 3] = 255; // A
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    };

    const handleClick = () => {
      // Zoom into a fixed, predetermined point regardless of click location
      const targetX = -0.74543;
      const targetY = 0.11301;

      setZoomState(prev => ({
        // Move the center towards the target and zoom in
        centerX: prev.centerX + (targetX - prev.centerX) * 0.25, // Move 25% closer to target
        centerY: prev.centerY + (targetY - prev.centerY) * 0.25,
        zoom: Math.min(prev.zoom * 1.5, 1e15), // Zoom in by 50%
        maxIterations: Math.min(prev.maxIterations + 8, 1000) // Increase detail
      }));
    };
    
    canvas.addEventListener('click', handleClick);
    renderFractal();

    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [width, height, zoomState]);

  return (
    <div style={{ 
      width: `${width}px`, 
      height: `${height}px`, 
      backgroundColor: '#F0EEE6',
      position: 'relative'
    }}>
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height}
        style={{ cursor: 'crosshair' }}
      />
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: 'rgba(60, 60, 60, 0.7)',
        fontSize: '12px',
        fontFamily: 'monospace',
        pointerEvents: 'none'
      }}>
        Zoom: {zoomState.zoom.toExponential(2)}<br/>
        Click to zoom in
      </div>
    </div>
  );
};

export default FractalZoom;
