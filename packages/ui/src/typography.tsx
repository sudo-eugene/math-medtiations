import React from "react";

export function Quote({ children }: { children: React.ReactNode }) {
  return <blockquote className="italic">{children}</blockquote>;
}

export function Cite({ children }: { children: React.ReactNode }) {
  return <cite className="block mt-2 text-sm text-neutral-600">{children}</cite>;
}
