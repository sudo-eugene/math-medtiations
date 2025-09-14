import React, { useRef, useEffect, useState } from 'react';
import { VisualProps } from '../../types';

const AudioVisualizer: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const analyserNode = context.createAnalyser();
        analyserNode.fftSize = 256;
        source.connect(analyserNode);
        setAudioContext(context);
        setAnalyser(analyserNode);
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    };

    initAudio();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const animate = () => {
      requestAnimationFrame(animate);

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        ctx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }
    };

    animate();
  }, [analyser, width, height]);

  return <canvas ref={canvasRef} />;
};

export default AudioVisualizer;
