import type { GitHubRepo, LanguageBytes } from "@/lib/github/types";
import type { Project } from "./types";

export function repoSlug(repoName: string): string {
  return repoName.toLowerCase();
}

/** Keeps only repos that may be shown publicly: no forks, no private repos, none excluded. */
export function selectVisible(
  repos: readonly GitHubRepo[],
  excluded: readonly string[],
): GitHubRepo[] {
  const excludedSlugs = new Set(excluded.map(repoSlug));
  // Explicit `=== false` so a repo with missing fields is hidden (fail closed).
  return repos.filter(
    (repo) =>
      repo.fork === false && repo.private === false && !excludedSlugs.has(repoSlug(repo.name)),
  );
}

export function toProject(repo: GitHubRepo, languages: LanguageBytes): Project {
  return {
    slug: repoSlug(repo.name),
    name: repo.name,
    description: blankToNull(repo.description),
    repoUrl: repo.html_url,
    homepage: normalizeHomepage(repo.homepage),
    languages: orderLanguages(languages, repo.language),
    topics: [...repo.topics],
    stars: repo.stargazers_count,
    updatedAt: repo.pushed_at ?? repo.updated_at,
  };
}

function orderLanguages(languages: LanguageBytes, primary: string | null): string[] {
  const ordered = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .map(([name]) => name);
  if (ordered.length > 0) return ordered;
  return primary ? [primary] : [];
}

export function blankToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** GitHub lets users type any homepage; keep only http(s) URLs. */
function normalizeHomepage(value: string | null): string | null {
  const trimmed = blankToNull(value);
  if (!trimmed) return null;
  const hasAuthority = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed);
  // "example.com:8080" is a host with a port; "mailto:x" or "data:x" is a non-http scheme.
  if (!hasAuthority && /^[a-z][a-z\d+.-]*:(?!\d)/i.test(trimmed)) return null;
  try {
    const url = new URL(hasAuthority ? trimmed : `https://${trimmed}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}
