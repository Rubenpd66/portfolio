import { parsePortfolioConfig } from "@/lib/config/schema";

/**
 * Portfolio configuration. Validated at build time: an invalid value breaks the build.
 *
 * - profile: overrides for the data taken from the GitHub profile.
 * - featured: PUBLIC repos shown first (exact repo name), with optional image and demo.
 * - excluded: public repos hidden from the list.
 * - privateProjects: private repos. ONLY the fields written here are published;
 *   the GitHub API is never queried for them (no README, no file names).
 *   Images go in /public/projects/.
 */
export const portfolioConfig = parsePortfolioConfig({
  profile: {},
  links: {
    github: "https://github.com/Rubenpd66",
    email: "rubenpd66@gmail.com",
  },
  featured: [
    // { repo: "portfolio", image: { src: "/projects/portfolio.png", alt: "Portada del portfolio" }, demoUrl: "https://..." },
  ],
  excluded: [],
  privateProjects: [
    // {
    //   slug: "mi-app-privada",
    //   title: "Mi app privada",
    //   description: "Qué hace y qué aprendí.",
    //   technologies: ["Kotlin", "Jetpack Compose"],
    //   images: [{ src: "/projects/mi-app.png", alt: "Pantalla principal" }],
    //   demoUrl: "https://...",
    // },
  ],
});
