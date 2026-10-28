import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { FeaturedProject, PublicFeatured } from "@/lib/projects/types";
import { makeProject } from "../../test/fixtures";
import { FeaturedProjects } from "./FeaturedProjects";

const publicItem: PublicFeatured = {
  kind: "public",
  slug: "kartana",
  project: makeProject({ slug: "kartana", name: "Kartana", languages: ["TypeScript"] }),
  image: { src: "/projects/kartana.png", alt: "Captura de Kartana" },
  demoUrl: "https://kartana.example.com",
  summary: "Resumen del README",
  readme: null,
};

const privateItem: FeaturedProject = {
  kind: "private",
  slug: "app-secreta",
  title: "App secreta",
  description: "Lo que hace",
  technologies: ["Kotlin"],
  images: [],
  demoUrl: null,
};

describe("FeaturedProjects", () => {
  it("renders nothing when there are no featured projects", () => {
    const { container } = render(<FeaturedProjects items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a public project with summary, image, detail, demo and code links", () => {
    render(<FeaturedProjects items={[publicItem]} />);
    const card = screen.getByRole("article");

    expect(within(card).getByRole("heading", { name: "Kartana" })).toBeInTheDocument();
    expect(within(card).getByText("Resumen del README")).toBeInTheDocument();
    expect(within(card).getByRole("img", { name: "Captura de Kartana" })).toBeInTheDocument();
    expect(within(card).getByRole("link", { name: /detalles de kartana/i })).toHaveAttribute(
      "href",
      "/proyectos/kartana",
    );
    expect(within(card).getByRole("link", { name: /^demo de/i })).toHaveAttribute(
      "href",
      "https://kartana.example.com",
    );
    expect(within(card).getByRole("link", { name: /código/i })).toBeInTheDocument();
  });

  it("labels private projects and never links to their code", () => {
    render(<FeaturedProjects items={[privateItem]} />);
    const card = screen.getByRole("article");

    expect(within(card).getByText("Proyecto privado")).toBeInTheDocument();
    expect(within(card).getByText("Lo que hace")).toBeInTheDocument();
    expect(within(card).getByText("Kotlin")).toBeInTheDocument();
    expect(within(card).queryByRole("link", { name: /código/i })).not.toBeInTheDocument();
    expect(within(card).getByRole("link", { name: /detalles de app secreta/i })).toHaveAttribute(
      "href",
      "/proyectos/app-secreta",
    );
  });

  it("falls back to the repo description when the README has no summary", () => {
    const item: PublicFeatured = {
      ...publicItem,
      project: makeProject({ description: "Desc" }),
      summary: null,
      image: null,
      demoUrl: "http://insecure.example.com",
    };
    render(<FeaturedProjects items={[item]} />);
    expect(screen.getByText("Desc")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^demo de/i })).not.toBeInTheDocument();
  });
});
