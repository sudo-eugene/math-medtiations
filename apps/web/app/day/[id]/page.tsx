import EntryView from "@/components/EntryView";
import { getEntryByIdString, formatId } from "@/lib/content";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props) {
  const entry = getEntryByIdString(params.id);
  const idStr = formatId(Number(params.id) || 1);
  const title = entry?.title ? `${idStr} — ${entry.title}` : `Day ${idStr}`;
  const description = entry?.seo?.description || entry?.caption || "Daily meditation";
  const url = `/day/${idStr}`;
  const ogImage = `${url}/opengraph-image`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  } as const;
}

export default function DayPage({ params }: Props) {
  const entry = getEntryByIdString(params.id);
  const idStr = formatId(Number(params.id) || 1);
  if (!entry) return null;
  return <EntryView entry={entry} idStr={idStr} />;
}
