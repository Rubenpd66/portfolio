import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PrivateFeatured, PublicFeatured } from "@/lib/projects/types";
import { makeProject } from "../../test/fixtures";
import { ProjectDetail } from "./ProjectDetail";

const publicItem: PublicFeatured = {
  kind: "public",
  slug: "kartana",
  project: makeProject({
    slug: "kartana",
    name: "Kartana",
    description: "Gestor de cartas",
    repoUrl: "https://github.com/Rubenpd66/Kartana",
    languages: ["TypeScript"],
    topics: ["nextjs"],
  }),
  image: { src: "/projects/kartana.png", alt: "Captura de Kartana" },
  demoUrl: "https://kartana.example.com",
  summary: "Resumen",
  readme: {
    markdown: "# Kartana\n\nContenido del README.",
    context: { owner: "Rubenpd66", repo: "Kartana", branch: "main" },
  },
};

const privateItem: PrivateFeatured = {
  kind: "private",
  slug: "app-secreta",
  title: "App secreta",
  description: "Lo que hace",
  technologies: ["Kotlin"],
  images: [
    { src: "/projects/a.png", alt: "Pantalla A" },
    { src: "/projects/b.png", alt: "Pantalla B" },
  ],
  demoUrl: null,
};

describe("ProjectDetail", () => {
  it("shows a public project with its README, technologies and links", () => {
    render(<ProjectDetail item={publicItem} />);

    expect(screen.getByRole("heading", { level: 1, name: "Kartana" })).toBeInTheDocument();
    expect(screen.getByText("Gestor de cartas")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("nextjs")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Captura de Kartana" })).toBeInTheDocument();
    expect(screen.getByText("Contenido del README.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^ver demo de kartana/i })).toHaveAttribute(
      "href",
      "https://kartana.example.com",
    );
    expect(screen.getByRole("link", { name: /^código en github de kartana/i })).toHaveAttribute(
      "href",
      "https://github.com/Rubenpd66/Kartana",
    );
  });

  it("links back to the home page", () => {
    render(<ProjectDetail item={publicItem} />);

    expect(screen.getByRole("link", { name: /volver/i })).toHaveAttribute("href", "/");
  });

  it("explains when a public repo has no README", () => {
    render(<ProjectDetail item={{ ...publicItem, readme: null }} />);

    expect(screen.getByText(/no tiene readme/i)).toBeInTheDocument();
  });

  it("shows only config fields for private projects, with no code link or README", () => {
    render(<ProjectDetail item={privateItem} />);

    expect(screen.getByRole("heading", { level: 1, name: "App secreta" })).toBeInTheDocument();
    expect(screen.getByText("Proyecto privado")).toBeInTheDocument();
    expect(screen.getByText("Lo que hace")).toBeInTheDocument();
    expect(screen.getByText("Kotlin")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Pantalla A" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Pantalla B" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /código/i })).not.toBeInTheDocument();
    expect(screen.getByText(/código privado/i)).toBeInTheDocument();
  });
});
