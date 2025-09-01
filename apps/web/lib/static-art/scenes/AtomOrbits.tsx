import React from "react";

type Props = { params?: Record<string, any> };

export default function AtomOrbits({ params }: Props) {
  const size = 1000;
  const bg = params?.background || "#FFFFFF";
  const fg = params?.fg || "#111111";
  const accent = params?.accent || "#3366FF";
  const shells = Math.max(2, Math.min(6, params?.shells ?? 4));
  const electronsBase = params?.electronsBase ?? 2; // electrons grow per shell
  const seed = (params?.seed ?? 1) * 1337;
  const rng = (i: number) => ((Math.sin(seed + i * 12.9898) * 43758.5453) % 1 + 1) % 1;

  const nucleusR = size * 0.03;
  const orbitGap = (size * 0.42) / shells;

  const electrons: { x: number; y: number }[] = [];
  for (let s = 1; s <= shells; s++) {
    const r = s * orbitGap;
    const count = Math.max(2, Math.min(16, electronsBase * s));
    for (let e = 0; e < count; e++) {
      const angle = (2 * Math.PI * e) / count + rng(s * 100 + e) * 0.4;
      const x = size / 2 + r * Math.cos(angle);
      const y = size / 2 + r * Math.sin(angle);
      electrons.push({ x, y });
    }
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{ display: "block", background: bg }}>
      {/* Orbits */}
      <g fill="none" stroke={fg} strokeOpacity={0.2} strokeWidth={2}>
        {Array.from({ length: shells }, (_, i) => (
          <circle key={i} cx={size/2} cy={size/2} r={(i+1)*orbitGap} />
        ))}
      </g>
      {/* Electrons */}
      <g fill={accent} fillOpacity={0.9}>
        {electrons.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={6} />
        ))}
      </g>
      {/* Nucleus */}
      <circle cx={size/2} cy={size/2} r={nucleusR} fill={fg} fillOpacity={0.9} />
      <circle cx={size/2} cy={size/2} r={size*0.48} fill="none" stroke={fg} strokeOpacity={0.06} />
    </svg>
  );
}
