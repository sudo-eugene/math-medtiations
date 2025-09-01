import { entries, type Entry } from "@/content/entries";

export function getAllEntries(): Entry[] {
  return [...entries].sort((a, b) => a.id - b.id);
}

export function getEntryById(n: number): Entry | undefined {
  return entries.find((e) => e.id === n);
}

export function getEntryByIdString(id: string): Entry | undefined {
  const n = Number.parseInt(id, 10);
  if (!Number.isFinite(n)) return undefined;
  return getEntryById(n);
}

export function formatId(n: number): string {
  return String(n).padStart(3, "0");
}

export function getTodayId(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = Number(now) - Number(start);
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  // clamp to [1,365]
  return Math.max(1, Math.min(365, day));
}
