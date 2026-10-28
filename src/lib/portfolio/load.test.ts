import { describe, expect, it, vi } from "vitest";
import { parsePortfolioConfig } from "@/lib/config/schema";
import type { GitHubClient } from "@/lib/github/client";
import type { GitHubRepo, LanguageBytes } from "@/lib/github/types";
import { makeRepo, makeUser } from "../../../test/fixtures";
import { loadPortfolio } from "./load";

const LANGUAGES: Record<string, LanguageBytes> = {
  alpha: { TypeScript: 300, CSS: 100 },
  beta: { Kotlin: 400 },
  hidden: { Python: 9999 },
  forked: { Go: 9999 },
};

function fakeClient(repos: GitHubRepo[], readmes: Record<string, string | null> = {}) {
  return {
    getProfile: vi.fn(async () => makeUser({ name: null })),
    getPublicRepos: vi.fn(async () => repos),
    getLanguages: vi.fn(async (repo: GitHubRepo) => LANGUAGES[repo.name] ?? {}),
    getReadme: vi.fn(async (repo: GitHubRepo) => readmes[repo.name] ?? null),
  } satisfies GitHubClient;
}

const REPOS = [
  makeRepo({ name: "alpha", pushed_at: "2026-01-01T00:00:00Z" }),
  makeRepo({ name: "beta", pushed_at: "2026-03-01T00:00:00Z" }),
  makeRepo({ name: "hidden" }),
  makeRepo({ name: "forked", fork: true }),
];

const CONFIG = parsePortfolioConfig({
  profile: { bio: "Bio propia" },
  links: { github: "https://github.com/Rubenpd66", email: "a@b.es" },
  featured: [{ repo: "alpha" }],
  excluded: ["hidden"],
  privateProjects: [{ slug: "app-privada", title: "App privada", technologies: ["Kotlin"] }],
});

describe("loadPortfolio", () => {
  it("composes profile, links, projects, featured and stack", async () => {
    const client = fakeClient(REPOS, { alpha: "# Alpha\n\nResumen de alpha." });
    const data = await loadPortfolio(client, CONFIG);

    expect(data.profile).toMatchObject({ name: "Rubenpd66", bio: "Bio propia" });
    expect(data.links).toEqual(CONFIG.links);
    expect(data.projects.map((p) => p.slug)).toEqual(["beta", "alpha"]);
    expect(data.featured.map((f) => [f.kind, f.slug])).toEqual([
      ["public", "alpha"],
      ["private", "app-privada"],
    ]);
    expect(data.featured[0]).toMatchObject({ summary: "Resumen de alpha." });
    expect(data.stack.map((s) => s.name)).toEqual(["Kotlin", "TypeScript", "CSS"]);
  });

  it("only requests languages for visible repos", async () => {
    const client = fakeClient(REPOS);
    await loadPortfolio(client, CONFIG);

    const queried = client.getLanguages.mock.calls.map(([repo]) => repo.name);
    expect(queried.sort()).toEqual(["alpha", "beta"]);
  });

  it("only requests READMEs for featured public repos", async () => {
    const client = fakeClient(REPOS);
    await loadPortfolio(client, CONFIG);

    expect(client.getReadme.mock.calls.map(([repo]) => repo.name)).toEqual(["alpha"]);
  });

  it("never queries a private repo even if the client returns one", async () => {
    const client = fakeClient([...REPOS, makeRepo({ name: "secret", private: true })]);
    const config = parsePortfolioConfig({ ...CONFIG, featured: [{ repo: "secret" }] });
    const data = await loadPortfolio(client, config);

    const touched = [...client.getLanguages.mock.calls, ...client.getReadme.mock.calls].map(
      ([repo]) => repo.name,
    );
    expect(touched).not.toContain("secret");
    expect(data.projects.map((p) => p.slug)).not.toContain("secret");
  });

  it("keeps the full README with the context needed to resolve its URLs", async () => {
    const repos = [makeRepo({ name: "Alpha", default_branch: "develop" })];
    const config = parsePortfolioConfig({ ...CONFIG, featured: [{ repo: "alpha" }] });
    const data = await loadPortfolio(fakeClient(repos, { Alpha: "# Alpha\n\nTexto." }), config);

    expect(data.featured[0]).toMatchObject({
      kind: "public",
      readme: {
        markdown: "# Alpha\n\nTexto.",
        context: { owner: "Rubenpd66", repo: "Alpha", branch: "develop" },
      },
    });
  });

  it("keeps a null summary when the featured repo has no README", async () => {
    const data = await loadPortfolio(fakeClient(REPOS), CONFIG);
    expect(data.featured[0]).toMatchObject({ kind: "public", summary: null });
  });

  it("degrades a single repo when its per-repo requests fail", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const client = fakeClient(REPOS, { alpha: "Texto" });
    client.getLanguages.mockImplementation(async (repo) => {
      if (repo.name === "alpha") throw new Error("503");
      return LANGUAGES[repo.name] ?? {};
    });
    client.getReadme.mockRejectedValueOnce(new Error("403"));

    const data = await loadPortfolio(client, CONFIG);

    const alpha = data.projects.find((p) => p.slug === "alpha");
    expect(alpha?.languages).toEqual(["TypeScript"]);
    expect(data.stack.map((s) => s.name)).toEqual(["Kotlin"]);
    expect(data.featured[0]).toMatchObject({ slug: "alpha", summary: null });
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it("propagates failures of the profile or repo list", async () => {
    const client = fakeClient(REPOS);
    client.getPublicRepos.mockRejectedValueOnce(new Error("boom"));
    await expect(loadPortfolio(client, CONFIG)).rejects.toThrow("boom");
  });
});
