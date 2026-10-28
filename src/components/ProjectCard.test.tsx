import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makeProject } from "../../test/fixtures";
import { ProjectCard } from "./ProjectCard";

describe("ProjectCard", () => {
  it("shows the repo data recruiters scan for", () => {
    render(
      <ProjectCard
        project={makeProject({
          name: "Kartana",
          description: "Carta digital",
          languages: ["TypeScript", "CSS"],
          topics: ["nextjs"],
          stars: 3,
          updatedAt: "2026-03-15T12:00:00Z",
        })}
      />,
    );

    expect(screen.getByRole("heading", { name: "Kartana" })).toBeInTheDocument();
    expect(screen.getByText("Carta digital")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("nextjs")).toBeInTheDocument();
    expect(screen.getByText("3 estrellas")).toBeInTheDocument();
    expect(screen.getByText("15 mar 2026")).toHaveAttribute("dateTime", "2026-03-15T12:00:00Z");
    expect(screen.getByRole("link", { name: /código de kartana/i })).toHaveAttribute(
      "href",
      "https://github.com/Rubenpd66/demo-repo",
    );
  });

  it("links the demo only when it is https", () => {
    const { rerender } = render(
      <ProjectCard project={makeProject({ homepage: "https://demo.example.com" })} />,
    );
    expect(screen.getByRole("link", { name: /^demo de/i })).toHaveAttribute(
      "href",
      "https://demo.example.com",
    );

    rerender(<ProjectCard project={makeProject({ homepage: "http://demo.example.com" })} />);
    expect(screen.queryByRole("link", { name: /^demo de/i })).not.toBeInTheDocument();
  });

  it("falls back to a placeholder when there is no description", () => {
    render(<ProjectCard project={makeProject({ description: null })} />);
    expect(screen.getByText("Sin descripción.")).toBeInTheDocument();
  });
});
