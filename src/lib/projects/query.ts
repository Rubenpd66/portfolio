import type { Project, SortKey } from "./types";

export function sortProjects(projects: readonly Project[], key: SortKey): Project[] {
  const byUpdated = (a: Project, b: Project) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
  const compare =
    key === "stars" ? (a: Project, b: Project) => b.stars - a.stars || byUpdated(a, b) : byUpdated;
  return [...projects].sort(compare);
}

/** Filters by language or topic (case-insensitive). `null` means no filter. */
export function filterByTech(projects: readonly Project[], tech: string | null): Project[] {
  if (!tech) return [...projects];
  const wanted = tech.toLowerCase();
  return projects.filter((project) =>
    [...project.languages, ...project.topics].some((t) => t.toLowerCase() === wanted),
  );
}

/**
 * Unique languages and topics for the filter, most frequent first, then alphabetical.
 * Case variants are merged, keeping the first spelling seen.
 */
export function listTechOptions(projects: readonly Project[]): string[] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const project of projects) {
    const seenInProject = new Set<string>();
    for (const label of [...project.languages, ...project.topics]) {
      const key = label.toLowerCase();
      if (seenInProject.has(key)) continue;
      seenInProject.add(key);
      const entry = counts.get(key);
      counts.set(key, { label: entry?.label ?? label, count: (entry?.count ?? 0) + 1 });
    }
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"))
    .map((entry) => entry.label);
}
