"use client";
import React from "react";
import Link from "next/link";
import StaticArtHost from "@/components/StaticArtHost";
import type { Entry } from "@/content/entries";

type Props = {
  entry: Entry;
  idStr: string;
};

export default function EntryView({ entry, idStr }: Props) {
  const palette = entry.palette || { bg: "#F7F5EE", fg: "#1E1E1C" };
  const currentId = entry.id;
  const nextId = currentId >= 365 ? 1 : currentId + 1;
  const nextIdStr = String(nextId).padStart(3, "0");
  return (
    <section
      className="min-h-[calc(100vh-3.5rem)]"
      style={{ background: palette.bg, color: palette.fg }}
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-12 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
          {/* Left: animation square */}
          <div className="w-full max-w-[560px] mx-auto">
            <div className="relative aspect-square bg-[var(--bg)]">
              <StaticArtHost
                artKey={entry.animationKey}
                params={entry.params}
                className="absolute inset-0"
              />
            </div>
          </div>

          {/* Right: quote column */}
          <div className="grid grid-cols-[auto_1fr] gap-6 items-start text-[17px] leading-8">
            <div className="font-mono tracking-widest text-sm select-none mt-1 opacity-80">
              {idStr}
            </div>
            <div>
              <blockquote className="font-serif whitespace-pre-line">
                {entry.quoteText}
              </blockquote>
              <cite className="block mt-3 text-sm opacity-80 font-serif">
                {entry.quoteAuthor}
              </cite>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <Link
            href={`/day/${nextIdStr}`}
            className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white/70 px-3 py-1.5 text-sm hover:bg-white/90"
          >
            Next day <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
