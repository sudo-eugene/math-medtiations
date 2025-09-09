import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: source does nothing, natural development, peace through tranquility
// visualization: Waves emerge naturally from an unmoving center, finding peace in their flow

const WaveVariationSparse: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    // Radial arrangement with central focus (fewer sources for better performance)
    const sources = [];
    const numRings = 2; // Reduced from 3
    const sourcesPerRing = 6; // Reduced from 8
    
    // Unmoving source from which all emerges
    sources.push({
      x: width/2,
      y: height/2,
      wavelength: 25,
      phase: 0,
      amplitude: 1.5
    });
    
    // Radial sources
    for (let ring = 1; ring <= numRings; ring++) {
      const radius = ring * 120; // Increased spacing
      const numSources = sourcesPerRing;
      
      for (let i = 0; i < numSources; i++) {
        const angle = (i / numSources) * Math.PI * 2;
        sources.push({
          x: width/2 + Math.cos(angle) * radius,
          y: height/2 + Math.sin(angle) * radius,
          wavelength: 20 + ring * 5,
          phase: (i / numSources) * Math.PI,
          amplitude: 1.0 - ring * 0.2
        });
      }
    }

    let time = 0;
    let animationFrameId;
    
    // Precompute constants
    const TWO_PI = Math.PI * 2;
    const INV_300 = 1 / 300;
    
    // Throttle calculation to skip frames for better performance
    let frameCount = 0;
    const skipFrames = 1; // Render every other frame

    const animate = () => {
      frameCount++;
      
      if (frameCount % (skipFrames + 1) !== 0) {
        time += 0.0015; // Reduced from 0.0025 for slower animation
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      
      // Fill with project background color
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      // Lower resolution field for better performance
      const resolution = 3; // Increased from 1
      const rows = Math.floor(height / resolution);
      const cols = Math.floor(width / resolution);
      const field = new Array(rows).fill(0).map(() => new Array(cols).fill(0));

      // Let patterns develop naturally, finding their peace
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const x = j * resolution;
          const y = i * resolution;
          let amplitude = 0;

          sources.forEach(source => {
            const dx = x - source.x;
            const dy = y - source.y;
            const dist2 = dx * dx + dy * dy;
            const distance = Math.sqrt(dist2);
            
            // Skip if too far from source
            if (distance > 400) return;
            
            // Apply amplitude falloff (optimized)
            const falloff = Math.exp(-distance * INV_300);
            amplitude += source.amplitude * falloff * 
              Math.sin((distance / source.wavelength - time) * TWO_PI + source.phase);
          });

          field[i][j] = amplitude;
        }
      }

      // Simplified line rendering
      ctx.strokeStyle = '#333';
      
      // Fewer contour levels
      const contourLevels = [-0.8, -0.4, 0, 0.4, 0.8];
      
      contourLevels.forEach((level, index) => {
        // Vary line width based on contour level
        ctx.lineWidth = index % 2 === 0 ? 0.8 : 0.5;
        ctx.beginPath();
        
        for (let i = 0; i < rows - 1; i++) {
          for (let j = 0; j < cols - 1; j++) {
            const x = j * resolution;
            const y = i * resolution;
            
            // Optimized marching squares
            const v00 = field[i][j];
            const v10 = field[i][j + 1];
            const v11 = field[i + 1][j + 1];
            const v01 = field[i + 1][j];
            
            // Early exit optimization
            const allAbove = v00 > level && v10 > level && v11 > level && v01 > level;
            const allBelow = v00 <= level && v10 <= level && v11 <= level && v01 <= level;
            if (allAbove || allBelow) continue;
            
            const case4 = 
              (v00 > level ? 8 : 0) +
              (v10 > level ? 4 : 0) +
              (v11 > level ? 2 : 0) +
              (v01 > level ? 1 : 0);
            
            // Simplified linear interpolation
            const lerp = (a, b, t) => a + t * (b - a);
            const safeDiv = (a, b) => b === 0 ? 0 : a / b;
            
            switch (case4) {
              case 1: case 14: {
                const t1 = safeDiv(level - v00, v01 - v00);
                const t2 = safeDiv(level - v01, v11 - v01);
                ctx.moveTo(x, lerp(y, y + resolution, t1));
                ctx.lineTo(lerp(x, x + resolution, t2), y + resolution);
                break;
              }
              case 2: case 13: {
                const t1 = safeDiv(level - v01, v11 - v01);
                const t2 = safeDiv(level - v11, v10 - v11);
                ctx.moveTo(lerp(x, x + resolution, t1), y + resolution);
                ctx.lineTo(x + resolution, lerp(y + resolution, y, t2));
                break;
              }
              case 3: case 12: {
                const t1 = safeDiv(level - v00, v01 - v00);
                const t2 = safeDiv(level - v10, v11 - v10);
                ctx.moveTo(x, lerp(y, y + resolution, t1));
                ctx.lineTo(x + resolution, lerp(y, y + resolution, t2));
                break;
              }
              case 4: case 11: {
                const t1 = safeDiv(level - v10, v11 - v10);
                const t2 = safeDiv(level - v10, v00 - v10);
                ctx.moveTo(x + resolution, lerp(y, y + resolution, t1));
                ctx.lineTo(lerp(x + resolution, x, t2), y);
                break;
              }
              case 5: case 10: {
                // Two lines for saddle points
                const t1 = safeDiv(level - v00, v01 - v00);
                const t2 = safeDiv(level - v00, v10 - v00);
                ctx.moveTo(x, lerp(y, y + resolution, t1));
                ctx.lineTo(lerp(x, x + resolution, t2), y);
                
                const t3 = safeDiv(level - v11, v10 - v11);
                const t4 = safeDiv(level - v11, v01 - v11);
                ctx.moveTo(x + resolution, lerp(y + resolution, y, t3));
                ctx.lineTo(lerp(x + resolution, x, t4), y + resolution);
                break;
              }
              case 6: case 9: {
                const t1 = safeDiv(level - v10, v00 - v10);
                const t2 = safeDiv(level - v11, v01 - v11);
                ctx.moveTo(lerp(x + resolution, x, t1), y);
                ctx.lineTo(lerp(x + resolution, x, t2), y + resolution);
                break;
              }
              case 7: case 8: {
                const t1 = safeDiv(level - v00, v01 - v00);
                const t2 = safeDiv(level - v00, v10 - v00);
                ctx.moveTo(x, lerp(y, y + resolution, t1));
                ctx.lineTo(lerp(x, x + resolution, t2), y);
                break;
              }
            }
          }
        }
        
        ctx.stroke();
      });

      time += 0.0015; // Reduced from 0.0025 for slower animation
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [width, height]);

  return (
    <div style={{ 
      margin: 0,
      background: '#F0EEE6',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: `${height}px`,
      width: `${width}px`
    }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default WaveVariationSparse;