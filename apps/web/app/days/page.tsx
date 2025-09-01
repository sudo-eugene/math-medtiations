import Link from "next/link";
import { getAllEntries, formatId } from "@/lib/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DaysPage() {
  const items = getAllEntries();
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">All Days</h1>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((e) => (
          <li key={e.id} className="border rounded p-3 bg-white/60">
            <Link href={`/day/${formatId(e.id)}`} className="block">
              <div className="text-xs opacity-70 mb-1">Day {formatId(e.id)}</div>
              <div className="font-medium">{e.title}</div>
              <div className="text-sm opacity-80 mt-1">{e.quoteAuthor}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
