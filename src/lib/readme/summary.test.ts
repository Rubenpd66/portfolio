import { describe, expect, it } from "vitest";
import { summarizeReadme } from "./summary";

describe("summarizeReadme", () => {
  it("returns the first prose paragraph, skipping title, badges and images", () => {
    const md = [
      "# My Project",
      "",
      "[![CI](https://img.shields.io/ci.svg)](https://ci) ![logo](logo.png)",
      "",
      "A **fast** app built with [Next.js](https://nextjs.org) and `TypeScript`.",
      "",
      "## Install",
      "npm i",
    ].join("\n");

    expect(summarizeReadme(md)).toBe("A fast app built with Next.js and TypeScript.");
  });

  it("skips code blocks, HTML and lists", () => {
    const md = [
      '<p align="center"><img src="x.png"></p>',
      "```bash",
      "npm run dev",
      "```",
      "- item",
      "> quote",
      "Real description",
      "spanning two lines.",
    ].join("\n");

    expect(summarizeReadme(md)).toBe("Real description spanning two lines.");
  });

  it("keeps underscores inside words and strips paired emphasis only", () => {
    expect(summarizeReadme("Run my_repo_name with *care* and __bold__ text.")).toBe(
      "Run my_repo_name with care and bold text.",
    );
  });

  it("skips setext headings and YAML front matter", () => {
    const md = ["---", "title: x", "---", "", "Project", "=======", "", "Real text."].join("\n");

    expect(summarizeReadme(md)).toBe("Real text.");
  });

  it("truncates long paragraphs at a word boundary", () => {
    const md = "word ".repeat(100);

    const summary = summarizeReadme(md, 30);

    expect(summary).not.toBeNull();
    expect(summary!.length).toBeLessThanOrEqual(31);
    expect(summary!.endsWith("…")).toBe(true);
    expect(summary).toBe("word word word word word word…");
  });

  it("returns null when there is no prose", () => {
    expect(summarizeReadme("# Title\n\n![img](a.png)")).toBeNull();
    expect(summarizeReadme("")).toBeNull();
  });
});
