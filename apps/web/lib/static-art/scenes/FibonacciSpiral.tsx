import React from "react";

type Props = { params?: Record<string, any> };

// Renders an approximate Fibonacci spiral using golden rectangles and quarter-arcs
export default function FibonacciSpiral({ params }: Props) {
  const size = 1000;
  const bg = params?.background || "#FFFFFF";
  const fg = params?.fg || "#111111";
  const accent = params?.accent || fg;
  const lineWidth = params?.lineWidth ?? 6;
  const turns = Math.max(6, Math.min(13, params?.turns ?? 9));

  // Build rectangles sizes following Fibonacci sequence
  const fib = [1, 1];
  for (let i = 2; i < turns; i++) fib.push(fib[i - 1] + fib[i - 2]);
  const scale = size / (fib[turns - 1] + fib[turns - 2]);

  // We'll place squares starting from bottom-left, alternating direction
  let x = 0,
    y = size - fib[0] * scale;
  let dir = 0; // 0:right,1:up,2:left,3:down

  const squares: { x: number; y: number; s: number; a: number }[] = [];
  for (let i = 0; i < turns; i++) {
    const s = fib[i] * scale;
    squares.push({ x, y, s, a: dir });
    switch (dir) {
      case 0:
        x += s;
        y -= fib[i + 1] ? fib[i + 1] * scale : 0;
        break;
      case 1:
        y -= s;
        x -= fib[i + 1] ? fib[i + 1] * scale : 0;
        break;
      case 2:
        x -= s;
        y += fib[i + 1] ? fib[i + 1] * scale : 0;
        break;
      case 3:
        y += s;
        x += fib[i + 1] ? fib[i + 1] * scale : 0;
        break;
    }
    dir = (dir + 1) % 4;
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{ display: "block", background: bg }}>
      <g fill="none" stroke={accent} strokeWidth={lineWidth}>
        {squares.map((sq, i) => {
          // draw quarter-arc inside each square following direction
          const r = sq.s;
          const cx = sq.x + (sq.a === 0 || sq.a === 3 ? 0 : r);
          const cy = sq.y + (sq.a === 0 || sq.a === 1 ? r : 0);
          // arc sweep depending on direction
          const start = sq.a === 0 ? [sq.x, sq.y + r] : sq.a === 1 ? [sq.x, sq.y] : sq.a === 2 ? [sq.x + r, sq.y] : [sq.x + r, sq.y + r];
          const end = sq.a === 0 ? [sq.x + r, sq.y] : sq.a === 1 ? [sq.x + r, sq.y + r] : sq.a === 2 ? [sq.x, sq.y + r] : [sq.x, sq.y];
          return (
            <path
              key={i}
              d={`M ${start[0]} ${start[1]} A ${r} ${r} 0 0 ${sq.a === 0 || sq.a === 2 ? 0 : 1} ${end[0]} ${end[1]}`}
            />
          );
        })}
      </g>
      {/* Frame */}
      <rect x={20} y={20} width={size - 40} height={size - 40} fill="none" stroke={fg} strokeOpacity={0.1} />
    </svg>
  );
}
