export type Entry = {
  id: number;
  date?: string;
  title: string;
  quoteText: string;
  quoteAuthor: string;
  source?: string;
  animationKey: string;
  params?: Record<string, any>;
  palette?: { bg: string; fg: string; accent?: string };
  caption?: string;
  tags?: string[];
  seo?: { slug?: string; description?: string };
  licenses?: { quote?: string };
};

import { generated365Entries } from "@/lib/entries-generator";

export const entries: Entry[] = generated365Entries;
