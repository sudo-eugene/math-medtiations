import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: crystalline structures that ring with visible sound waves, harmony made visible
// visualization: Crystalline structures that ring with visible sound waves, harmony made visible

const CrystalSong: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = width;
    canvas.height = height;
    
    let time = 0;
    let animationId;
    let crystals = [];
    let soundWaves = [];
    
    class SingingCrystal {
      constructor(x, y, frequency, size) {
        this.x = x;
        this.y = y;
        this.frequency = frequency; // Musical frequency
        this.size = size;
        this.phase = Math.random() * Math.PI * 2;
        this.resonance = 0;
        this.targetResonance = 0;
        this.facets = 6 + Math.floor(Math.random() * 6);
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = this.frequency * 0.0001;
        this.opacity = 0.4 + Math.random() * 0.4;
        this.harmonics = this.generateHarmonics();
        this.lastSing = 0;
        this.singInterval = 2000 + Math.random() * 3000;
      }
      
      generateHarmonics() {
        const harmonics = [];
        const baseFreq = this.frequency;
        
        // Generate harmonic series
        for (let i = 1; i <= 5; i++) {
          harmonics.push({
            frequency: baseFreq * i,
            amplitude: 1 / i,
            phase: Math.random() * Math.PI * 2
          });
        }
        return harmonics;
      }
      
      update(time) {
        this.phase += this.frequency * 0.001;
        this.rotation += this.rotationSpeed;
        
        // Resonance decay
        this.targetResonance *= 0.995;
        this.resonance += (this.targetResonance - this.resonance) * 0.1;
        
        // Periodic singing
        if (time - this.lastSing > this.singInterval) {
          this.sing(time);
          this.lastSing = time;
          this.singInterval = 2000 + Math.random() * 3000;
        }
        
        // Update harmonics
        this.harmonics.forEach(harmonic => {
          harmonic.phase += harmonic.frequency * 0.0005;
        });
      }
      
      sing(time) {
        this.targetResonance = 1;
        
        // Create sound waves for each harmonic
        this.harmonics.forEach((harmonic, index) => {
          const wave = new SoundWave(
            this.x, this.y, 
            harmonic.frequency, 
            harmonic.amplitude * 0.8,
            index * 0.1 // Delay for harmonic complexity
          );
          soundWaves.push(wave);
        });
      }
      
      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const currentSize = this.size * (1 + this.resonance * 0.2);
        const alpha = this.opacity * (0.7 + this.resonance * 0.3);
        
        // Draw crystal facets
        ctx.strokeStyle = `rgba(60, 60, 60, ${alpha})`;
        ctx.lineWidth = 1 + this.resonance;
        
        for (let f = 0; f < this.facets; f++) {
          const angle1 = (f / this.facets) * Math.PI * 2;
          const angle2 = ((f + 1) / this.facets) * Math.PI * 2;
          
          const x1 = Math.cos(angle1) * currentSize;
          const y1 = Math.sin(angle1) * currentSize;
          const x2 = Math.cos(angle2) * currentSize;
          const y2 = Math.sin(angle2) * currentSize;
          
          // Facet edge
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          
          // Inner facet line (showing 3D structure)
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
        
        // Draw harmonic visualization inside crystal
        if (this.resonance > 0.3) {
          this.harmonics.forEach((harmonic, index) => {
            const harmonicAlpha = alpha * harmonic.amplitude * this.resonance * 0.5;
            const harmonicSize = currentSize * 0.3 * (1 + index * 0.1);
            
            ctx.strokeStyle = `rgba(${70 + index * 10}, ${70 + index * 10}, ${70 + index * 10}, ${harmonicAlpha})`;
            ctx.lineWidth = 0.5;
            
            // Draw harmonic interference pattern
            const points = 12;
            ctx.beginPath();
            for (let p = 0; p <= points; p++) {
              const angle = (p / points) * Math.PI * 2;
              const harmonicRadius = harmonicSize * (1 + Math.sin(harmonic.phase + angle * 3) * 0.2);
              const x = Math.cos(angle) * harmonicRadius;
              const y = Math.sin(angle) * harmonicRadius;
              
              if (p === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          });
        }
        
        // Crystal core
        const coreSize = currentSize * 0.2;
        const coreGlow = this.resonance;
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize * 2);
        gradient.addColorStop(0, `rgba(80, 80, 80, ${alpha * (0.5 + coreGlow * 0.5)})`);
        gradient.addColorStop(1, `rgba(80, 80, 80, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, coreSize * 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }
    
    class SoundWave {
      constructor(x, y, frequency, amplitude, delay = 0) {
        this.originX = x;
        this.originY = y;
        this.frequency = frequency;
        this.amplitude = amplitude;
        this.radius = 0;
        this.maxRadius = 80 + frequency * 0.1;
        this.life = 1;
        this.speed = 0.8 + frequency * 0.001;
        this.delay = delay;
        this.age = 0;
        this.wavelength = 15 + frequency * 0.01;
      }
      
      update() {
        this.age += 1;
        
        if (this.age > this.delay) {
          this.radius += this.speed;
          this.life = Math.max(0, 1 - (this.radius / this.maxRadius));
        }
      }
      
      draw(ctx) {
        if (this.life <= 0 || this.age < this.delay) return;
        
        const alpha = this.life * this.amplitude * 0.6;
        
        // Draw wave as expanding ripples
        ctx.strokeStyle = `rgba(70, 70, 70, ${alpha})`;
        ctx.lineWidth = 0.8;
        
        // Multiple wave fronts for interference pattern
        for (let w = 0; w < 3; w++) {
          const waveRadius = this.radius - w * this.wavelength;
          if (waveRadius > 0) {
            const waveAlpha = alpha * (1 - w * 0.3);
            ctx.strokeStyle = `rgba(70, 70, 70, ${waveAlpha})`;
            
            ctx.beginPath();
            ctx.arc(this.originX, this.originY, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        
        // Draw wave amplitude visualization
        if (this.radius < this.maxRadius * 0.7) {
          const amplitudePoints = 8;
          for (let a = 0; a < amplitudePoints; a++) {
            const angle = (a / amplitudePoints) * Math.PI * 2;
            const waveIntensity = Math.sin(this.radius * 0.1 + angle * 2) * this.amplitude;
            const pointRadius = this.radius + waveIntensity * 5;
            
            const x = this.originX + Math.cos(angle) * pointRadius;
            const y = this.originY + Math.sin(angle) * pointRadius;
            
            ctx.fillStyle = `rgba(60, 60, 60, ${alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
    
    const initializeCrystals = () => {
      crystals = [];
      soundWaves = [];
      
      // Musical frequencies (pentatonic scale for harmony)
      const frequencies = [261.63, 293.66, 329.63, 392.00, 440.00]; // C, D, E, G, A
      
      const numCrystals = 4 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numCrystals; i++) {
        const x = width * (0.2 + (i / (numCrystals - 1)) * 0.6);
        const y = height * (0.3 + Math.random() * 0.4);
        const frequency = frequencies[i % frequencies.length];
        const size = 15 + Math.random() * 15;
        
        crystals.push(new SingingCrystal(x, y, frequency, size));
      }
    };
    
    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Update crystals
      crystals.forEach(crystal => crystal.update(time));
      
      // Update sound waves
      soundWaves.forEach(wave => wave.update());
      soundWaves = soundWaves.filter(wave => wave.life > 0);
      
      // Draw harmonic field
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.05)';
      ctx.lineWidth = 0.3;
      const harmonicGrid = 25;
      
      for (let x = 0; x < width; x += harmonicGrid) {
        for (let y = 0; y < height; y += harmonicGrid) {
          // Calculate harmonic intensity at this point
          let totalHarmonic = 0;
          crystals.forEach(crystal => {
            const distance = Math.sqrt((x - crystal.x) ** 2 + (y - crystal.y) ** 2);
            if (distance < 100) {
              totalHarmonic += crystal.resonance * (1 - distance / 100);
            }
          });
          
          if (totalHarmonic > 0.2) {
            const harmonicSize = totalHarmonic * 3;
            ctx.beginPath();
            ctx.arc(x, y, harmonicSize, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
      
      // Draw sound waves
      soundWaves.forEach(wave => wave.draw(ctx));
      
      // Draw crystals
      crystals.forEach(crystal => crystal.draw(ctx));
      
      // Draw connections showing harmonic resonance
      for (let i = 0; i < crystals.length; i++) {
        for (let j = i + 1; j < crystals.length; j++) {
          const c1 = crystals[i];
          const c2 = crystals[j];
          
          if (c1.resonance > 0.3 && c2.resonance > 0.3) {
            const distance = Math.sqrt((c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2);
            if (distance < 150) {
              const resonanceConnection = Math.min(c1.resonance, c2.resonance) * 0.3;
              
              ctx.strokeStyle = `rgba(70, 70, 70, ${resonanceConnection})`;
              ctx.lineWidth = 0.5;
              ctx.setLineDash([3, 9]);
              
              ctx.beginPath();
              ctx.moveTo(c1.x, c1.y);
              ctx.lineTo(c2.x, c2.y);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          }
        }
      }
      
      // Musical staff visualization
      ctx.strokeStyle = 'rgba(60, 60, 60, 0.1)';
      ctx.lineWidth = 0.5;
      
      for (let staff = 0; staff < 5; staff++) {
        const y = height - 60 + staff * 8;
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(width - 20, y);
        ctx.stroke();
      }
      
      // Sound visualization text
      ctx.font = '9px serif';
      ctx.fillStyle = 'rgba(60, 60, 60, 0.4)';
      ctx.textAlign = 'center';
      ctx.fillText('Crystal Harmonics', width / 2, height - 15);
      
      animationId = requestAnimationFrame(animate);
    };
    
    initializeCrystals();
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      crystals = [];
      soundWaves = [];
    };
  }, [width, height]);
  
  return (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F0EEE6',
      overflow: 'hidden',
      borderRadius: '8px'
    }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default CrystalSong;
