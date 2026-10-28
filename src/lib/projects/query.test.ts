import { describe, expect, it } from "vitest";
import { makeProject } from "../../../test/fixtures";
import { filterByTech, listTechOptions, sortProjects } from "./query";

const older = makeProject({ slug: "older", stars: 10, updatedAt: "2025-01-01T00:00:00Z" });
const newer = makeProject({ slug: "newer", stars: 2, updatedAt: "2026-06-01T00:00:00Z" });
const tied = makeProject({ slug: "tied", stars: 10, updatedAt: "2026-02-01T00:00:00Z" });

describe("sortProjects", () => {
  it("sorts by last update, newest first", () => {
    expect(sortProjects([older, newer, tied], "updated").map((p) => p.slug)).toEqual([
      "newer",
      "tied",
      "older",
    ]);
  });

  it("sorts by stars and breaks ties by last update", () => {
    expect(sortProjects([older, newer, tied], "stars").map((p) => p.slug)).toEqual([
      "tied",
      "older",
      "newer",
    ]);
  });

  it("returns a new array without mutating the input", () => {
    const input = [older, newer];

    const result = sortProjects(input, "updated");

    expect(result).not.toBe(input);
    expect(input.map((p) => p.slug)).toEqual(["older", "newer"]);
  });
});

describe("filterByTech", () => {
  const ts = makeProject({ slug: "ts", languages: ["TypeScript"], topics: ["nextjs"] });
  const kt = makeProject({ slug: "kt", languages: ["Kotlin"], topics: ["android"] });

  it("returns every project when no tech is selected", () => {
    expect(filterByTech([ts, kt], null)).toEqual([ts, kt]);
  });

  it("matches languages and topics case-insensitively", () => {
    expect(filterByTech([ts, kt], "typescript")).toEqual([ts]);
    expect(filterByTech([ts, kt], "Android")).toEqual([kt]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterByTech([ts, kt], "Rust")).toEqual([]);
  });
});

describe("listTechOptions", () => {
  it("lists languages and topics once, most frequent first then alphabetical", () => {
    const projects = [
      makeProject({ languages: ["TypeScript", "CSS"], topics: ["nextjs"] }),
      makeProject({ languages: ["TypeScript"], topics: ["react", "NextJS"] }),
      makeProject({ languages: ["Java"], topics: [] }),
    ];

    expect(listTechOptions(projects)).toEqual(["nextjs", "TypeScript", "CSS", "Java", "react"]);
  });
});
