import { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// theme: interconnectedness of hidden forces
// visualization: shifting translucent waves weave a mandala of interference patterns,
// revealing the unseen threads that bind the universe like quantum silk

const QuantumSilkMandala: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Initial background
    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, width, height);

    let animationId: number;
    let time = 0;
    const waves = 9; // number of sine curves

    const draw = () => {
      // fade previous frame to create trailing fabric effect
      ctx.fillStyle = 'rgba(240, 238, 230, 0.05)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < waves; i++) {
        const phase = time * 0.02 + (i * Math.PI) / waves;
        const amplitude = height * 0.25 + Math.sin(time * 0.01 + i) * height * 0.1;
        const frequency = 0.005 + i * 0.002;

        ctx.beginPath();
        for (let x = 0; x <= width; x += 2) {
          const y = height / 2 + Math.sin(x * frequency + phase) * amplitude;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        const alpha = 0.15 + 0.1 * Math.sin(time * 0.02 + i);
        ctx.strokeStyle = `rgba(30, 30, 30, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      time += 1;
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animationId);
  }, [width, height]);

  return (
    <div
      className="flex justify-center items-center bg-[#F0EEE6]"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <canvas ref={canvasRef} width={width} height={height} className="shadow-lg" />
    </div>
  );
};

export default QuantumSilkMandala;

