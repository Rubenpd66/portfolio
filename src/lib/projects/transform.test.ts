import { describe, expect, it } from "vitest";
import { makeRepo } from "../../../test/fixtures";
import { repoSlug, selectVisible, toProject } from "./transform";

describe("repoSlug", () => {
  it("lowercases the repo name", () => {
    expect(repoSlug("My_Repo.js")).toBe("my_repo.js");
  });
});

describe("selectVisible", () => {
  it("drops forks, private repos and excluded repos", () => {
    const repos = [
      makeRepo({ name: "keep" }),
      makeRepo({ name: "forked", fork: true }),
      makeRepo({ name: "secret", private: true }),
      makeRepo({ name: "Old-Stuff" }),
    ];

    const visible = selectVisible(repos, ["old-stuff"]);

    expect(visible.map((r) => r.name)).toEqual(["keep"]);
  });

  it("fails closed when the visibility fields are missing", () => {
    const withoutPrivate = { ...makeRepo({ name: "unknown" }), private: undefined };

    expect(selectVisible([withoutPrivate as never], [])).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const repos = [makeRepo({ name: "a", fork: true }), makeRepo({ name: "b" })];
    const copy = [...repos];

    selectVisible(repos, []);

    expect(repos).toEqual(copy);
  });
});

describe("toProject", () => {
  it("maps the API fields and orders languages by bytes", () => {
    const repo = makeRepo({
      name: "Shop",
      description: "Tienda",
      homepage: "https://shop.example.com",
      stargazers_count: 4,
      topics: ["nextjs"],
      pushed_at: "2026-05-01T00:00:00Z",
    });

    const project = toProject(repo, { CSS: 100, TypeScript: 900, HTML: 300 });

    expect(project).toEqual({
      slug: "shop",
      name: "Shop",
      description: "Tienda",
      repoUrl: repo.html_url,
      homepage: "https://shop.example.com/",
      languages: ["TypeScript", "HTML", "CSS"],
      topics: ["nextjs"],
      stars: 4,
      updatedAt: "2026-05-01T00:00:00Z",
    });
  });

  it("falls back to the primary language when the languages map is empty", () => {
    expect(toProject(makeRepo({ language: "Java" }), {}).languages).toEqual(["Java"]);
    expect(toProject(makeRepo({ language: null }), {}).languages).toEqual([]);
  });

  it("uses updated_at when the repo was never pushed", () => {
    const repo = makeRepo({ pushed_at: null, updated_at: "2025-02-02T00:00:00Z" });

    expect(toProject(repo, {}).updatedAt).toBe("2025-02-02T00:00:00Z");
  });

  it("normalises empty strings and unsafe homepages to null", () => {
    expect(toProject(makeRepo({ description: "  ", homepage: "" }), {})).toMatchObject({
      description: null,
      homepage: null,
    });
    expect(toProject(makeRepo({ homepage: "javascript:alert(1)" }), {}).homepage).toBeNull();
  });

  it("adds https to a bare-domain homepage", () => {
    expect(toProject(makeRepo({ homepage: "shop.example.com" }), {}).homepage).toBe(
      "https://shop.example.com/",
    );
  });

  it("keeps homepages that include a port", () => {
    expect(toProject(makeRepo({ homepage: "example.com:8080/app" }), {}).homepage).toBe(
      "https://example.com:8080/app",
    );
  });

  it("rejects non-http schemes written without slashes", () => {
    expect(toProject(makeRepo({ homepage: "data:text/html,x" }), {}).homepage).toBeNull();
    expect(toProject(makeRepo({ homepage: "mailto:a@b.com" }), {}).homepage).toBeNull();
  });
});
