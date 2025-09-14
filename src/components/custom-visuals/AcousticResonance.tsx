import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: harmonic resonance, vibrational frequencies, sound geometry manifesting
// visualization: Sound waves creating geometric patterns through harmonic ratios and standing waves

const AcousticResonance: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    let time = 0;

    // Harmonic frequencies and their geometric representations
    const harmonics = [
      { freq: 1, amplitude: 1, phase: 0, color: [60, 60, 80] },      // Fundamental
      { freq: 2, amplitude: 0.5, phase: 0, color: [80, 60, 60] },   // Octave
      { freq: 3/2, amplitude: 0.7, phase: 0, color: [60, 80, 60] }, // Perfect fifth
      { freq: 4/3, amplitude: 0.6, phase: 0, color: [80, 80, 60] }, // Perfect fourth
      { freq: 5/4, amplitude: 0.4, phase: 0, color: [80, 60, 80] }, // Major third
      { freq: 6/5, amplitude: 0.3, phase: 0, color: [60, 80, 80] }, // Minor third
    ];

    // Standing wave nodes
    const nodes = [];
    for (let i = 0; i < 200; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseY: Math.random() * height,
        resonance: Math.random() * 0.5 + 0.5,
        harmonicResponse: harmonics.map(() => Math.random())
      });
    }

    let animationId = null;

    // Calculate wave amplitude at position based on all harmonics
    const getWaveAmplitude = (x, y, t) => {
      let totalAmplitude = 0;
      
      harmonics.forEach((harmonic, i) => {
        // Create standing wave patterns
        const wavelength = width / (harmonic.freq * 2);
        const kx = (2 * Math.PI) / wavelength;
        const spatialComponent = Math.sin(kx * x);
        const temporalComponent = Math.sin(harmonic.freq * t * 0.1 + harmonic.phase);
        
        totalAmplitude += harmonic.amplitude * spatialComponent * temporalComponent;
        
        // Add circular wave components for 2D interference
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const radialWavelength = 50 / harmonic.freq;
        const radialComponent = Math.sin((distance / radialWavelength) - harmonic.freq * t * 0.15);
        
        totalAmplitude += harmonic.amplitude * 0.3 * radialComponent;
      });
      
      return totalAmplitude;
    };

    // Draw Chladni plate patterns (sand patterns on vibrating plates)
    const drawChladniPatterns = () => {
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const amplitude = getWaveAmplitude(x, y, time);
          
          // Areas of low amplitude (nodes) collect "sand"
          const nodeStrength = Math.abs(amplitude);
          let intensity = 240;
          
          if (nodeStrength < 0.2) {
            intensity = 120 - nodeStrength * 200; // Dark areas where sand collects
          }
          
          const index = (y * width + x) * 4;
          if (index < data.length - 3) {
            data[index] = intensity;
            data[index + 1] = intensity;
            data[index + 2] = intensity;
            data[index + 3] = 255;
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    };

    // Draw harmonic frequency visualization
    const drawHarmonicSpectrum = () => {
      const spectrumY = height * 0.85;
      const barWidth = width / harmonics.length / 2;
      
      harmonics.forEach((harmonic, i) => {
        const x = (i + 0.5) * barWidth * 2;
        const intensity = Math.abs(Math.sin(harmonic.freq * time * 0.1 + harmonic.phase));
        const barHeight = intensity * harmonic.amplitude * 40;
        
        const [r, g, b] = harmonic.color;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + intensity * 0.4})`;
        ctx.fillRect(x - barWidth/2, spectrumY - barHeight, barWidth, barHeight);
        
        // Frequency label
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
        ctx.font = '10px serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${harmonic.freq.toFixed(2)}`, x, spectrumY + 15);
      });
    };

    // Draw resonance patterns around nodes
    const drawResonanceNodes = () => {
      nodes.forEach((node, i) => {
        const waveAmplitude = getWaveAmplitude(node.x, node.y, time);
        
        // Node displacement based on wave amplitude
        node.y = node.baseY + waveAmplitude * 20 * node.resonance;
        
        // Draw resonating particle
        const size = 2 + Math.abs(waveAmplitude) * 3;
        const alpha = 0.2 + Math.abs(waveAmplitude) * 0.6;
        
        ctx.fillStyle = `rgba(70, 70, 70, ${alpha})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Harmonic response trails
        if (Math.abs(waveAmplitude) > 0.3) {
          harmonics.forEach((harmonic, hi) => {
            const response = node.harmonicResponse[hi] * waveAmplitude;
            if (Math.abs(response) > 0.2) {
              const [r, g, b] = harmonic.color;
              ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${Math.abs(response) * 0.5})`;
              ctx.lineWidth = 1;
              
              ctx.beginPath();
              const trailLength = 20;
              for (let t = 0; t < trailLength; t++) {
                const trailTime = time - t * 2;
                const trailAmplitude = getWaveAmplitude(node.x, node.y, trailTime);
                const trailY = node.baseY + trailAmplitude * 20 * node.resonance;
                
                if (t === 0) ctx.moveTo(node.x, trailY);
                else ctx.lineTo(node.x, trailY);
              }
              ctx.stroke();
            }
          });
        }
      });
    };

    // Draw wave interference patterns
    const drawWaveInterference = () => {
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.2)';
      ctx.lineWidth = 1;
      
      // Draw wave fronts for each harmonic
      harmonics.forEach((harmonic, i) => {
        const numWaveFronts = 8;
        
        for (let w = 0; w < numWaveFronts; w++) {
          const waveRadius = (w * 30 + time * harmonic.freq * 2) % (width * 0.7);
          const alpha = 1 - (waveRadius / (width * 0.7));
          
          if (alpha > 0) {
            const [r, g, b] = harmonic.color;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      });
    };

    // Draw cymatics patterns (geometric patterns formed by sound)
    const drawCymaticsPatterns = () => {
      const numPatterns = 3;
      
      for (let p = 0; p < numPatterns; p++) {
        const patternRadius = 60 + p * 40;
        const harmonic = harmonics[p % harmonics.length];
        const sides = Math.floor(harmonic.freq * 6);
        
        ctx.strokeStyle = `rgba(${harmonic.color[0]}, ${harmonic.color[1]}, ${harmonic.color[2]}, 0.3)`;
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
          const angle = (i / sides) * Math.PI * 2;
          const waveModulation = Math.sin(harmonic.freq * time * 0.1 + angle * harmonic.freq);
          const radius = patternRadius * (1 + waveModulation * 0.2);
          
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }
    };

    const animate = () => {
      // Background
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      time += 1;
      
      // Draw Chladni sand patterns
      drawChladniPatterns();
      
      // Draw wave interference
      drawWaveInterference();
      
      // Draw cymatics geometric patterns
      drawCymaticsPatterns();
      
      // Draw resonating nodes
      drawResonanceNodes();
      
      // Draw harmonic spectrum
      drawHarmonicSpectrum();
      
      // Draw frequency annotations
      ctx.fillStyle = 'rgba(60, 60, 60, 0.4)';
      ctx.font = '12px serif';
      ctx.textAlign = 'center';
      ctx.fillText('Harmonic Resonance Patterns', centerX, 25);

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [width, height]);

  return (
    <div style={{ 
      width: `${width}px`, 
      height: `${height}px`, 
      backgroundColor: '#F0EEE6' 
    }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default AcousticResonance;
