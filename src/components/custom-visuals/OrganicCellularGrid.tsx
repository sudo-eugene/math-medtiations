import { useEffect, useRef } from 'react';

// Themes: true courage, nature's wisdom, universal net
// Visualization: A grid that moves with careful balance, showing how strength emerges through wise restraint

const OrganicCellularGrid = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 550;
    canvas.height = 550;
    
    // Time flows with nature's rhythm
    let time = 0;
    const cellSize = 50;  // Each cell knows its bounds
    const cellsX = Math.ceil(canvas.width / cellSize) + 2;   // The net extends
    const cellsY = Math.ceil(canvas.height / cellSize) + 2;  // in all directions
    
    function drawCell(x, y, seed) {
      // Movement with careful restraint
      const noise1 = Math.sin(seed * 1.3 + time * 0.25) * 0.2;  // Gentle pulse
      const noise2 = Math.cos(seed * 0.7 + time * 0.15) * 0.2;  // Steady breath
      
      const width = cellSize + noise1 * cellSize * 0.4;
      const height = cellSize + noise2 * cellSize * 0.4;
      
      // Create organic distortion for rectangle
      const corner1 = {
        x: x + Math.sin(seed + time) * cellSize * 0.2,
        y: y + Math.cos(seed + time) * cellSize * 0.2
      };
      
      const corner2 = {
        x: x + width + Math.sin(seed + 1 + time) * cellSize * 0.2,
        y: y + Math.cos(seed + 1 + time) * cellSize * 0.2
      };
      
      const corner3 = {
        x: x + width + Math.sin(seed + 2 + time) * cellSize * 0.2,
        y: y + height + Math.cos(seed + 2 + time) * cellSize * 0.2
      };
      
      const corner4 = {
        x: x + Math.sin(seed + 3 + time) * cellSize * 0.2,
        y: y + height + Math.cos(seed + 3 + time) * cellSize * 0.2
      };
      
      // Create path with rounded corners
      const roundness = Math.sin(seed + time * 0.5) * cellSize * 0.15 + cellSize * 0.3;
      
      ctx.beginPath();
      
      // Top-left to top-right
      ctx.moveTo(corner1.x + roundness, corner1.y);
      ctx.lineTo(corner2.x - roundness, corner2.y);
      ctx.quadraticCurveTo(corner2.x, corner2.y, corner2.x, corner2.y + roundness);
      
      // Top-right to bottom-right
      ctx.lineTo(corner3.x, corner3.y - roundness);
      ctx.quadraticCurveTo(corner3.x, corner3.y, corner3.x - roundness, corner3.y);
      
      // Bottom-right to bottom-left
      ctx.lineTo(corner4.x + roundness, corner4.y);
      ctx.quadraticCurveTo(corner4.x, corner4.y, corner4.x, corner4.y - roundness);
      
      // Bottom-left to top-left
      ctx.lineTo(corner1.x, corner1.y + roundness);
      ctx.quadraticCurveTo(corner1.x, corner1.y, corner1.x + roundness, corner1.y);
      
      ctx.closePath();
      
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    
    let animationFrameId;
    
    function animate() {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      time += 0.0025; // Halved speed for even more subtle movement
      
      // Create grid with overlapping cells
      for (let i = -1; i < cellsX - 1; i++) {
        for (let j = -1; j < cellsY - 1; j++) {
          const baseX = i * cellSize - cellSize / 2;
          const baseY = j * cellSize - cellSize / 2;
          
          // Add slight offset based on position and time
          const offsetX = Math.sin(i * 0.5 + time * 0.5) * cellSize * 0.2;  // Halved speed
          const offsetY = Math.cos(j * 0.5 + time * 0.5) * cellSize * 0.2;  // Halved speed
          
          drawCell(baseX + offsetX, baseY + offsetY, i + j * cellsX + time);
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
      
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, []);
  
  return (
    <div className="flex items-center justify-center w-full h-full" style={{ backgroundColor: '#F0EEE6' }}>
      <canvas ref={canvasRef} width={550} height={550} className="shadow-lg" />
    </div>
  );
};

export default OrganicCellularGrid;