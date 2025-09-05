import { useState, useEffect, useRef } from 'react';

// Themes: freedom from control, trust in people, natural prosperity
// Visualization: ASCII patterns that emerge from stillness, showing how clarity arises when interference falls away

const AsciiClarityFromStillness = () => {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 275, y: 275 });
  const [asciiArt, setAsciiArt] = useState([]);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    // Animation control variables
    let animationFrameId = null;
    let lastFrameTime = 0;
    const targetFPS = 60; // Equivalent to 16ms interval
    const frameInterval = 1000 / targetFPS;

    // Add gentle autonomous movement using requestAnimationFrame
    const animate = (currentTime) => {
      animationFrameId = requestAnimationFrame(animate);
      
      const deltaTime = currentTime - lastFrameTime;
      
      // Only update if enough time has passed
      if (deltaTime >= frameInterval) {
        // Calculate remainder to prevent drift
        const remainder = deltaTime % frameInterval;
        
        // Update lastFrameTime with the time that's been processed
        lastFrameTime = currentTime - remainder;
        
        setTime(t => t + 0.008);  // Halved speed
      }
    };
    
    // Start animation
    animationFrameId = requestAnimationFrame(animate);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  useEffect(() => {
    // Generate dynamic ASCII art based on mouse position
    const width = 50;
    const height = 35;
    const art = [];
    const centerX = width / 2;
    const centerY = height / 2;

    // Characters used for visualization
    const chars = [' ', '·', '+', '*', '※', '◊', '○', '●'];
    
    for (let y = 0; y < height; y++) {
      let line = '';
      for (let x = 0; x < width; x++) {
        // Calculate distance from mouse (centered in canvas)
        const mouseX = (mousePos.x / 550) * width;
        const mouseY = (mousePos.y / 550) * height;
        
        // Add gentle autonomous movement
        const autoX = mouseX + Math.sin(time * 0.25) * 2;  // Halved speed
        const autoY = mouseY + Math.cos(time * 0.15) * 2;  // Halved speed
        
        const mouseDist = Math.sqrt(
          Math.pow(x - autoX, 2) + Math.pow(y - autoY, 2)
        );

        // Calculate distance from center
        const centerDist = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );

        // Create concentric patterns that respond to mouse
        const angle = Math.atan2(y - centerY, x - centerX) + Math.PI;
        const pulse = Math.sin(centerDist * 0.5 - Date.now() * 0.001) * 0.5 + 0.5;  // Halved speed
        
        // Blend between stillness at center and movement near mouse
        const clarity = Math.sin(angle + centerDist * 0.2 + mouseDist * 0.1);
        
        // Select character based on intensity
        let intensity = 0;
        
        if (centerDist < 3) {
          // Center remains still - the point of clarity
          intensity = 7;
        } else if (centerDist < 8) {
          // Inner circle - stable awareness
          intensity = Math.floor(pulse * 2) + 4;
        } else {
          // Outer area - responsive to movement
          intensity = Math.floor((clarity * 0.5 + 0.5) * 3);
          if (mouseDist < 10) {
            intensity += 2;
          }
        }

        // Create radial patterns
        if (Math.abs(Math.floor(centerDist) % 5) < 1) {
          intensity = Math.min(intensity + 2, 7);
        }

        line += chars[Math.max(0, Math.min(intensity, chars.length - 1))];
      }
      art.push(line);
    }

    setAsciiArt(art);
  }, [mousePos, time]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '550px',
        height: '550px',
        backgroundColor: '#F0EEE6',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: '12px',
        color: '#333333',
        cursor: 'none',
        overflow: 'hidden'
      }}
    >
      <pre style={{ margin: 0 }}>
        {asciiArt.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </pre>
    </div>
  );
};

export default AsciiClarityFromStillness;