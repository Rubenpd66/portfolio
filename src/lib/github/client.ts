import "server-only";
import { z } from "zod";
import type { GitHubEnv } from "./env";
import { githubRepoSchema, githubUserSchema, languageBytesSchema } from "./schemas";
import type { GitHubRepo, GitHubUser, LanguageBytes } from "./types";

const API_ORIGIN = "https://api.github.com";
const API_VERSION = "2022-11-28";
const JSON_ACCEPT = "application/vnd.github+json";
const RAW_ACCEPT = "application/vnd.github.raw+json";
const PAGE_SIZE = 100;
const MAX_PAGES = 10;
const TIMEOUT_MS = 10_000;
/** Bounds memory and page size; real READMEs are far smaller. */
const MAX_README_CHARS = 200_000;

export class GitHubApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`GitHub API respondió ${status} en ${path}`);
    this.name = "GitHubApiError";
  }
}

export interface GitHubClient {
  getProfile(): Promise<GitHubUser>;
  /** Public, owner-only repos. Private repos are filtered out even if the API returned them. */
  getPublicRepos(): Promise<GitHubRepo[]>;
  getLanguages(repo: GitHubRepo): Promise<LanguageBytes>;
  /** Raw README markdown, or null when the repo has none. */
  getReadme(repo: GitHubRepo): Promise<string | null>;
}

/**
 * Server-only GitHub REST client. The token travels only in the Authorization header
 * and never appears in URLs, errors or return values.
 */
export function createGitHubClient(
  { token, username }: GitHubEnv,
  fetchFn: typeof fetch = fetch,
): GitHubClient {
  const owner = encodeURIComponent(username);

  async function request(path: string, accept = JSON_ACCEPT): Promise<Response> {
    const response = await fetchFn(`${API_ORIGIN}${path}`, {
      headers: {
        Accept: accept,
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": API_VERSION,
        "User-Agent": "portfolio",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new GitHubApiError(response.status, path);
    }
    return response;
  }

  async function requestJson<T>(path: string, schema: z.ZodType<T, unknown>): Promise<T> {
    const response = await request(path);
    const result = schema.safeParse(await response.json());
    if (!result.success) {
      // Only the field path, never the received values.
      const field = result.error.issues[0]?.path.join(".") || "(raíz)";
      throw new Error(`GitHub API: respuesta inesperada en ${path} (campo ${field})`);
    }
    return result.data;
  }

  function repoPath(repo: GitHubRepo, suffix: string): string {
    // Fail closed: per-repo endpoints are only ever called for repos known to be public.
    if (repo.private !== false) {
      throw new Error("Acceso denegado: no se consulta el contenido de un repo privado");
    }
    return `/repos/${owner}/${encodeURIComponent(repo.name)}/${suffix}`;
  }

  return {
    getProfile: () => requestJson(`/users/${owner}`, githubUserSchema),

    async getPublicRepos() {
      const repos: GitHubRepo[] = [];
      for (let page = 1; page <= MAX_PAGES; page++) {
        const query = new URLSearchParams({
          type: "owner",
          sort: "pushed",
          per_page: String(PAGE_SIZE),
          page: String(page),
        });
        const batch = await requestJson(`/users/${owner}/repos?${query}`, z.array(githubRepoSchema));
        repos.push(...batch);
        if (batch.length < PAGE_SIZE) break;
        if (page === MAX_PAGES) {
          console.warn(`[portfolio] Lista de repos truncada a ${MAX_PAGES * PAGE_SIZE}`);
        }
      }
      return repos.filter((repo) => repo.private === false);
    },

    getLanguages: async (repo) => requestJson(repoPath(repo, "languages"), languageBytesSchema),

    async getReadme(repo) {
      const path = repoPath(repo, "readme");
      try {
        const readme = await (await request(path, RAW_ACCEPT)).text();
        return readme.length > MAX_README_CHARS ? readme.slice(0, MAX_README_CHARS) : readme;
      } catch (error) {
        if (error instanceof GitHubApiError && error.status === 404) return null;
        throw error;
      }
    },
  };
}
