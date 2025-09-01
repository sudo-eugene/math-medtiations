import type { NatureScene, SceneParams } from "@/lib/animations";

// High-performance 3D torus field dynamics with interactive dispersion
// Based on the TorusEnergyFlow example but adapted to our NatureScene interface

let container: HTMLDivElement | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let currentParams: SceneParams = {};
let animationId: number | null = null;

// Performance optimizations
const MAJOR_RADIUS = 120;
const TUBE_RADIUS = 100;
const MAJOR_SEGMENTS = 50;
const MINOR_SEGMENTS = 30;
const POLOIDAL_LINES = 8;
const TOROIDAL_LINES = 6;
const LINE_POINTS = 100;
const TWO_PI = Math.PI * 2;

// Pre-computed lookup tables
let sinTable: Float32Array;
let cosTable: Float32Array;
let nodes: {
  positions: Float32Array;
  original: Float32Array;
  velocity: Float32Array;
  params: Float32Array;
  dispersing: Uint8Array;
} | null = null;

let flowLines: {
  points: Float32Array;
  progress: Float32Array;
  metadata: Array<{
    type: 'poloidal' | 'toroidal';
    offset: number;
    color: string;
    startIdx: number;
  }>;
} | null = null;

let mousePos = { x: 0, y: 0 };
let time = Math.PI;

function initTrigTables() {
  if (sinTable) return;
  
  const tableSize = 628; // 2π * 100
  sinTable = new Float32Array(tableSize);
  cosTable = new Float32Array(tableSize);
  
  for (let i = 0; i < tableSize; i++) {
    const angle = i / 100;
    sinTable[i] = Math.sin(angle);
    cosTable[i] = Math.cos(angle);
  }
}

function fastSin(angle: number): number {
  const index = Math.floor((angle % TWO_PI) * 100) % 628;
  return sinTable[index];
}

function fastCos(angle: number): number {
  const index = Math.floor((angle % TWO_PI) * 100) % 628;
  return cosTable[index];
}

function initNodes() {
  const nodeCount = MAJOR_SEGMENTS * MINOR_SEGMENTS;
  nodes = {
    positions: new Float32Array(nodeCount * 3),
    original: new Float32Array(nodeCount * 3),
    velocity: new Float32Array(nodeCount * 3),
    params: new Float32Array(nodeCount * 3),
    dispersing: new Uint8Array(nodeCount)
  };
  
  let idx = 0;
  for (let i = 0; i < MAJOR_SEGMENTS; i++) {
    const u = (i / MAJOR_SEGMENTS) * TWO_PI;
    
    for (let j = 0; j < MINOR_SEGMENTS; j++) {
      const v = (j / MINOR_SEGMENTS) * TWO_PI;
      
      const x = (MAJOR_RADIUS + TUBE_RADIUS * fastCos(v)) * fastCos(u);
      const y = (MAJOR_RADIUS + TUBE_RADIUS * fastCos(v)) * fastSin(u);
      const z = TUBE_RADIUS * fastSin(v);
      
      const posOffset = idx * 3;
      nodes.positions[posOffset] = x;
      nodes.positions[posOffset + 1] = y;
      nodes.positions[posOffset + 2] = z;
      
      nodes.original[posOffset] = x;
      nodes.original[posOffset + 1] = y;
      nodes.original[posOffset + 2] = z;
      
      nodes.params[posOffset] = u;
      nodes.params[posOffset + 1] = v;
      nodes.params[posOffset + 2] = 0; // disperseTime
      
      idx++;
    }
  }
}

