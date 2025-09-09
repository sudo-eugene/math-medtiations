import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: creation from unity, harmony of opposites, cyclical emergence
// Visualization: ASCII patterns emerging from simple elements combining and recombining

const metadata = {
  themes: "creation from unity, harmony of opposites, cyclical emergence",
  visualization: "ASCII patterns emerging from simple elements combining and recombining",
  promptSuggestion: "1. Adjust wave frequency\n2. Change pattern density\n3. Try different slash characters\n4. Modify interference angles\n5. Add phase variations"
}

// The One manifests through these three forms
const CHARS = '/\\|'


const AsciiDiagonalPetals: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let time = 0
    let animationFrameId: number | null = null

    // Calculate grid dimensions based on canvas
    const cellSize = 15;
    const GRID_SIZE = Math.floor(Math.min(width, height) / cellSize);
    const charWidth = cellSize * 0.7;
    const charHeight = cellSize;

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Fill background
      ctx.fillStyle = '#F0EEE6'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Set text style
      ctx.font = `${cellSize}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#333333'
      
      // Draw grid
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          // Two forces in harmony create movement
          const wave1 = Math.sin((x + y) / 4 + time)
          const wave2 = Math.cos((x - y) / 4 - time * 0.7)
          
          // The boundary between being and non-being
          const boundaryX = Math.abs(x - GRID_SIZE/2) / (GRID_SIZE/2)
          const boundaryY = Math.abs(y - GRID_SIZE/2) / (GRID_SIZE/2)
          const boundary = Math.max(boundaryX, boundaryY)  // Where form meets formlessness
          
          if (boundary < 0.85) {
            // Combine waves with different weights
            const combined = wave1 * 0.6 + wave2 * 0.4
            
            // Add boundary fade
            const fade = 1 - (boundary / 0.85)
            const value = combined * fade
            
            // From Three, the ten thousand things arise
            let char = ' '
            if (value > 0.3) char = CHARS[0]      // Yang rises
            else if (value < -0.3) char = CHARS[1]     // Yin descends
            else if (Math.abs(value) < 0.1) char = CHARS[2] // Balance point
            
            if (char !== ' ') {
              const xPos = (canvas.width / 2) + (x - GRID_SIZE/2) * charWidth
              const yPos = (canvas.height / 2) + (y - GRID_SIZE/2) * charHeight
              ctx.fillText(char, xPos, yPos)
            }
          }
        }
      }
      
      time += 0.0075
      animationFrameId = requestAnimationFrame(animate)
    }

    // Start animation
    animationFrameId = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      
      // Clear canvas context
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [width, height])

  return (
    <div style={{ 
      margin: 0,
      background: '#F0EEE6',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: `${width}px`,
      height: `${height}px`
    }}>
      <canvas 
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain'
        }}
      />
    </div>
  )
}

AsciiDiagonalPetals.metadata = metadata
export default AsciiDiagonalPetals
