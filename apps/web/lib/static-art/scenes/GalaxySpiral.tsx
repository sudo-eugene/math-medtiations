import React from "react";

type Props = { params?: Record<string, any> };

export default function GalaxySpiral({ params }: Props) {
  const size = 1000;
  const bg = params?.background || "#0B1020";
  const star = params?.fg || "#E6EEF8";
  const armColor = params?.accent || star;
  const starCount = Math.max(800, Math.min(4000, params?.starCount ?? 2000));
  const arms = Math.max(2, Math.min(6, params?.arms ?? 3));
  const spread = Math.max(0.1, Math.min(0.9, params?.spread ?? 0.45));

  // Deterministic RNG based on provided seed
  const seedBase = ((params?.seed ?? 1) * 2654435761) >>> 0; // Knuth constant
  let s = seedBase ^ 0x9e3779b9;
  const rand = () => {
    // xorshift32
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1000000) / 1000000; // [0,1)
  };

  const stars: { x: number; y: number; r: number; c: string; o: number }[] = [];
  for (let i = 0; i < starCount; i++) {
    const a = (i % arms) * ((2 * Math.PI) / arms);
    const t = i / starCount * 8 * Math.PI; // spiral turns
    const angle = a + t;
    const radius = (size * 0.02) + (size * 0.45) * (i / starCount) + (rand() - 0.5) * (spread * 30);
    const x = size / 2 + radius * Math.cos(angle + (rand() - 0.5) * spread);
    const y = size / 2 + radius * Math.sin(angle + (rand() - 0.5) * spread);
    const r = rand() * 1.6 + 0.4;
    const o = 0.5 + rand() * 0.5;
    const c = rand() < 0.85 ? star : armColor;
    stars.push({ x, y, r, c, o });
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{ display: "block", background: bg }}>
      <rect x={0} y={0} width={size} height={size} fill={bg} />
      <g>
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.c} fillOpacity={s.o} />
        ))}
      </g>
      <circle cx={size/2} cy={size/2} r={size*0.48} fill="none" stroke={star} strokeOpacity={0.06} />
    </svg>
  );
}
