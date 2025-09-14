import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: neural connectivity, emergent intelligence, synaptic plasticity
// visualization: Brain-like network with neurons firing and synaptic strengthening

const SynapticNetwork: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = width;
    canvas.height = height;

    // Neural network structure
    const neurons = [];
    const synapses = [];
    const signals = [];
    const numNeurons = 80;
    let time = 0;

    // Initialize neurons
    for (let i = 0; i < numNeurons; i++) {
      neurons.push({
        x: Math.random() * width,
        y: Math.random() * height,
        activation: 0,
        threshold: 0.3 + Math.random() * 0.4,
        refractory: 0,
        lastFire: -100,
        connections: [],
        inhibitory: Math.random() < 0.2, // 20% inhibitory neurons
        size: 4 + Math.random() * 3
      });
    }

    // Create synaptic connections
    neurons.forEach((neuron, i) => {
      const numConnections = 3 + Math.floor(Math.random() * 5);
      
      for (let j = 0; j < numConnections; j++) {
        const targetIndex = Math.floor(Math.random() * neurons.length);
        if (targetIndex !== i) {
          const target = neurons[targetIndex];
          const distance = Math.sqrt(
            Math.pow(neuron.x - target.x, 2) + Math.pow(neuron.y - target.y, 2)
          );
          
          if (distance < 120) {
            const synapse = {
              from: i,
              to: targetIndex,
              strength: 0.1 + Math.random() * 0.4,
              delay: Math.floor(distance / 20) + 1,
              plasticity: Math.random() * 0.02,
              active: false
            };
            
            synapses.push(synapse);
            neuron.connections.push(synapse);
          }
        }
      }
    });

    let animationId = null;

    const updateNeuralActivity = () => {
      // Add random external input
      if (Math.random() < 0.1) {
        const randomNeuron = neurons[Math.floor(Math.random() * neurons.length)];
        randomNeuron.activation += 0.5;
      }

      // Update neuron states
      neurons.forEach((neuron, i) => {
        // Decay activation
        neuron.activation *= 0.95;
        
        // Update refractory period
        if (neuron.refractory > 0) {
          neuron.refractory--;
        }
        
        // Check for firing
        if (neuron.activation > neuron.threshold && neuron.refractory === 0) {
          neuron.lastFire = time;
          neuron.refractory = 10; // Refractory period
          neuron.activation = 0;
          
          // Create signals to connected neurons
          neuron.connections.forEach(synapse => {
            signals.push({
              synapse: synapse,
              startTime: time,
              progress: 0,
              strength: synapse.strength * (neuron.inhibitory ? -1 : 1)
            });
            
            synapse.active = true;
            
            // Hebbian plasticity - strengthen active synapses
            if (synapse.strength < 0.8) {
              synapse.strength += synapse.plasticity;
            }
          });
        }
      });

      // Update signal propagation
      signals.forEach((signal, index) => {
        const elapsed = time - signal.startTime;
        signal.progress = Math.min(1, elapsed / signal.synapse.delay);
        
        // Signal arrives at target
        if (signal.progress >= 1) {
          const targetNeuron = neurons[signal.synapse.to];
          targetNeuron.activation += signal.strength;
          signals.splice(index, 1);
          signal.synapse.active = false;
        }
      });

      // Synaptic decay
      synapses.forEach(synapse => {
        if (!synapse.active && synapse.strength > 0.05) {
          synapse.strength *= 0.9999; // Gradual decay of unused synapses
        }
      });
    };

    const drawNeuron = (neuron, i) => {
      const fireIntensity = Math.max(0, 1 - (time - neuron.lastFire) / 20);
      const activationLevel = Math.min(1, neuron.activation);
      
      // Neuron body
      const baseAlpha = 0.3 + activationLevel * 0.4;
      const fireAlpha = fireIntensity * 0.6;
      const totalAlpha = Math.min(1, baseAlpha + fireAlpha);
      
      const color = neuron.inhibitory ? 
        `rgba(120, 60, 60, ${totalAlpha})` : 
        `rgba(60, 60, 80, ${totalAlpha})`;
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(neuron.x, neuron.y, neuron.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Neuron glow during firing
      if (fireIntensity > 0) {
        const glowSize = neuron.size + fireIntensity * 8;
        const glowGradient = ctx.createRadialGradient(
          neuron.x, neuron.y, 0,
          neuron.x, neuron.y, glowSize
        );
        
        const glowColor = neuron.inhibitory ? '120, 60, 60' : '60, 80, 120';
        glowGradient.addColorStop(0, `rgba(${glowColor}, ${fireIntensity * 0.3})`);
        glowGradient.addColorStop(1, `rgba(${glowColor}, 0)`);
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Activation level indicator
      if (activationLevel > 0.1) {
        ctx.fillStyle = `rgba(100, 100, 100, ${activationLevel * 0.5})`;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, neuron.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawSynapse = (synapse) => {
      const fromNeuron = neurons[synapse.from];
      const toNeuron = neurons[synapse.to];
      
      const alpha = synapse.strength * 0.3;
      const activeBoost = synapse.active ? 0.4 : 0;
      
      ctx.strokeStyle = `rgba(80, 80, 80, ${alpha + activeBoost})`;
      ctx.lineWidth = Math.max(0.5, synapse.strength * 2);
      
      ctx.beginPath();
      ctx.moveTo(fromNeuron.x, fromNeuron.y);
      ctx.lineTo(toNeuron.x, toNeuron.y);
      ctx.stroke();
      
      // Synaptic terminal
      const terminalSize = 1 + synapse.strength * 2;
      ctx.fillStyle = `rgba(90, 90, 90, ${alpha + activeBoost})`;
      ctx.beginPath();
      ctx.arc(toNeuron.x, toNeuron.y, terminalSize, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawSignal = (signal) => {
      const synapse = signal.synapse;
      const fromNeuron = neurons[synapse.from];
      const toNeuron = neurons[synapse.to];
      
      const x = fromNeuron.x + (toNeuron.x - fromNeuron.x) * signal.progress;
      const y = fromNeuron.y + (toNeuron.y - fromNeuron.y) * signal.progress;
      
      const intensity = Math.abs(signal.strength);
      const size = 2 + intensity * 3;
      
      const signalColor = signal.strength > 0 ? 
        `rgba(100, 120, 140, 0.8)` : 
        `rgba(140, 100, 100, 0.8)`;
      
      ctx.fillStyle = signalColor;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Signal trail
      const trailLength = 5;
      for (let i = 1; i <= trailLength; i++) {
        const trailProgress = Math.max(0, signal.progress - i * 0.05);
        if (trailProgress <= 0) break;
        
        const trailX = fromNeuron.x + (toNeuron.x - fromNeuron.x) * trailProgress;
        const trailY = fromNeuron.y + (toNeuron.y - fromNeuron.y) * trailProgress;
        const trailAlpha = (1 - i / trailLength) * 0.3;
        
        ctx.fillStyle = signal.strength > 0 ? 
          `rgba(100, 120, 140, ${trailAlpha})` : 
          `rgba(140, 100, 100, ${trailAlpha})`;
        
        ctx.beginPath();
        ctx.arc(trailX, trailY, size * (1 - i / trailLength), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawNetworkStats = () => {
      // Draw network activity heatmap overlay
      const activeNeurons = neurons.filter(n => n.activation > 0.1).length;
      const firingRate = activeNeurons / neurons.length;
      
      if (firingRate > 0.1) {
        const overlayAlpha = Math.min(0.1, firingRate * 0.3);
        ctx.fillStyle = `rgba(80, 120, 160, ${overlayAlpha})`;
        ctx.fillRect(0, 0, width, height);
      }
    };

    const animate = () => {
      // Background
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      time += 1;
      
      updateNeuralActivity();
      
      // Draw synapses (behind neurons)
      synapses.forEach(drawSynapse);
      
      // Draw signals
      signals.forEach(drawSignal);
      
      // Draw neurons
      neurons.forEach(drawNeuron);
      
      // Draw network statistics overlay
      drawNetworkStats();
      
      // Draw connectivity patterns
      const strongSynapses = synapses.filter(s => s.strength > 0.6);
      if (strongSynapses.length > 5) {
        ctx.strokeStyle = 'rgba(60, 60, 60, 0.1)';
        ctx.lineWidth = 1;
        
        strongSynapses.forEach(synapse => {
          const from = neurons[synapse.from];
          const to = neurons[synapse.to];
          
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
        });
      }

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

export default SynapticNetwork;