function initFlowLines() {
  const totalLines = POLOIDAL_LINES + TOROIDAL_LINES;
  const pointsPerLine = LINE_POINTS + 1;
  
  flowLines = {
    points: new Float32Array(totalLines * pointsPerLine * 3),
    progress: new Float32Array(totalLines * pointsPerLine),
    metadata: []
  };
  
  let lineIdx = 0;
  
  // Poloidal lines
  for (let i = 0; i < POLOIDAL_LINES; i++) {
    const u = (i / POLOIDAL_LINES) * TWO_PI;
    flowLines.metadata.push({
      type: 'poloidal',
      offset: i / POLOIDAL_LINES,
      color: 'rgba(80, 80, 80, 0.3)',
      startIdx: lineIdx * pointsPerLine
    });
    
    for (let j = 0; j <= LINE_POINTS; j++) {
      const v = (j / LINE_POINTS) * TWO_PI;
      const pointIdx = (lineIdx * pointsPerLine + j) * 3;
      
      flowLines.points[pointIdx] = (MAJOR_RADIUS + TUBE_RADIUS * fastCos(v)) * fastCos(u);
      flowLines.points[pointIdx + 1] = (MAJOR_RADIUS + TUBE_RADIUS * fastCos(v)) * fastSin(u);
      flowLines.points[pointIdx + 2] = TUBE_RADIUS * fastSin(v);
      
      flowLines.progress[lineIdx * pointsPerLine + j] = j / LINE_POINTS;
    }
    lineIdx++;
  }
  
  // Toroidal lines
  for (let i = 0; i < TOROIDAL_LINES; i++) {
    const v = (i / TOROIDAL_LINES) * TWO_PI;
    flowLines.metadata.push({
      type: 'toroidal',
      offset: i / TOROIDAL_LINES,
      color: 'rgba(120, 120, 120, 0.3)',
      startIdx: lineIdx * pointsPerLine
    });
    
    for (let j = 0; j <= LINE_POINTS; j++) {
      const u = (j / LINE_POINTS) * TWO_PI;
      const pointIdx = (lineIdx * pointsPerLine + j) * 3;
      
      flowLines.points[pointIdx] = (MAJOR_RADIUS + TUBE_RADIUS * fastCos(v)) * fastCos(u);
      flowLines.points[pointIdx + 1] = (MAJOR_RADIUS + TUBE_RADIUS * fastCos(v)) * fastSin(u);
      flowLines.points[pointIdx + 2] = TUBE_RADIUS * fastSin(v);
      
      flowLines.progress[lineIdx * pointsPerLine + j] = j / LINE_POINTS;
    }
    lineIdx++;
  }
}

function project3DPoint(x: number, y: number, z: number, rotationX: number, rotationY: number): [number, number, number, number] {
  const sinRotX = fastSin(rotationX);
  const cosRotX = fastCos(rotationX);
  const sinRotY = fastSin(rotationY);
  const cosRotY = fastCos(rotationY);
  
  const rotatedY = y * cosRotX - z * sinRotX;
  const rotatedZ = y * sinRotX + z * cosRotX;
  
  const rotatedX = x * cosRotY + rotatedZ * sinRotY;
  const finalZ = -x * sinRotY + rotatedZ * cosRotY;
  
  const scale = 500 / (500 + finalZ);
  
  return [
    rotatedX * scale + (canvas?.width || 550) / 2,
    rotatedY * scale + (canvas?.height || 550) / 2,
    finalZ,
    scale
  ];
}

