import type { LanguageBytes } from "@/lib/github/types";
import type { StackEntry } from "./types";

interface StackOptions {
  limit?: number;
  /** Languages to leave out, case-insensitive. */
  ignore?: readonly string[];
}

/** Aggregates bytes of code per language across repos and returns each share as a percentage. */
export function computeStack(
  languageMaps: readonly LanguageBytes[],
  { limit, ignore = [] }: StackOptions = {},
): StackEntry[] {
  const ignored = new Set(ignore.map((name) => name.toLowerCase()));
  const totals = new Map<string, number>();
  for (const languages of languageMaps) {
    for (const [name, bytes] of Object.entries(languages)) {
      if (!ignored.has(name.toLowerCase())) totals.set(name, (totals.get(name) ?? 0) + bytes);
    }
  }

  const grandTotal = [...totals.values()].reduce((sum, bytes) => sum + bytes, 0);
  if (grandTotal === 0) return [];

  const entries = [...totals.entries()]
    .sort(([nameA, a], [nameB, b]) => b - a || (nameA < nameB ? -1 : nameA > nameB ? 1 : 0))
    .map(([name, bytes]) => ({ name, percent: Math.round((bytes / grandTotal) * 1000) / 10 }));
  return limit === undefined ? entries : entries.slice(0, Math.max(0, limit));
}
