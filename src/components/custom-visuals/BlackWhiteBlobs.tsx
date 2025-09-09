import React, { useState, useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: connection to source, universal harmony, inexhaustible use
// visualization: Patterns emerge endlessly from source, finding harmony in constant transformation

const patterns = {
  // Pattern finding harmony in connection to source
  balance: (x, y, t, cx, cy) => {

    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    return Math.sin(dx * 0.3 + t * 0.5) * Math.cos(dy * 0.3 + t * 0.3) * 
           Math.sin(dist * 0.1 - t * 0.4);
  },
  
  duality: (x, y, t, cx, cy) => {
    const left = x < cx ? Math.sin(x * 0.2 + t * 0.3) : 0;
    const right = x >= cx ? Math.cos(x * 0.2 - t * 0.3) : 0;
    
    return left + right + Math.sin(y * 0.3 + t * 0.2);
  },
  
  flow: (x, y, t, cx, cy) => {
    const angle = Math.atan2(y - cy, x - cx);
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    
    return Math.sin(angle * 3 + t * 0.4) * Math.cos(dist * 0.1 - t * 0.3);
  },
  
  chaos: (x, y, t) => {
    const noise1 = Math.sin(x * 0.5 + t) * Math.cos(y * 0.3 - t);
    const noise2 = Math.sin(y * 0.4 + t * 0.5) * Math.cos(x * 0.2 + t * 0.7);
    const noise3 = Math.sin((x + y) * 0.2 + t * 0.8);
    
    return noise1 * 0.3 + noise2 * 0.3 + noise3 * 0.4;
  }
};

const BlackWhiteBlobs: React.FC<VisualProps> = ({ width: containerWidth, height: containerHeight }) => {
  const [frame, setFrame] = useState(0);
  const [patternType, setPatternType] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mouseDown, setMouseDown] = useState(false);
  const containerRef = useRef(null);
  
  const patternTypes = ['balance', 'duality', 'flow', 'chaos'];
  const fontSize = 12;
  const charWidth = fontSize * 0.7;
  const charHeight = fontSize * 1.2;
  const width = Math.floor(containerWidth / charWidth);
  const height = Math.floor(containerHeight / charHeight);
  const slowdownFactor = 12; // Quadrupled from original speed of 3
  
  // Background color as specified in requirements
  const BACKGROUND_COLOR = '#F0EEE6';
  
  useEffect(() => {
    if (!containerWidth || !containerHeight) return;
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
    if (!width || !height) return '';
    const t = (frame * Math.PI) / (60 * slowdownFactor);
    const centerX = width / 2;
    const centerY = height / 2;
    const currentPattern = patterns[patternTypes[patternType]];
    let result = '';
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let value = currentPattern(x, y, t, centerX, centerY);
        
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
        width: `${containerWidth}px`,
        height: `${containerHeight}px`
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