function animate() {
  if (!ctx || !canvas || !nodes || !flowLines) return;
  // After the guard above, safely capture non-null references for type narrowing
  const nodeData = nodes!;
  const lineData = flowLines!;
  const g = ctx!;

  const bg = currentParams.background || '#F0EEE6';
  g.fillStyle = bg;
  g.fillRect(0, 0, canvas.width, canvas.height);
  
  time += 0.001;
  
  const rotationX = Math.PI * 0.3;
  const rotationY = time;
  
  // Update mouse interaction
  const nodeCount = MAJOR_SEGMENTS * MINOR_SEGMENTS;
  const candidateNodes: Array<{ index: number; distance: number }> = [];
  
  for (let i = 0; i < nodeCount; i++) {
    if (!nodeData.dispersing[i]) {
      const posOffset = i * 3;
      const [projX, projY] = project3DPoint(
        nodeData.positions[posOffset],
        nodeData.positions[posOffset + 1],
        nodeData.positions[posOffset + 2],
        rotationX,
        rotationY
      );
      
      const distanceToMouse = Math.hypot(projX - mousePos.x, projY - mousePos.y);
      
      if (distanceToMouse < 60) {
        candidateNodes.push({ index: i, distance: distanceToMouse });
      }
    }
  }
  
  // Handle node dispersion
  candidateNodes.sort((a, b) => a.distance - b.distance);
  candidateNodes.slice(0, 5).forEach(({ index }) => {
    const posOffset = index * 3;
    const paramOffset = index * 3;
    
    nodeData.dispersing[index] = 1;
    nodeData.params[paramOffset + 2] = 0; // Reset disperseTime
    
    const u = nodeData.params[paramOffset];
    const v = nodeData.params[paramOffset + 1];
    
    const normalX = fastCos(u) * fastCos(v);
    const normalY = fastSin(u) * fastCos(v);
    const normalZ = fastSin(v);
    
    nodeData.velocity[posOffset] = normalX * 3;
    nodeData.velocity[posOffset + 1] = normalY * 3;
    nodeData.velocity[posOffset + 2] = normalZ * 3;
  });
  
  // Update dispersing nodes
  for (let i = 0; i < nodeCount; i++) {
    if (nodeData.dispersing[i]) {
      const posOffset = i * 3;
      const paramOffset = i * 3;
      
      nodeData.params[paramOffset + 2] += 0.02;
      
      nodeData.positions[posOffset] += nodeData.velocity[posOffset];
      nodeData.positions[posOffset + 1] += nodeData.velocity[posOffset + 1];
      nodeData.positions[posOffset + 2] += nodeData.velocity[posOffset + 2];
      
      nodeData.velocity[posOffset] *= 0.96;
      nodeData.velocity[posOffset + 1] *= 0.96;
      nodeData.velocity[posOffset + 2] *= 0.96;
      
      if (nodeData.params[paramOffset + 2] > 4) {
        nodeData.dispersing[i] = 0;
        nodeData.positions[posOffset] = nodeData.original[posOffset];
        nodeData.positions[posOffset + 1] = nodeData.original[posOffset + 1];
        nodeData.positions[posOffset + 2] = nodeData.original[posOffset + 2];
        nodeData.velocity[posOffset] = 0;
        nodeData.velocity[posOffset + 1] = 0;
        nodeData.velocity[posOffset + 2] = 0;
      }
    }
  }
  
  // Draw flow lines
  lineData.metadata.forEach((line) => {
    const startIdx = line.startIdx;
    const pointCount = LINE_POINTS + 1;
    
    g.strokeStyle = line.color;
    g.lineWidth = 1.5;
    g.setLineDash([5, 10]);
    g.beginPath();
    
    for (let i = 0; i < pointCount; i++) {
      const pointIdx = (startIdx + i) * 3;
      const [projX, projY] = project3DPoint(
        lineData.points[pointIdx],
        lineData.points[pointIdx + 1],
        lineData.points[pointIdx + 2],
        rotationX,
        rotationY
      );
      
      if (i === 0) {
        g.moveTo(projX, projY);
      } else {
        g.lineTo(projX, projY);
      }
    }
    
    if (line.type === 'toroidal') {
      g.closePath();
    }
    
    g.stroke();
    g.setLineDash([]);
  });
  
  // Draw nodes with depth sorting
  const projectedNodes: Array<{ x: number; y: number; z: number; scale: number; index: number }> = [];
  
  for (let i = 0; i < nodeCount; i++) {
    const posOffset = i * 3;
    const [projX, projY, projZ, scale] = project3DPoint(
      nodeData.positions[posOffset],
      nodeData.positions[posOffset + 1],
      nodeData.positions[posOffset + 2],
      rotationX,
      rotationY
    );
    
    projectedNodes.push({ x: projX, y: projY, z: projZ, scale, index: i });
  }
  
  projectedNodes.sort((a, b) => b.z - a.z);
  
  for (const node of projectedNodes) {
    const alpha = nodeData.dispersing[node.index] ? 
      0.3 * node.scale * (1 - nodeData.params[node.index * 3 + 2] / 4) : 
      0.7 * node.scale;
    
    const size = 0.8 + 0.3 * node.scale;
    const shade = 50 + Math.floor(node.scale * 30);
    
    g.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${alpha})`;
    g.beginPath();
    g.arc(node.x, node.y, size, 0, TWO_PI);
    g.fill();
  }
  
  // Draw central void
  g.strokeStyle = 'rgba(0, 0, 0, 0.05)';
  g.lineWidth = 1;
  g.beginPath();
  g.arc(canvas.width / 2, canvas.height / 2, 30, 0, TWO_PI);
  g.stroke();
  
  animationId = requestAnimationFrame(animate);
}

function handleMouseMove(event: MouseEvent) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  mousePos.x = event.clientX - rect.left;
  mousePos.y = event.clientY - rect.top;
}

const scene: NatureScene = {
  metadata: { key: "advanced.torus_field", title: "Torus Energy Field", family: "advanced" },
  
  mount(el: HTMLDivElement, params: SceneParams) {
    container = el;
    currentParams = { ...params };
    
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D not supported");
    
    canvas.width = 550;
    canvas.height = 550;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.cursor = "crosshair";
    
    el.appendChild(canvas);
    
    canvas.addEventListener('mousemove', handleMouseMove);
    
    initTrigTables();
    initNodes();
    initFlowLines();
    
    mousePos = { x: canvas.width / 2, y: canvas.height / 2 };
    time = Math.PI;
    
    animate();
  },
  
  update(t: number) {
    // Animation is handled by internal RAF loop
  },
  
  resize() {
    if (!container || !canvas) return;
    // Keep fixed size for performance
  },
  
  dispose() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    
    if (canvas) {
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
    }
    
    container = null;
    canvas = null;
    ctx = null;
    currentParams = {};
    nodes = null;
    flowLines = null;
    sinTable = null as any;
    cosTable = null as any;
  }
};

export default scene;
