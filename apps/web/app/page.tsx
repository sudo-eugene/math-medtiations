import EntryView from "@/components/EntryView";
import { getTodayId, getEntryById, formatId } from "@/lib/content";

export default function Page() {
  const today = getTodayId();
  const entry = getEntryById(today) || getEntryById(1)!;
  const idStr = formatId(entry.id);
  return <EntryView entry={entry} idStr={idStr} />;
}
