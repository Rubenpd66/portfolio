import { describe, expect, it } from "vitest";
import type { PrivateFeatured, Profile, PublicFeatured } from "@/lib/projects/types";
import { makeProject } from "../../../test/fixtures";
import { buildPersonJsonLd, buildSitemap, projectSeo, serializeJsonLd } from "./metadata";

const site = new URL("https://ruben.dev/");

const publicItem: PublicFeatured = {
  kind: "public",
  slug: "kartana",
  project: makeProject({
    slug: "kartana",
    name: "Kartana",
    description: "Gestor de cartas",
    updatedAt: "2026-05-02T10:00:00Z",
  }),
  image: null,
  demoUrl: null,
  summary: "Resumen del README",
  readme: null,
};

const privateItem: PrivateFeatured = {
  kind: "private",
  slug: "app-secreta",
  title: "App secreta",
  description: null,
  technologies: [],
  images: [],
  demoUrl: null,
};

const profile: Profile = {
  login: "Rubenpd66",
  name: "Rubén",
  bio: "Estudiante de DAM",
  avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
  location: null,
};

describe("projectSeo", () => {
  it("prefers the README summary for public projects", () => {
    expect(projectSeo(publicItem)).toEqual({ title: "Kartana", description: "Resumen del README" });
  });

  it("falls back to the repo description", () => {
    expect(projectSeo({ ...publicItem, summary: null }).description).toBe("Gestor de cartas");
  });

  it("uses only config fields for private projects", () => {
    expect(projectSeo(privateItem)).toEqual({ title: "App secreta", description: undefined });
  });
});

describe("buildSitemap", () => {
  it("lists the home page and every featured project with absolute URLs", () => {
    const entries = buildSitemap(site, [publicItem, privateItem]);

    expect(entries.map((entry) => entry.url)).toEqual([
      "https://ruben.dev/",
      "https://ruben.dev/proyectos/kartana",
      "https://ruben.dev/proyectos/app-secreta",
    ]);
  });

  it("dates public projects by their last push and the home page by the newest one", () => {
    const older = { ...publicItem, slug: "old", project: makeProject({ updatedAt: "2025-01-01T00:00:00Z" }) };
    const [home, kartana, old, secret] = buildSitemap(site, [publicItem, older, privateItem]);

    expect(home.lastModified).toBe("2026-05-02T10:00:00Z");
    expect(kartana.lastModified).toBe("2026-05-02T10:00:00Z");
    expect(old.lastModified).toBe("2025-01-01T00:00:00Z");
    expect(secret.lastModified).toBeUndefined();
  });

  it("encodes slugs in URLs", () => {
    const [, entry] = buildSitemap(site, [{ ...privateItem, slug: "a b" }]);

    expect(entry.url).toBe("https://ruben.dev/proyectos/a%20b");
  });
});

describe("buildPersonJsonLd", () => {
  it("describes the developer with their public profiles", () => {
    const jsonLd = buildPersonJsonLd(site, profile, {
      github: "https://github.com/Rubenpd66",
      linkedin: "https://www.linkedin.com/in/ruben",
    });

    expect(jsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Rubén",
      url: "https://ruben.dev/",
      image: "https://avatars.githubusercontent.com/u/1?v=4",
      description: "Estudiante de DAM",
      sameAs: ["https://github.com/Rubenpd66", "https://www.linkedin.com/in/ruben"],
    });
  });

  it("omits missing optional fields", () => {
    const jsonLd = buildPersonJsonLd(site, { ...profile, bio: null }, { github: "https://github.com/Rubenpd66" });

    expect(jsonLd).not.toHaveProperty("description");
    expect(jsonLd.sameAs).toEqual(["https://github.com/Rubenpd66"]);
  });
});

describe("serializeJsonLd", () => {
  it("escapes characters that could close the script tag", () => {
    const json = serializeJsonLd({ name: "</script><script>alert(1)</script>" });

    expect(json).not.toContain("<");
    expect(JSON.parse(json)).toEqual({ name: "</script><script>alert(1)</script>" });
  });
});
