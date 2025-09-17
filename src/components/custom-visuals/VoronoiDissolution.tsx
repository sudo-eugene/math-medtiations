// Themes: cellular consciousness, organic boundaries, dissolution and reform
// Visualisation: Voronoi cells breathe, dissolve into particles, then reform into new patterns
// Unique mechanism: Voronoi diagram generation with Lloyd relaxation and state-based dissolution

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const VoronoiDissolution: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const rafRef = useRef<number|undefined>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, width, height);

    // PRNG for deterministic behavior
    let seed = 47832;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // Voronoi state
    interface Site {
      x: number;
      y: number;
      vx: number;
      vy: number;
      dissolutionState: number; // 0=solid, 1=dissolving
      particles: Array<{x: number, y: number, vx: number, vy: number}>;
    }

    const sites: Site[] = [];
    const numSites = 12;

    // Initialize sites
    for (let i = 0; i < numSites; i++) {
      sites.push({
        x: random() * width,
        y: random() * height,
        vx: (random() - 0.5) * 0.2,
        vy: (random() - 0.5) * 0.2,
        dissolutionState: 0,
        particles: []
      });
    }

    // Voronoi cell calculation
    const getClosestSite = (x: number, y: number) => {
      let closestSite = 0;
      let minDist = Infinity;
      for (let i = 0; i < sites.length; i++) {
        const dx = x - sites[i].x;
        const dy = y - sites[i].y;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
          minDist = dist;
          closestSite = i;
        }
      }
      return closestSite;
    };

    // Lloyd relaxation step
    const relaxSites = () => {
      const centroids = sites.map(() => ({ x: 0, y: 0, count: 0 }));
      
      for (let x = 0; x < width; x += 4) {
        for (let y = 0; y < height; y += 4) {
          const siteIndex = getClosestSite(x, y);
          centroids[siteIndex].x += x;
          centroids[siteIndex].y += y;
          centroids[siteIndex].count++;
        }
      }
      
      sites.forEach((site, i) => {
        if (centroids[i].count > 0 && site.dissolutionState < 0.5) {
          const targetX = centroids[i].x / centroids[i].count;
          const targetY = centroids[i].y / centroids[i].count;
          site.x += (targetX - site.x) * 0.01;
          site.y += (targetY - site.y) * 0.01;
        }
      });
    };

    const render = (t: number) => {
      // Trails with translucent clear
      ctx.fillStyle = 'rgba(240,238,230,0.08)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      // Update dissolution states
      sites.forEach((site, i) => {
        const breathe = Math.sin(time * 0.3 + i * 0.5) * 0.5 + 0.5;
        if (breathe > 0.7 && site.dissolutionState === 0) {
          site.dissolutionState = 0.01;
        }
        
        if (site.dissolutionState > 0) {
          site.dissolutionState = Math.min(1, site.dissolutionState + 0.015);
          
          // Create particles during dissolution
          if (site.dissolutionState < 0.8 && random() < 0.3) {
            site.particles.push({
              x: site.x + (random() - 0.5) * 60,
              y: site.y + (random() - 0.5) * 60,
              vx: (random() - 0.5) * 2,
              vy: (random() - 0.5) * 2
            });
          }
        }
        
        // Reform when fully dissolved
        if (site.dissolutionState >= 1) {
          site.dissolutionState = 0;
          site.particles = [];
          site.x = random() * width;
          site.y = random() * height;
        }
      });

      // Move sites slightly for organic motion
      sites.forEach(site => {
        if (site.dissolutionState < 0.3) {
          site.x += site.vx;
          site.y += site.vy;
          if (site.x < 0 || site.x > width) site.vx *= -1;
          if (site.y < 0 || site.y > height) site.vy *= -1;
        }
      });

      // Lloyd relaxation for better distribution
      if (Math.floor(time * 10) % 5 === 0) {
        relaxSites();
      }

      // Draw Voronoi cells
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      for (let x = 0; x < width; x += 2) {
        for (let y = 0; y < height; y += 2) {
          const siteIndex = getClosestSite(x, y);
          const site = sites[siteIndex];
          
          if (site.dissolutionState < 0.6) {
            const dx = x - site.x;
            const dy = y - site.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Cell boundaries
            let isEdge = false;
            for (let i = 0; i < sites.length; i++) {
              if (i === siteIndex) continue;
              const dx2 = x - sites[i].x;
              const dy2 = y - sites[i].y;
              const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
              if (Math.abs(dist - dist2) < 3) {
                isEdge = true;
                break;
              }
            }
            
            if (isEdge && site.dissolutionState < 0.4) {
              const alpha = (1 - site.dissolutionState) * 0.4;
              const pixelIndex = (y * width + x) * 4;
              data[pixelIndex] = 80;     // R
              data[pixelIndex + 1] = 80; // G
              data[pixelIndex + 2] = 80; // B
              data[pixelIndex + 3] = alpha * 255; // A
            }
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // Draw dissolving particles
      sites.forEach(site => {
        if (site.particles.length > 0) {
          ctx.fillStyle = 'rgba(70,70,70,0.6)';
          site.particles.forEach((particle, i) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
          });
          
          // Remove old particles
          site.particles = site.particles.filter((_, i) => i < 50);
        }
      });

      // Draw site centers
      sites.forEach(site => {
        if (site.dissolutionState < 0.8) {
          const alpha = Math.max(0, 1 - site.dissolutionState * 2);
          ctx.fillStyle = `rgba(60,60,60,${alpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(site.x, site.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, width, height);
    };
  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, background: '#F0EEE6', overflow: 'hidden' }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

// Differs from others by: Uses Voronoi diagram generation with Lloyd relaxation and state-based cellular dissolution - no other visual implements computational geometry cell boundaries

const metadata = {
  themes: "cellular consciousness, organic boundaries, dissolution and reform",
  visualisation: "Voronoi cells breathe, dissolve into particles, then reform into new patterns",
  promptSuggestion: "1. Adjust dissolution breathing rhythm\n2. Vary cell boundary thickness\n3. Control particle scatter patterns"
};
(VoronoiDissolution as any).metadata = metadata;

export default VoronoiDissolution;
