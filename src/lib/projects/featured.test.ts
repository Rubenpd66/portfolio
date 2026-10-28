import { describe, expect, it } from "vitest";
import { makeProject, makeUser } from "../../../test/fixtures";
import { parsePortfolioConfig } from "../config/schema";
import { buildFeatured, resolveProfile } from "./featured";

const links = { github: "https://github.com/Rubenpd66" };

describe("buildFeatured", () => {
  const shop = makeProject({ slug: "shop", name: "Shop" });
  const blog = makeProject({ slug: "blog", name: "Blog" });

  it("returns public featured projects in config order, then private ones", () => {
    const config = parsePortfolioConfig({
      links,
      featured: [
        { repo: "Blog", demoUrl: "https://blog.example.com" },
        { repo: "shop", image: { src: "/shop.png", alt: "Tienda" } },
      ],
      privateProjects: [{ slug: "erp", title: "ERP", technologies: ["Java"] }],
    });

    const featured = buildFeatured(config, [shop, blog], new Map([["blog", "Resumen del blog"]]));

    expect(featured.map((f) => f.slug)).toEqual(["blog", "shop", "erp"]);
    expect(featured[0]).toEqual({
      kind: "public",
      slug: "blog",
      project: blog,
      image: null,
      demoUrl: "https://blog.example.com",
      summary: "Resumen del blog",
    });
    expect(featured[1]).toMatchObject({ image: { src: "/shop.png", alt: "Tienda" }, summary: null });
  });

  it("falls back to the repo homepage as demo URL", () => {
    const withHome = makeProject({ slug: "app", homepage: "https://app.example.com" });
    const config = parsePortfolioConfig({ links, featured: [{ repo: "app" }] });

    expect(buildFeatured(config, [withHome], new Map())[0]).toMatchObject({
      demoUrl: "https://app.example.com",
    });
  });

  it("skips featured repos that are not visible (excluded, fork, missing)", () => {
    const config = parsePortfolioConfig({ links, featured: [{ repo: "ghost" }] });

    expect(buildFeatured(config, [shop], new Map())).toEqual([]);
  });

  it("throws when a private slug collides with a public repo slug", () => {
    const config = parsePortfolioConfig({ links, privateProjects: [{ slug: "shop", title: "X" }] });

    expect(() => buildFeatured(config, [shop], new Map())).toThrow(/shop/);
  });

  it("does not read summaries from the object prototype", () => {
    const ctor = makeProject({ slug: "constructor" });
    const config = parsePortfolioConfig({ links, featured: [{ repo: "constructor" }] });

    expect(buildFeatured(config, [ctor], new Map())[0]).toMatchObject({ summary: null });
  });

  it("exposes only the whitelisted fields of private projects", () => {
    const config = parsePortfolioConfig({
      links,
      privateProjects: [{ slug: "erp", title: "ERP" }],
    });

    expect(buildFeatured(config, [], new Map())).toEqual([
      {
        kind: "private",
        slug: "erp",
        title: "ERP",
        description: null,
        technologies: [],
        images: [],
        demoUrl: null,
      },
    ]);
  });
});

describe("resolveProfile", () => {
  it("uses GitHub data when there is no override", () => {
    expect(resolveProfile(makeUser(), {})).toEqual({
      login: "Rubenpd66",
      name: "Rubén",
      bio: "Estudiante de DAM",
      avatarUrl: "https://avatars.githubusercontent.com/u/1",
      location: "España",
    });
  });

  it("lets the config override GitHub data", () => {
    const profile = resolveProfile(makeUser(), { name: "Rubén P.", bio: "Dev", avatarUrl: "/me.jpg" });

    expect(profile).toMatchObject({ name: "Rubén P.", bio: "Dev", avatarUrl: "/me.jpg" });
  });

  it("falls back to the login when GitHub has no name", () => {
    expect(resolveProfile(makeUser({ name: null }), {}).name).toBe("Rubenpd66");
    expect(resolveProfile(makeUser({ name: "  " }), {}).name).toBe("Rubenpd66");
  });

  it("treats a blank GitHub bio as missing", () => {
    expect(resolveProfile(makeUser({ bio: " " }), {}).bio).toBeNull();
  });
});
