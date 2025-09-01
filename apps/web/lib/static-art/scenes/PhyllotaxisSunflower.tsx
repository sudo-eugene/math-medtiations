import React from "react";

type Props = { params?: Record<string, any> };

export default function PhyllotaxisSunflower({ params }: Props) {
  const size = 1000;
  const bg = params?.background || "#FFFFFF";
  const fg = params?.fg || "#111111";
  const accent = params?.accent || "#D4A373";
  const secondary = params?.secondary || "#B08968";
  const count = Math.max(400, Math.min(2400, params?.pointCount ?? 1400));
  const angle = (params?.angle ?? 137.50776405) * (Math.PI / 180);
  const scale = params?.scale ?? 8.5;
  const r0 = params?.dotSize ?? 2.6;

  const points: { x: number; y: number; r: number; c: string }[] = [];
  for (let n = 0; n < count; n++) {
    const r = scale * Math.sqrt(n);
    const theta = n * angle;
    const x = size / 2 + r * Math.cos(theta);
    const y = size / 2 + r * Math.sin(theta);
    // color gradient from center to edge
    const t = n / count;
    const c = t < 0.6 ? accent : secondary;
    points.push({ x, y, r: r0 + t * 1.8, c });
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{ display: "block", background: bg }}>
      <g>
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.c} fillOpacity={0.9} />
        ))}
      </g>
      <circle cx={size/2} cy={size/2} r={size*0.48} fill="none" stroke={fg} strokeOpacity={0.06} />
    </svg>
  );
}
