import { ImageResponse } from "next/og";
import { getEntryByIdString, formatId } from "@/lib/content";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Image({ params }: { params: { id: string } }) {
  const entry = getEntryByIdString(params.id);
  const idStr = formatId(Number(params.id) || 1);
  const title = entry?.title || "Daily Meditation";
  const quote = entry?.quoteText || "Generative nature and words";
  const author = entry?.quoteAuthor || "";
  const bg = entry?.palette?.bg || "#F7F5EE";
  const fg = entry?.palette?.fg || "#1E1E1C";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: bg,
          color: fg,
          padding: 48,
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 28, opacity: 0.8 }}>
          <div>Math Meditations</div>
          <div>Day {idStr}</div>
        </div>
        <div style={{ fontSize: 56, lineHeight: 1.2, fontStyle: "italic", maxWidth: 1000 }}>
          “{quote}”
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <div style={{ fontSize: 28, opacity: 0.85 }}>{author}</div>
          <div style={{ fontSize: 32, fontWeight: 600 }}>{title}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
