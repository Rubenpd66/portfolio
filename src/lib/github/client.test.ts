import { describe, expect, it, vi } from "vitest";
import { makeRepo, makeUser } from "../../../test/fixtures";
import { createGitHubClient, GitHubApiError } from "./client";

const TOKEN = "github_pat_" + "T".repeat(40);
const ENV = { token: TOKEN, username: "Rubenpd66" };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function setup(...responses: Response[]) {
  const fetchFn = vi.fn<typeof fetch>();
  for (const response of responses) fetchFn.mockResolvedValueOnce(response);
  return { fetchFn, client: createGitHubClient(ENV, fetchFn) };
}

function calledUrl(fetchFn: ReturnType<typeof vi.fn<typeof fetch>>, call = 0): string {
  return String(fetchFn.mock.calls[call]?.[0]);
}

describe("createGitHubClient", () => {
  it("sends the token only in the Authorization header", async () => {
    const { fetchFn, client } = setup(json(makeUser()));
    await client.getProfile();

    const [url, init] = fetchFn.mock.calls[0] ?? [];
    expect(String(url)).not.toContain(TOKEN);
    const headers = new Headers(init?.headers);
    expect(headers.get("Authorization")).toBe(`Bearer ${TOKEN}`);
    expect(headers.get("X-GitHub-Api-Version")).toBe("2022-11-28");
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  describe("getProfile", () => {
    it("parses the user and drops unknown fields", async () => {
      const { fetchFn, client } = setup(json({ ...makeUser(), email: "x@y.z", id: 1 }));
      const user = await client.getProfile();

      expect(calledUrl(fetchFn)).toBe("https://api.github.com/users/Rubenpd66");
      expect(user).toEqual(makeUser());
    });

    it("rejects a response with an unexpected shape", async () => {
      const { client } = setup(json({ login: 42 }));
      await expect(client.getProfile()).rejects.toThrow(/respuesta inesperada/i);
    });

    it("throws a GitHubApiError with the status and no token", async () => {
      const { client } = setup(json({ message: "Bad credentials" }, 401));
      const error = await client.getProfile().catch((e: unknown) => e);

      expect(error).toBeInstanceOf(GitHubApiError);
      expect(error).toMatchObject({ status: 401, path: "/users/Rubenpd66" });
      expect(String(error)).not.toContain(TOKEN);
    });
  });

  describe("getPublicRepos", () => {
    it("requests owner repos and follows pagination until a short page", async () => {
      const fullPage = Array.from({ length: 100 }, (_, i) => makeRepo({ name: `r${i}` }));
      const { fetchFn, client } = setup(json(fullPage), json([makeRepo({ name: "last" })]));

      const repos = await client.getPublicRepos();

      expect(repos).toHaveLength(101);
      expect(fetchFn).toHaveBeenCalledTimes(2);
      const first = new URL(calledUrl(fetchFn, 0));
      expect(first.pathname).toBe("/users/Rubenpd66/repos");
      expect(first.searchParams.get("type")).toBe("owner");
      expect(first.searchParams.get("per_page")).toBe("100");
      expect(new URL(calledUrl(fetchFn, 1)).searchParams.get("page")).toBe("2");
    });

    it("stops after the page limit and warns about the truncation", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const fullPage = Array.from({ length: 100 }, (_, i) => makeRepo({ name: `r${i}` }));
      const fetchFn = vi.fn<typeof fetch>(async () => json(fullPage));
      const client = createGitHubClient(ENV, fetchFn);

      await client.getPublicRepos();
      expect(fetchFn).toHaveBeenCalledTimes(10);
      expect(warn).toHaveBeenCalledWith(expect.stringMatching(/truncada/));
      warn.mockRestore();
    });

    it("names the offending field without echoing values", async () => {
      const { client } = setup(json([{ ...makeRepo(), html_url: "javascript:alert(1)" }]));
      const error = await client.getPublicRepos().catch((e: unknown) => String(e));
      expect(error).toMatch(/campo 0\.html_url/);
      expect(error).not.toContain("javascript");
    });

    it("never returns private repos even if the API sends them", async () => {
      const { client } = setup(
        json([makeRepo({ name: "pub" }), makeRepo({ name: "secret", private: true })]),
      );
      const repos = await client.getPublicRepos();
      expect(repos.map((repo) => repo.name)).toEqual(["pub"]);
    });

    it("defaults missing topics to an empty list", async () => {
      // JSON.stringify drops undefined, so the payload has no "topics" key at all.
      const { client } = setup(json([{ ...makeRepo(), topics: undefined }]));
      const [repo] = await client.getPublicRepos();
      expect(repo?.topics).toEqual([]);
    });
  });

  describe("getLanguages", () => {
    it("returns bytes per language with encoded path segments", async () => {
      const { fetchFn, client } = setup(json({ TypeScript: 1200, CSS: 300 }));
      const languages = await client.getLanguages(makeRepo({ name: "my repo" }));

      expect(languages).toEqual({ TypeScript: 1200, CSS: 300 });
      expect(calledUrl(fetchFn)).toBe("https://api.github.com/repos/Rubenpd66/my%20repo/languages");
    });

    it("refuses to query a private repo", async () => {
      const { fetchFn, client } = setup();
      await expect(client.getLanguages(makeRepo({ private: true }))).rejects.toThrow(/privado/);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it("refuses a repo whose visibility is unknown", async () => {
      const { fetchFn, client } = setup();
      const repo = { ...makeRepo(), private: undefined as unknown as boolean };
      await expect(client.getLanguages(repo)).rejects.toThrow(/privado/);
      expect(fetchFn).not.toHaveBeenCalled();
    });
  });

  describe("getReadme", () => {
    it("returns the raw markdown", async () => {
      const { fetchFn, client } = setup(new Response("# Hola\n\nTexto", { status: 200 }));
      const readme = await client.getReadme(makeRepo({ name: "demo" }));

      expect(readme).toBe("# Hola\n\nTexto");
      expect(calledUrl(fetchFn)).toBe("https://api.github.com/repos/Rubenpd66/demo/readme");
      const headers = new Headers(fetchFn.mock.calls[0]?.[1]?.headers);
      expect(headers.get("Accept")).toBe("application/vnd.github.raw+json");
    });

    it("caps oversized READMEs", async () => {
      const { client } = setup(new Response("a".repeat(300_000), { status: 200 }));
      const readme = await client.getReadme(makeRepo());
      expect(readme).toHaveLength(200_000);
    });

    it("returns null when the repo has no README", async () => {
      const { client } = setup(json({ message: "Not Found" }, 404));
      await expect(client.getReadme(makeRepo())).resolves.toBeNull();
    });

    it("propagates other errors", async () => {
      const { client } = setup(json({ message: "rate limited" }, 403));
      await expect(client.getReadme(makeRepo())).rejects.toBeInstanceOf(GitHubApiError);
    });

    it("refuses to read the README of a private repo", async () => {
      const { fetchFn, client } = setup();
      await expect(client.getReadme(makeRepo({ private: true }))).rejects.toThrow(/privado/);
      expect(fetchFn).not.toHaveBeenCalled();
    });
  });
});
