import "./globals.css";
import React from "react";

export const metadata = {
  title: "Math Meditations",
  description: "365 daily meditations with generative nature",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[var(--bg)] text-[var(--fg)]">
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 backdrop-blur bg-white/40 border-b border-black/5">
          <a href="/" className="font-mono tracking-widest text-sm">Math Meditations</a>
          <nav className="flex gap-4 text-sm">
            <a href="/">Today</a>
            <a href="/random">Random</a>
            <a href="/days">Days</a>
            <a href="/about">About</a>
          </nav>
        </header>
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
      </body>
    </html>
  );
}
