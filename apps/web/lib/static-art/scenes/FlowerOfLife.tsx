import React from "react";

type Props = { params?: Record<string, any> };

// Classic Flower of Life pattern constructed from overlapping circles in a hex lattice
export default function FlowerOfLife({ params }: Props) {
  const size = 1000;
  const bg = params?.background || "#FFFFFF";
  const fg = params?.fg || "#111111";
  const accent = params?.accent || fg;
  const rings = Math.max(2, Math.min(6, params?.rings ?? 4));
  const strokeWidth = params?.strokeWidth ?? 2.5;

  // Base radius so that full shape fits the viewBox
  const R = (size * 0.42) / rings;

  type Pt = { x: number; y: number };
  const centers: Pt[] = [{ x: size / 2, y: size / 2 }];

  // Hex axial directions
  const dirs: Pt[] = [
    { x: 1, y: 0 },
    { x: 1/2, y: Math.sqrt(3)/2 },
    { x: -1/2, y: Math.sqrt(3)/2 },
    { x: -1, y: 0 },
    { x: -1/2, y: -Math.sqrt(3)/2 },
    { x: 1/2, y: -Math.sqrt(3)/2 },
  ];

  // Generate rings of centers
  for (let k = 1; k <= rings; k++) {
    // walk a hexagon of side k around the origin
    let cx = size / 2 + k * 2 * R * dirs[4].x;
    let cy = size / 2 + k * 2 * R * dirs[4].y;
    for (let side = 0; side < 6; side++) {
      const dx = 2 * R * dirs[side].x;
      const dy = 2 * R * dirs[side].y;
      for (let step = 0; step < k; step++) {
        centers.push({ x: cx, y: cy });
        cx += dx;
        cy += dy;
      }
    }
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{ display: "block", background: bg }}>
      <g fill="none" stroke={accent} strokeWidth={strokeWidth} strokeOpacity={0.9}>
        {centers.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={R} />
        ))}
      </g>
      <circle cx={size/2} cy={size/2} r={size*0.48} fill="none" stroke={fg} strokeOpacity={0.06} />
    </svg>
  );
}
