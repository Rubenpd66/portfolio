import { describe, expect, it } from "vitest";
import { parsePortfolioConfig } from "./schema";

const base = {
  links: { github: "https://github.com/Rubenpd66" },
};

describe("parsePortfolioConfig", () => {
  it("applies defaults for optional sections", () => {
    const config = parsePortfolioConfig(base);

    expect(config.profile).toEqual({});
    expect(config.featured).toEqual([]);
    expect(config.excluded).toEqual([]);
    expect(config.privateProjects).toEqual([]);
  });

  it("accepts a complete config", () => {
    const config = parsePortfolioConfig({
      profile: { name: "Rubén", bio: "Dev", avatarUrl: "/me.jpg" },
      links: {
        github: "https://github.com/Rubenpd66",
        linkedin: "https://www.linkedin.com/in/ruben",
        email: "ruben@example.com",
      },
      featured: [
        { repo: "portfolio", image: { src: "/projects/portfolio.png", alt: "Portada" } },
      ],
      excluded: ["old-repo"],
      privateProjects: [
        {
          slug: "app-privada",
          title: "App privada",
          description: "Gestión interna",
          technologies: ["Kotlin"],
          images: [{ src: "/projects/app.png", alt: "Captura" }],
          demoUrl: "https://demo.example.com",
        },
      ],
    });

    expect(config.featured[0].repo).toBe("portfolio");
    expect(config.privateProjects[0].technologies).toEqual(["Kotlin"]);
  });

  it("rejects unknown fields in a private project (whitelist)", () => {
    expect(() =>
      parsePortfolioConfig({
        ...base,
        privateProjects: [{ slug: "x", title: "X", readme: "# secret" }],
      }),
    ).toThrow();
  });

  it("rejects non-http links", () => {
    expect(() =>
      parsePortfolioConfig({ links: { github: "javascript:alert(1)" } }),
    ).toThrow();
    expect(() =>
      parsePortfolioConfig({
        ...base,
        privateProjects: [{ slug: "x", title: "X", demoUrl: "ftp://demo" }],
      }),
    ).toThrow();
  });

  it("rejects image sources that are neither local paths nor https URLs", () => {
    expect(() =>
      parsePortfolioConfig({
        ...base,
        featured: [{ repo: "a", image: { src: "data:image/png;base64,AAA", alt: "x" } }],
      }),
    ).toThrow();
    expect(() =>
      parsePortfolioConfig({
        ...base,
        featured: [{ repo: "a", image: { src: "//evil.example/x.png", alt: "x" } }],
      }),
    ).toThrow();
  });

  it("rejects local paths that browsers treat as protocol-relative", () => {
    for (const src of ["/\\evil.example/x.png", "/\t/evil.example/x.png"]) {
      expect(() =>
        parsePortfolioConfig({ ...base, featured: [{ repo: "a", image: { src, alt: "x" } }] }),
      ).toThrow();
    }
  });

  it("requires alt text for images", () => {
    expect(() =>
      parsePortfolioConfig({
        ...base,
        featured: [{ repo: "a", image: { src: "/a.png", alt: "" } }],
      }),
    ).toThrow();
  });

  it("rejects slugs that are not kebab-case", () => {
    expect(() =>
      parsePortfolioConfig({
        ...base,
        privateProjects: [{ slug: "../etc", title: "X" }],
      }),
    ).toThrow();
  });

  it("rejects duplicated slugs across featured and private projects", () => {
    expect(() =>
      parsePortfolioConfig({
        ...base,
        featured: [{ repo: "Shop-App" }],
        privateProjects: [{ slug: "shop-app", title: "Shop" }],
      }),
    ).toThrow(/duplicad/i);
  });

  it("rejects an invalid email", () => {
    expect(() =>
      parsePortfolioConfig({ links: { ...base.links, email: "not-an-email" } }),
    ).toThrow();
  });
});
