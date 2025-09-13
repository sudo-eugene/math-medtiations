import React, { useEffect, useRef, useState } from 'react';
import geometryPresets from '../../geometry_gallery_presets.json';
import MoireMandalaPattern from './custom-visuals/MoireMandalaPattern';
import FlowerOfLife from './custom-visuals/FlowerOfLife';
import HankiesInTheWind from './custom-visuals/HankiesInTheWind';
import TessellationPatterns from './custom-visuals/TessellationPatterns';
import AsciiBinaryFlow from './custom-visuals/AsciiBinaryFlow';
import ScrollingVerticalBars from './custom-visuals/ScrollingVerticalBars';
import EmptyParticles from './custom-visuals/EmptyParticles';
import ParticleVessel from './custom-visuals/ParticleVessel';
import ParticleFlower from './custom-visuals/ParticleFlower';
import PineconeDelicate from './custom-visuals/PineconeDelicate';
import WaterAscii from './custom-visuals/WaterAscii';
import CanyonMultiLayerFlows from './custom-visuals/CanyonMultiLayerFlows';
import WavyYinYangNoDots from './custom-visuals/WavyYinYangNoDots';
import TorusFieldDynamics from './custom-visuals/TorusFieldDynamics';
import PhaseDistortionWaves from './custom-visuals/PhaseDistortionWaves';
import BlackWhiteBlobs from './custom-visuals/BlackWhiteBlobs';
import ParticleReverie from './custom-visuals/ParticleReverie';
import WaveVariationSparse from './custom-visuals/WaveVariationSparse';
import OrganicCellularGrid from './custom-visuals/OrganicCellularGrid';
import ZoomedParticleAnimation from './custom-visuals/ZoomedParticleAnimation';
import VerticalBarsNoise from './custom-visuals/VerticalBarsNoise';
import TangledLines from './custom-visuals/TangledLines';
import MoireSixCircles from './custom-visuals/MoireSixCircles';
import IronFillings from './custom-visuals/IronFillings';
import WaterFlowingAroundObstacle from './custom-visuals/WaterFlowingAroundObstacle';
import WaveInterferenceOptimized3 from './custom-visuals/WaveInterferenceOptimized3';
import GentleWaves from './custom-visuals/GentleWaves';
import OrganicGrowth from './custom-visuals/OrganicGrowth';
import AsciiClarityFromStillness from './custom-visuals/AsciiClarityFromStillness';
import VoidArchitecture from './custom-visuals/VoidArchitecture';
import Metamorphosis from './custom-visuals/Metamorphosis';
import Artwork33 from './custom-visuals/Artwork33';
import LayeredSineWaves from './custom-visuals/LayeredSineWaves';
import WaveInterferenceV6 from './custom-visuals/WaveInterferenceV6';
import MorphingContours from './custom-visuals/MorphingContours';
import KaleidoscopeVariation3 from './custom-visuals/KaleidoscopeVariation3';
import HashArchitecture from './custom-visuals/HashArchitecture';
import VortexParticleSystemExact from './custom-visuals/VortexParticleSystemExact';
import TetheredFlow from './custom-visuals/TetheredFlow';
import KaleidoscopeWaveCenterSquare from './custom-visuals/KaleidoscopeWaveCenterSquare';
import Dispersing3DVase from './custom-visuals/Dispersing3DVase';
import FibonacciRectangleSpiral from './custom-visuals/FibonacciRectangleSpiral';
import SlidingEaseVerticalBars from './custom-visuals/SlidingEaseVerticalBars';
import EtherealTorusFlow from './custom-visuals/EtherealTorusFlow';
import ParticleCylinder from './custom-visuals/ParticleCylinder';
import BouncingPointCloud from './custom-visuals/BouncingPointCloud';
import CrystallineBiology from './custom-visuals/CrystallineBiology';
import Artwork55v1 from './custom-visuals/Artwork55v1';
import DimensionalResonance from './custom-visuals/DimensionalResonance';
import ShinyLoop from './custom-visuals/ShinyLoop';
import AnimatedAsciiMandala from './custom-visuals/AnimatedAsciiMandala';
import AsciiDiagonalPetals from './custom-visuals/AsciiDiagonalPetals';
import PineconeConstellation from './custom-visuals/PineconeConstellation';
import IntricateRadialMesh from './custom-visuals/IntricateRadialMesh';
import ContinuousLineDrawing from './custom-visuals/ContinuousLineDrawing';
import DramaticRibbonFold from './custom-visuals/DramaticRibbonFold';
import ShellRidgePattern from './custom-visuals/ShellRidgePattern';
import SwayingBranches from './custom-visuals/SwayingBranches';
import FlowingRibbons from './custom-visuals/FlowingRibbons';
import CanyonStratifiedUndulations from './custom-visuals/CanyonStratifiedUndulations';
import AsciiBlob from './custom-visuals/AsciiBlob';
import RadialGrowth from './custom-visuals/RadialGrowth';
import VectorFieldLines from './custom-visuals/VectorFieldLines';
import OscillatingHatching from './custom-visuals/OscillatingHatching';
import WaveInterferenceV4 from './custom-visuals/WaveInterferenceV4';
import BreathingRhombus from './custom-visuals/BreathingRhombus';
import ImplicitDreams from './custom-visuals/ImplicitDreams';
import SpiralStorm from './custom-visuals/SpiralStorm';
import FlowingLattice from './custom-visuals/FlowingLattice';
import Artwork63v2 from './custom-visuals/Artwork63v2';
import DelicateTorusKnot from './custom-visuals/DelicateTorusKnot';
import HourglassSpiral from './custom-visuals/HourglassSpiral';
import RadialMeshFlower from './custom-visuals/RadialMeshFlower';
import CanyonUndulatingWalls from './custom-visuals/CanyonUndulatingWalls';
import WaveInterferenceV5 from './custom-visuals/WaveInterferenceV5';
import EffortlessParticles from './custom-visuals/EffortlessParticles';
import MobiusFlowTunnel from './custom-visuals/MobiusFlowTunnel';
import PenroseTriangleIllusion from './custom-visuals/PenroseTriangleIllusion';
import EmergentTreeOfVoid from './custom-visuals/EmergentTreeOfVoid';
import NonEuclideanRippleMaze from './custom-visuals/NonEuclideanRippleMaze';
import CharacterVortex from './custom-visuals/CharacterVortex';
import FractalBreathTree from './custom-visuals/FractalBreathTree';
import QuantumSilkMandala from './custom-visuals/QuantumSilkMandala';
import HyperbolicSunburst from './custom-visuals/HyperbolicSunburst';
import CelestialClockwork from './custom-visuals/CelestialClockwork';
import MirrorMaze from './custom-visuals/MirrorMaze';
import EternalAsciiWaterfall from './custom-visuals/EternalAsciiWaterfall';
import FibonacciSpiralGarden from './custom-visuals/FibonacciSpiralGarden';
import FractalWaterfall from './custom-visuals/FractalWaterfall';
import HarmonicConstellations from './custom-visuals/HarmonicConstellations';
import HyperbolicMirrorSequence from './custom-visuals/HyperbolicMirrorSequence';
import MetamorphicTerrain from './custom-visuals/MetamorphicTerrain';
import ParticleZenGarden from './custom-visuals/ParticleZenGarden';
import PulsatingYinYangNebula from './custom-visuals/PulsatingYinYangNebula';
import QuantumLatticeBloom from './custom-visuals/QuantumLatticeBloom';
import StarfieldEntanglement from './custom-visuals/StarfieldEntanglement';

