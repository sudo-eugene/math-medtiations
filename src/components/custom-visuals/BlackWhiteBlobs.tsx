import React, { useState, useEffect, useRef } from 'react';

// themes: connection to source, universal harmony, inexhaustible use
// visualization: Patterns emerge endlessly from source, finding harmony in constant transformation

const patterns = {
  // Pattern finding harmony in connection to source
  balance: (x, y, t) => {
    const cx = 30;
    const cy = 15;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    return Math.sin(dx * 0.3 + t * 0.5) * Math.cos(dy * 0.3 + t * 0.3) * 
           Math.sin(dist * 0.1 - t * 0.4);
  },
  
  duality: (x, y, t) => {
    const cx = 30;
    const left = x < cx ? Math.sin(x * 0.2 + t * 0.3) : 0;
    const right = x >= cx ? Math.cos(x * 0.2 - t * 0.3) : 0;
    
    return left + right + Math.sin(y * 0.3 + t * 0.2);
  },
  
  flow: (x, y, t) => {
    const angle = Math.atan2(y - 15, x - 30);
    const dist = Math.sqrt((x - 30) ** 2 + (y - 15) ** 2);
    
    return Math.sin(angle * 3 + t * 0.4) * Math.cos(dist * 0.1 - t * 0.3);
  },
  
  chaos: (x, y, t) => {
    const noise1 = Math.sin(x * 0.5 + t) * Math.cos(y * 0.3 - t);
    const noise2 = Math.sin(y * 0.4 + t * 0.5) * Math.cos(x * 0.2 + t * 0.7);
    const noise3 = Math.sin((x + y) * 0.2 + t * 0.8);
    
    return noise1 * 0.3 + noise2 * 0.3 + noise3 * 0.4;
  }
};

const BlackWhiteBlobs = () => {
  const [frame, setFrame] = useState(0);
  const [patternType, setPatternType] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mouseDown, setMouseDown] = useState(false);
  const containerRef = useRef(null);
  
  const patternTypes = ['balance', 'duality', 'flow', 'chaos'];
  const width = 60;
  const height = 35;
  const slowdownFactor = 12; // Quadrupled from original speed of 3
  
  // Background color as specified in requirements
  const BACKGROUND_COLOR = '#F0EEE6';
  
  useEffect(() => {
    let animationId;
    
    const animate = () => {
      setFrame(f => (f + 1) % (240 * slowdownFactor));
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [slowdownFactor]);
  
  // Generate inexhaustible variations from universal harmony
  const generateAsciiArt = () => {
    const t = (frame * Math.PI) / (60 * slowdownFactor);
    const currentPattern = patterns[patternTypes[patternType]];
    let result = '';
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let value = currentPattern(x, y, t);
        
        if (mouseDown && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const dx = x - (((mousePos.x - rect.left) / rect.width) * width);
          const dy = y - (((mousePos.y - rect.top) / rect.height) * height);
          const dist = Math.sqrt(dx * dx + dy * dy);
          const mouseInfluence = Math.exp(-dist * 0.1) * Math.sin(t * 2);
          value += mouseInfluence * 0.8;
        }
        
        if (value > 0.8) {
          result += '█';
        } else if (value > 0.5) {
          result += '▓';
        } else if (value > 0.2) {
          result += '▒';
        } else if (value > -0.2) {
          result += '░';
        } else if (value > -0.5) {
          result += '·';
        } else {
          result += ' ';
        }
      }
      result += '\n';
    }
    
    return result;
  };
  
  const handleClick = () => {
    setPatternType((prev) => (prev + 1) % patternTypes.length);
  };
  
  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseDown = () => {
    setMouseDown(true);
  };
  
  const handleMouseUp = () => {
    setMouseDown(false);
  };
  
  return (
    <div 
      style={{ 
        margin: 0,
        padding: 0,
        background: BACKGROUND_COLOR,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      ref={containerRef}
    >
      <pre style={{
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: '1',
        letterSpacing: '0.1em',
        color: '#333',
        userSelect: 'none',
        cursor: 'pointer',
        margin: 0,
        padding: 0
      }}>
        {generateAsciiArt()}
      </pre>
    </div>
  );
};

export default BlackWhiteBlobs;