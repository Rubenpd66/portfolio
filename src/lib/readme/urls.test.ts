import { describe, expect, it } from "vitest";
import { resolveReadmeUrl } from "./urls";

const ctx = { owner: "Rubenpd66", repo: "shop", branch: "main" };

describe("resolveReadmeUrl", () => {
  it("keeps absolute http(s) and mailto URLs", () => {
    expect(resolveReadmeUrl("https://example.com/a", ctx, "link")).toBe("https://example.com/a");
    expect(resolveReadmeUrl("mailto:a@b.com", ctx, "link")).toBe("mailto:a@b.com");
  });

  it("keeps in-page anchors", () => {
    expect(resolveReadmeUrl("#install", ctx, "link")).toBe("#install");
  });

  it("resolves relative images to raw.githubusercontent.com", () => {
    expect(resolveReadmeUrl("./docs/shot.png", ctx, "image")).toBe(
      "https://raw.githubusercontent.com/Rubenpd66/shop/main/docs/shot.png",
    );
    expect(resolveReadmeUrl("/img/a b.png", ctx, "image")).toBe(
      "https://raw.githubusercontent.com/Rubenpd66/shop/main/img/a%20b.png",
    );
  });

  it("resolves relative links to the GitHub blob view", () => {
    expect(resolveReadmeUrl("docs/guide.md", ctx, "link")).toBe(
      "https://github.com/Rubenpd66/shop/blob/main/docs/guide.md",
    );
  });

  it("keeps query strings and fragments of relative URLs", () => {
    expect(resolveReadmeUrl("img/logo.png?raw=true", ctx, "image")).toBe(
      "https://raw.githubusercontent.com/Rubenpd66/shop/main/img/logo.png?raw=true",
    );
    expect(resolveReadmeUrl("docs/guide.md#install", ctx, "link")).toBe(
      "https://github.com/Rubenpd66/shop/blob/main/docs/guide.md#install",
    );
  });

  it("does not double-encode already encoded paths", () => {
    expect(resolveReadmeUrl("my%20pic.png", ctx, "image")).toBe(
      "https://raw.githubusercontent.com/Rubenpd66/shop/main/my%20pic.png",
    );
    expect(resolveReadmeUrl("bad%E0%A4%A.png", ctx, "image")).toBe(
      "https://raw.githubusercontent.com/Rubenpd66/shop/main/bad%25E0%25A4%25A.png",
    );
  });

  it("does not let relative paths escape the repository", () => {
    expect(resolveReadmeUrl("../../other/repo.png", ctx, "image")).toBe(
      "https://raw.githubusercontent.com/Rubenpd66/shop/main/other/repo.png",
    );
  });

  it("drops dangerous or unsupported schemes", () => {
    expect(resolveReadmeUrl("javascript:alert(1)", ctx, "link")).toBe("");
    expect(resolveReadmeUrl("JaVaScRiPt:alert(1)", ctx, "link")).toBe("");
    expect(resolveReadmeUrl("data:text/html,<script>", ctx, "image")).toBe("");
    expect(resolveReadmeUrl("vbscript:x", ctx, "link")).toBe("");
    expect(resolveReadmeUrl("mailto:a@b.com", ctx, "image")).toBe("");
    // Mixed content and third-party tracking over plain http.
    expect(resolveReadmeUrl("http://example.com/a.png", ctx, "image")).toBe("");
  });

  it("encodes the repository context", () => {
    expect(
      resolveReadmeUrl("a.png", { owner: "o", repo: "r", branch: "feat#x/y" }, "image"),
    ).toBe("https://raw.githubusercontent.com/o/r/feat%23x/y/a.png");
  });

  it("drops protocol-relative URLs", () => {
    expect(resolveReadmeUrl("//evil.example/x.png", ctx, "image")).toBe("");
  });
});