export const devMode = true;

// Utility functions for rendering... (clamp, hslToRgb, nicePalette, worldToViewport - all remain the same)
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function hslToRgb(h, s, l) {
  s = clamp(s, 0, 1); l = clamp(l, 0, 1);
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1=0,g1=0,b1=0;
  if (0 <= hp && hp < 1) [r1,g1,b1] = [c,x,0];
  else if (1 <= hp && hp < 2) [r1,g1,b1] = [x,c,0];
  else if (2 <= hp && hp < 3) [r1,g1,b1] = [0,c,x];
  else if (3 <= hp && hp < 4) [r1,g1,b1] = [0,x,c];
  else if (4 <= hp && hp < 5) [r1,g1,b1] = [x,0,c];
  else if (5 <= hp && hp < 6) [r1,g1,b1] = [c,0,x];
  const m = l - c/2;
  return [Math.round(255*(r1+m)), Math.round(255*(g1+m)), Math.round(255*(b1+m))];
}

function nicePalette(iter, maxIter) {
  if (iter >= maxIter) return [0, 0, 0];
  const t = iter / maxIter;
  const h = 360 * t * 4;
  const [r,g,b] = hslToRgb(h, 0.6, 0.5 + 0.2*Math.sin(6.283*t));
  return [r,g,b];
}

