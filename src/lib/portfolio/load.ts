import "server-only";
import type { PortfolioConfig } from "@/lib/config/schema";
import type { GitHubClient } from "@/lib/github/client";
import type { GitHubRepo } from "@/lib/github/types";
import { buildFeatured, resolveProfile } from "@/lib/projects/featured";
import { sortProjects } from "@/lib/projects/query";
import { computeStack } from "@/lib/projects/stack";
import { repoSlug, selectVisible, toProject } from "@/lib/projects/transform";
import type { FeaturedProject, Profile, Project, StackEntry } from "@/lib/projects/types";
import { summarizeReadme } from "@/lib/readme/summary";
import { mapSettled } from "@/lib/utils/concurrency";

/** Keeps per-repo requests well below GitHub's secondary rate limits. */
const MAX_CONCURRENT_REQUESTS = 6;

/** Everything the home page needs. Plain serializable data: safe to pass to client components. */
export interface PortfolioData {
  readonly profile: Profile;
  readonly links: PortfolioConfig["links"];
  readonly featured: readonly FeaturedProject[];
  /** Visible public repos, most recently updated first. */
  readonly projects: readonly Project[];
  readonly stack: readonly StackEntry[];
}

/**
 * Fetches and assembles the portfolio. Per-repo requests (languages, README) are made
 * only for repos that passed the visibility filter; private repos come from config alone.
 */
export async function loadPortfolio(
  client: GitHubClient,
  config: PortfolioConfig,
): Promise<PortfolioData> {
  const [user, repos] = await Promise.all([client.getProfile(), client.getPublicRepos()]);
  const visible = selectVisible(repos, config.excluded);

  const featuredSlugs = new Set(config.featured.map((entry) => repoSlug(entry.repo)));
  const featuredRepos = visible.filter((repo) => featuredSlugs.has(repoSlug(repo.name)));

  // One failing repo (403, 5xx...) degrades only that repo instead of the whole page.
  const [languageResults, readmeResults] = await Promise.all([
    mapSettled(visible, MAX_CONCURRENT_REQUESTS, (repo) => client.getLanguages(repo)),
    mapSettled(featuredRepos, MAX_CONCURRENT_REQUESTS, (repo) => client.getReadme(repo)),
  ]);
  const languageMaps = languageResults.map((result, i) => valueOr(result, {}, visible[i], "lenguajes"));
  const summaries = new Map(
    readmeResults.map((result, i) => {
      const readme = valueOr(result, null, featuredRepos[i], "README");
      return [repoSlug(featuredRepos[i]?.name ?? ""), readme === null ? null : summarizeReadme(readme)];
    }),
  );

  const projects = visible.map((repo, index) => toProject(repo, languageMaps[index] ?? {}));
  return {
    profile: resolveProfile(user, config.profile),
    links: config.links,
    featured: buildFeatured(config, projects, summaries),
    projects: sortProjects(projects, "updated"),
    stack: computeStack(languageMaps),
  };
}

function valueOr<T>(
  result: PromiseSettledResult<T> | undefined,
  fallback: T,
  repo: GitHubRepo | undefined,
  what: string,
): T {
  if (result?.status === "fulfilled") return result.value;
  const reason = result?.reason instanceof Error ? result.reason.message : "error desconocido";
  console.warn(`[portfolio] Sin ${what} para ${repo?.name ?? "?"}: ${reason}`);
  return fallback;
}
