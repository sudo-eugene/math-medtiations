import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: yielding to overcome, softness over hardness, finding the path of least resistance
// Visualization: Particles that flow like water around a central obstacle, demonstrating how yielding allows for progress

const WaterFlowingAroundObstacle: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    const centerX = width / 2;
    const centerY = height / 2;

    const PARTICLE_COUNT = 25000;
    const particles = [];

    // Create particles that flow like water
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2 - 1,
        speed: 0.2 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2
      });
    }

    let time = 0;

    function animate() {
      time += 0.016;

      // Clear with a soft fade
      ctx.fillStyle = 'rgba(240, 238, 230, 0.08)';
      ctx.fillRect(0, 0, width, height);

      // Define central obstacle
      const obstacleRadius = 80;

      particles.forEach(particle => {
        // Calculate distance from center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Calculate flow field
        const angle = Math.atan2(dy, dx);
        const flowX = Math.cos(angle + Math.PI/2);
        const flowY = Math.sin(angle + Math.PI/2);

        // Apply obstacle avoidance
        if (dist < obstacleRadius) {
          const pushFactor = (obstacleRadius - dist) / obstacleRadius;
          particle.x += dx / dist * pushFactor * 2;
          particle.y += dy / dist * pushFactor * 2;
        }

        // Move particle with flow
        particle.x += flowX * particle.speed * (1 - Math.min(1, dist / 300));
        particle.y += flowY * particle.speed * (1 - Math.min(1, dist / 300));

        // Add turbulence
        particle.x += Math.sin(time * 0.5 + particle.phase) * 0.2;
        particle.y += Math.cos(time * 0.5 + particle.phase) * 0.2;

        // Reset particles that go off-screen
        if (particle.x < -10 || particle.x > width + 10 || particle.y < -10 || particle.y > height + 10) {
          particle.x = Math.random() * width;
          particle.y = Math.random() * height;
        }

        // Draw particle with depth
        const depthFactor = 0.5 + particle.z * 0.5;
        const size = 0.3 + depthFactor * 0.3;
        const opacity = 0.3 + depthFactor * 0.2;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(51, 51, 51, ${opacity})`;
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height]);

  return (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      margin: 'auto',
      backgroundColor: '#F0EEE6',
      overflow: 'hidden'
    }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
        }}
      />
    </div>
  );
};

export default WaterFlowingAroundObstacle;