function worldToViewport(x, y, bounds, W, H) {
  const [xmin, xmax, ymin, ymax] = bounds;
  const sx = (x - xmin) / (xmax - xmin);
  const sy = (y - ymin) / (ymax - ymin);
  return [Math.round(sx * (W-1)), Math.round((1 - sy) * (H-1))];
}

// Intersection Observer hook for lazy loading
function useOnScreen(ref) {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting), {
      root: null, threshold: 0.1,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return isIntersecting;
}

// Map quote index to a specific mathematical preset
export function getPresetForQuote(quoteIndex) {
  const families = [
    'julia', 'mandelbrot', 'newton', 'de_jong', 'clifford', 
    'ikeda', 'gumowski_mira', 'lorenz', 'rossler', 'aizawa', 
    'halvorsen', 'lissajous', 'spirograph', 'superformula', 
    'rose_curve', 'phyllotaxis', 'scalar_field', 'ifs'
  ];
  const familyIndex = quoteIndex % families.length;
  const family = families[familyIndex];
  
  const familyPresets = geometryPresets.filter(p => p.family === family);
  if (familyPresets.length === 0) return geometryPresets[0];
  
  const presetIndex = Math.floor(quoteIndex / families.length) % familyPresets.length;
  return familyPresets[presetIndex];
}

// Map quote indices to custom components (0-based indexing)
export const customVisuals = [
  MoireMandalaPattern,
  FlowerOfLife,
  HankiesInTheWind,
  TessellationPatterns,
  AsciiBinaryFlow,
  ScrollingVerticalBars,
  RadialMeshFlower,
  ParticleVessel,
  ParticleFlower,
  PineconeDelicate,
  WaterAscii,
  CanyonMultiLayerFlows,
  WavyYinYangNoDots,
  TorusFieldDynamics,
  PhaseDistortionWaves,
  BlackWhiteBlobs,
  ParticleReverie,
  WaveVariationSparse,
  OrganicCellularGrid,
  ZoomedParticleAnimation,
  VerticalBarsNoise,
  TangledLines,
  MoireSixCircles,
  IronFillings,
  WaterFlowingAroundObstacle,
  WaveInterferenceOptimized3,
  GentleWaves,
  OrganicGrowth,
  AsciiClarityFromStillness,
  VoidArchitecture,
  Metamorphosis,
  Artwork33,
  LayeredSineWaves,
  WaveInterferenceV6,
  MorphingContours,
  KaleidoscopeVariation3,
  HashArchitecture,
  VortexParticleSystemExact,
  TetheredFlow,
  KaleidoscopeWaveCenterSquare,
  Dispersing3DVase,
  FibonacciRectangleSpiral,
  SlidingEaseVerticalBars,
  EtherealTorusFlow,
  ParticleCylinder,
  BouncingPointCloud,
  CrystallineBiology,
  Artwork55v1,
  DimensionalResonance,
  ShinyLoop,
  AnimatedAsciiMandala,
  AsciiDiagonalPetals,
  PineconeConstellation,
  IntricateRadialMesh,
  ContinuousLineDrawing,
  DramaticRibbonFold,
  ShellRidgePattern,
  SwayingBranches,
  FlowingRibbons,
  CanyonStratifiedUndulations,
  AsciiBlob,
  RadialGrowth,
  VectorFieldLines,
  OscillatingHatching,
  WaveInterferenceV4,
  BreathingRhombus,
  ImplicitDreams,
  SpiralStorm,
  FlowingLattice,
  Artwork63v2,
  DelicateTorusKnot,
  HourglassSpiral,
  EmptyParticles,
  CanyonUndulatingWalls,
  WaveInterferenceV5,
  EffortlessParticles,
  MobiusFlowTunnel,
  PenroseTriangleIllusion,
  EmergentTreeOfVoid,
  NonEuclideanRippleMaze,
  CharacterVortex,
  FractalBreathTree,
  QuantumSilkMandala,
  HyperbolicSunburst,
  CelestialClockwork,
  MirrorMaze,
  EternalAsciiWaterfall,
  FibonacciSpiralGarden,
  FractalWaterfall,
  HarmonicConstellations,
  HyperbolicMirrorSequence,
  MetamorphicTerrain,
  ParticleZenGarden,
  PulsatingYinYangNebula,
  QuantumLatticeBloom,
  StarfieldEntanglement,
];


const MathVisual = ({ quoteIndex, isVisible, onLoad }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const visible = useOnScreen(containerRef);
  const [hasRendered, setHasRendered] = useState(false);
  
  // --- MODIFIED PART STARTS HERE ---
  // State to hold container dimensions
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Use ResizeObserver to get container dimensions
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);
  // --- MODIFIED PART ENDS HERE ---

  const CustomVisualComponent = customVisuals[quoteIndex];

  if (CustomVisualComponent) {
    const { width, height } = dimensions; // Destructure dimensions

    useEffect(() => {
      if (isVisible) {
        onLoad?.(true);
      }
    }, [isVisible, onLoad]);

    const componentName = CustomVisualComponent.name || 'Unknown';

    return (
      <div ref={containerRef} className="w-full h-full relative">
        <div className="w-full h-full">
          {isVisible && width > 0 && (
            <CustomVisualComponent width={width} height={height} />
          )}
        </div>
        {devMode && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {componentName}.tsx
          </div>
        )}
      </div>
    );
  }
  
  // The rest of the component (for non-custom visuals) remains largely the same
  // It already uses container.clientWidth and container.clientHeight for sizing
  const preset = getPresetForQuote(quoteIndex);
  
  useEffect(() => {
    if (!visible || !isVisible || hasRendered) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    const W = container ? container.clientWidth : 320;
    const H = container ? container.clientHeight : 320;
    canvas.width = W;
    canvas.height = H;
    
    // ... (the entire fractal/math rendering logic remains unchanged)
    
    // Light background
    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, W, H);
    
    const { family, params, renderer_hint } = preset;
    const type = renderer_hint?.type || 'escape_time';
    
    const renderMath = () => {
      try {
        if (type === 'escape_time') {
          // Render Julia or Mandelbrot sets
          const maxIter = Math.min(params.max_iter || 400, 300); // Limit for performance
          let bounds = params.bounds || [-2.5, 1.5, -1.5, 1.5];
          
          if (family === 'mandelbrot' && params.centre && params.zoom) {
            const [cx, cy] = params.centre;
            const zoom = params.zoom;
            const aspect = W / H;
            const w = 3.5 / zoom;
            const h = w / aspect;
            bounds = [cx - w/2, cx + w/2, cy - h/2, cy + h/2];
          }
          
          const escapeR = params.escape_radius || 2.0;
          const imageData = ctx.createImageData(W, H);
          const d = imageData.data;
          
          for (let py = 0; py < H; py++) {
            const y0 = bounds[2] + (bounds[3] - bounds[2]) * (py / (H - 1));
            for (let px = 0; px < W; px++) {
              const x0 = bounds[0] + (bounds[1] - bounds[0]) * (px / (W - 1));
              let x = 0, y = 0, iter = 0;
              
              if (family === 'julia') {
                x = x0;
                y = y0;
              }
              
              while (x*x + y*y <= escapeR*escapeR && iter < maxIter) {
                const xt = x*x - y*y + (family === 'julia' ? params.c_re : x0);
                const yt = 2*x*y + (family === 'julia' ? params.c_im : y0);
                x = xt;
                y = yt;
                iter++;
              }
              
              const idx = 4 * (py * W + px);
              if (iter < maxIter) {
                const intensity = 240 - Math.floor(100 * (iter / maxIter));
                d[idx] = intensity;
                d[idx + 1] = intensity;
                d[idx + 2] = intensity;
              } else {
                d[idx] = 50;
                d[idx + 1] = 50;
                d[idx + 2] = 50;
              }
              d[idx + 3] = 255;
            }
          }
          ctx.putImageData(imageData, 0, 0);
        } else if (type === 'iter_map') {
          // Render Clifford, de Jong, Ikeda, Gumowski-Mira attractors
          const steps = Math.min(params.steps || 50000, 80000);
          const discard = params.discard || 1000;
          let x = 0.1, y = 0.0;
          const imageData = ctx.getImageData(0, 0, W, H);
          const data = imageData.data;
          const bounds = [-3, 3, -3, 3];
          
          const plot = (x, y) => {
            const sx = (x - bounds[0]) / (bounds[1] - bounds[0]);
            const sy = (y - bounds[2]) / (bounds[3] - bounds[2]);
            const px = Math.round(sx * (W - 1));
            const py = Math.round((1 - sy) * (H - 1));
            if (px >= 0 && px < W && py >= 0 && py < H) {
              const idx = 4 * (py * W + px);
              const v = 30;
              data[idx] = Math.max(0, data[idx] - v);
              data[idx + 1] = Math.max(0, data[idx + 1] - v);
              data[idx + 2] = Math.max(0, data[idx + 2] - v);
              data[idx + 3] = 255;
            }
          };
          
          for (let i = 0; i < steps; i++) {
            if (family === 'de_jong') {
              const { a, b, c, d } = params;
              const xn = Math.sin(a * y) - Math.cos(b * x);
              const yn = Math.sin(c * x) - Math.cos(d * y);
              x = xn; y = yn;
            } else if (family === 'clifford') {
              const { a, b, c, d } = params;
              const xn = Math.sin(a * y) + c * Math.cos(a * x);
              const yn = Math.sin(b * x) + d * Math.cos(b * y);
              x = xn; y = yn;
            } else if (family === 'ikeda') {
              const { u } = params;
              const t = 0.4 - 6 / (1 + x * x + y * y);
              const xn = 1 + u * (x * Math.cos(t) - y * Math.sin(t));
              const yn = u * (x * Math.sin(t) + y * Math.cos(t));
              x = xn; y = yn;
            } else if (family === 'gumowski_mira') {
              const { a, b } = params;
              const f = (x) => a * x + (2 * (1 - a) * x * x) / (1 + x * x);
              const xn = b * y + f(x);
              const yn = -x + f(xn);
              x = xn; y = yn;
            }
            if (i > discard) plot(x, y);
          }
          ctx.putImageData(imageData, 0, 0);
        } else if (type === 'ode') {
          // Render 3D attractors: Lorenz, Rössler, Aizawa, Halvorsen
          const steps = Math.min(params.steps || 8000, 15000);
          const dt = params.dt || 0.01;
          let [x, y, z] = params.xyz0 || [0.1, 0, 0];
          const bounds = [-30, 30, -30, 30];
          ctx.strokeStyle = 'rgba(50, 50, 50, 0.4)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          
          const project = (x, y, z) => [x * 0.8 + z * 0.2, y * 0.8 - z * 0.1];
          const deriv = (x, y, z) => {
            if (family === 'lorenz') {
              const { sigma, rho, beta } = params;
              return [sigma * (y - x), x * (rho - z) - y, x * y - beta * z];
            } else if (family === 'rossler') {
              const { a, b, c } = params;
              return [-(y + z), x + a * y, b + z * (x - c)];
            } else if (family === 'aizawa') {
              const { a, b, c, d, e, f } = params;
              return [
                (z - b) * x - d * y,
                d * x + (z - b) * y,
                c + a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + f * z * (x * x * x)
              ];
            } else if (family === 'halvorsen') {
              const { a } = params;
              return [-a * x - 4 * y - 4 * z - y * y, -a * y - 4 * z - 4 * x - z * z, -a * z - 4 * x - 4 * y - x * x];
            }
            return [0, 0, 0];
          };
          
          for (let i = 0; i < steps; i++) {
            const k1 = deriv(x, y, z);
            const k2 = deriv(x + dt * k1[0] / 2, y + dt * k1[1] / 2, z + dt * k1[2] / 2);
            const k3 = deriv(x + dt * k2[0] / 2, y + dt * k2[1] / 2, z + dt * k2[2] / 2);
            const k4 = deriv(x + dt * k3[0], y + dt * k3[1], z + dt * k3[2]);
            x += dt * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) / 6;
            y += dt * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) / 6;
            z += dt * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]) / 6;
            
            if (i % 2 === 0) {
              const [px, py] = worldToViewport(...project(x, y, z), bounds, W, H);
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
          }
          ctx.stroke();
        } else if (type === 'parametric_2d') {
          // Render Lissajous and Spirograph curves
          ctx.strokeStyle = 'rgba(50, 50, 50, 0.4)';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          const N = params.samples || 3000;
          const aspect = W / H;
          const bounds = [-1.2 * aspect, 1.2 * aspect, -1.2, 1.2];
          
          const push = (x, y, i) => {
            const [px, py] = worldToViewport(x, y, bounds, W, H);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          };
          
          if (family === 'lissajous') {
            const { A, B, a, b, delta } = params;
            for (let i = 0; i < N; i++) {
              const t = 2 * Math.PI * i / (N - 1);
              push(A * Math.sin(a * t + delta), B * Math.sin(b * t), i);
            }
          } else if (family === 'spirograph') {
            const { R, r, d, kind } = params;
            const Rr = kind === 'epi' ? R + r : R - r;
            const k = Rr / r;
            for (let i = 0; i < N; i++) {
              const t = 2 * Math.PI * i / (N - 1);
              const x = Rr * Math.cos(t) - d * Math.cos(k * t);
              const y = Rr * Math.sin(t) - d * Math.sin(k * t);
              push(x / (R + Math.abs(r) + Math.abs(d)), y / (R + Math.abs(r) + Math.abs(d)), i);
            }
          }
          ctx.stroke();
        } else if (type === 'polar_2d') {
          // Render Superformula and Rose curves
          ctx.strokeStyle = 'rgba(50, 50, 50, 0.4)';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          const N = params.samples || 2000;
          const aspect = W / H;
          const S = 1.2;
          const toXY = (r, theta) => [(r * Math.cos(theta)) / S * aspect, (r * Math.sin(theta)) / S];
          const push = (x, y, i) => {
            const [px, py] = worldToViewport(x, y, [-1, 1, -1, 1], W, H);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          };
          
          if (family === 'superformula') {
            const { m, a, b, n1, n2, n3 } = params;
            const sf = (phi) => {
              const t1 = Math.pow(Math.abs(Math.cos(m * phi / 4) / a), n2);
              const t2 = Math.pow(Math.abs(Math.sin(m * phi / 4) / b), n3);
              return Math.pow(t1 + t2, -1 / n1);
            };
            for (let i = 0; i < N; i++) {
              const t = 2 * Math.PI * i / (N - 1);
              const r = sf(t);
              const [x, y] = toXY(r, t);
              push(x, y, i);
            }
          } else if (family === 'rose_curve') {
            const { k_num, k_den, A } = params;
            const k = k_num / k_den;
            for (let i = 0; i < N; i++) {
              const t = 2 * Math.PI * i / (N - 1);
              const r = A * Math.cos(k * t);
              const [x, y] = toXY(Math.abs(r), t + (r < 0 ? Math.PI : 0));
              push(x, y, i);
            }
          }
          ctx.stroke();
        } else if (type === 'point_polar') {
          // Render Phyllotaxis patterns
          const n = Math.min(params.n_points || 1500, 3000);
          const ang = (params.divergence_deg || 137.507) * Math.PI / 180;
          ctx.fillStyle = 'rgba(50, 50, 50, 0.4)';
          for (let i = 0; i < n; i++) {
            const r = (params.scale || 0.7) * Math.sqrt(i) / Math.sqrt(n);
            const t = i * ang;
            const x = r * Math.cos(t);
            const y = r * Math.sin(t);
            const [px, py] = worldToViewport(x, y, [-1, 1, -1, 1], W, H);
            if (px >= 0 && px < W && py >= 0 && py < H) {
              ctx.fillRect(px, py, 1, 1);
            }
          }
        } else if (type === 'scalar_field') {
          // Render interference patterns
          const imageData = ctx.createImageData(W, H);
          const d = imageData.data;
          const ks = params.k_vectors || [[1, 0, 1], [0.309, 0.951, 1], [-0.809, 0.588, 1]];
          const ph = params.phases || [0, 1, 2];
          
          for (let py = 0; py < H; py++) {
            const y = -1 + 2 * py / (H - 1);
            for (let px = 0; px < W; px++) {
              const x = -1 + 2 * px / (W - 1);
              let v = 0;
              for (let i = 0; i < ks.length; i++) {
                const [kx, ky, kmag] = ks[i];
                v += Math.cos((kx * x + ky * y) * kmag * Math.PI + (ph[i] || 0));
              }
              v /= ks.length;
              const intensity = 240 - Math.floor(190 * (v * 0.5 + 0.5));
              const idx = 4 * (py * W + px);
              d[idx] = intensity;
              d[idx + 1] = intensity;
              d[idx + 2] = intensity;
              d[idx + 3] = 255;
            }
          }
          ctx.putImageData(imageData, 0, 0);
        } else if (type === 'ifs') {
          // Render Iterated Function Systems (Barnsley fern, etc.)
          const points = Math.min(params.points || 30000, 50000);
          let x = 0, y = 0;
          ctx.fillStyle = 'rgba(50, 50, 50, 0.4)';
          const bounds = [-3, 3, -6, 1];
          
          for (let i = 0; i < points; i++) {
            const r = Math.random();
            let acc = 0;
            let map = null;
            for (const m of params.maps) {
              acc += m.p;
              if (r <= acc) {
                map = m;
                break;
              }
            }
            if (!map) map = params.maps[params.maps.length - 1];
            
            const xn = map.a * x + map.b * y + map.e;
            const yn = map.c * x + map.d * y + map.f;
            x = xn;
            y = yn;
            
            if (i > (params.discard || 100)) {
              const [px, py] = worldToViewport(x, y, bounds, W, H);
              if (px >= 0 && px < W && py >= 0 && py < H) {
                ctx.fillRect(px, py, 1, 1);
              }
            }
          }
        } else if (type === 'newton_basins') {
          // Render Newton fractals
          const maxIter = Math.min(params.max_iter || 40, 50);
          const tol = params.tolerance || 1e-6;
          const bounds = params.bounds || [-2, 2, -2, 2];
          const imageData = ctx.createImageData(W, H);
          const d = imageData.data;
          
          // Extract n from polynomial like "z**3 - 1"
          let n = 3;
          const m = /z\*\*(\d+)/.exec(params.polynomial || "z**3 - 1");
          if (m) n = parseInt(m[1]);
          
          for (let py = 0; py < H; py++) {
            const y0 = bounds[2] + (bounds[3] - bounds[2]) * (py / (H - 1));
            for (let px = 0; px < W; px++) {
              const x0 = bounds[0] + (bounds[1] - bounds[0]) * (px / (W - 1));
              let x = x0, y = y0, k = 0, converged = false;
              
              while (k < maxIter) {
                const r = Math.hypot(x, y);
                const theta = Math.atan2(y, x);
                if (r === 0) break;
                
                const rn = Math.pow(r, n - 1);
                const re = rn * Math.cos((n - 1) * theta);
                const im = rn * Math.sin((n - 1) * theta);
                
                const f_re = x * re - y * im - 1;
                const f_im = x * im + y * re;
                const df_re = n * re;
                const df_im = n * im;
                const denom = df_re * df_re + df_im * df_im;
                
                if (denom === 0) break;
                
                const zx = x - (f_re * df_re + f_im * df_im) / denom;
                const zy = y - (f_im * df_re - f_re * df_im) / denom;
                
                if (Math.hypot(zx - x, zy - y) < tol) {
                  x = zx;
                  y = zy;
                  converged = true;
                  break;
                }
                x = zx;
                y = zy;
                k++;
              }
              
              const idx = 4 * (py * W + px);
              if (!converged) {
                d[idx] = 240;
                d[idx+1] = 238;
                d[idx+2] = 230;
                d[idx + 3] = 255;
                continue;
              }
              
              const ang = (Math.atan2(y, x) + 2 * Math.PI) % (2 * Math.PI);
              const hue = 360 * (ang / (2 * Math.PI));
              const intensity = 240 - Math.floor(190 * (k / maxIter));
              d[idx] = intensity;
              d[idx + 1] = intensity;
              d[idx + 2] = intensity;
              d[idx + 3] = 255;
            }
          }
          ctx.putImageData(imageData, 0, 0);
        }
        
        setHasRendered(true);
        onLoad?.(true);
      } catch (error) {
        console.error('Math rendering error:', error);
        // Fallback: simple gradient
        const gradient = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W/2);
        gradient.addColorStop(0, '#1f2937');
        gradient.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        setHasRendered(true);
        onLoad?.(false);
      }
    };
    
    // Small delay to allow for smooth transitions
    const timer = setTimeout(renderMath, 200);
    return () => clearTimeout(timer);
  }, [visible, isVisible, hasRendered, preset, quoteIndex, onLoad]);
  
  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-2xl object-cover"
        style={{ 
          filter: hasRendered ? 'none' : 'blur(4px)',
          transition: 'filter 0.5s ease-in-out'
        }}
      />
    </div>
  );
};

export default MathVisual;