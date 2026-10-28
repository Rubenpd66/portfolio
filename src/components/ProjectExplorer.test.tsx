import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { makeProject } from "../../test/fixtures";
import { ProjectExplorer } from "./ProjectExplorer";

const projects = [
  makeProject({
    slug: "a",
    name: "Alpha",
    languages: ["TypeScript"],
    stars: 1,
    updatedAt: "2026-05-01T00:00:00Z",
  }),
  makeProject({
    slug: "b",
    name: "Beta",
    languages: ["Luau"],
    stars: 9,
    updatedAt: "2026-01-01T00:00:00Z",
  }),
  makeProject({
    slug: "c",
    name: "Gamma",
    languages: ["TypeScript"],
    topics: ["nextjs"],
    stars: 4,
    updatedAt: "2026-03-01T00:00:00Z",
  }),
];

function names() {
  return within(screen.getByRole("list", { name: /repositorios/i }))
    .getAllByRole("heading")
    .map((heading) => heading.textContent);
}

describe("ProjectExplorer", () => {
  it("lists every project, most recently updated first", () => {
    render(<ProjectExplorer projects={projects} />);
    expect(names()).toEqual(["Alpha", "Gamma", "Beta"]);
    expect(screen.getByRole("status")).toHaveTextContent("3 repositorios");
  });

  it("filters by language or topic", async () => {
    const user = userEvent.setup();
    render(<ProjectExplorer projects={projects} />);

    await user.selectOptions(screen.getByLabelText(/tecnología/i), "TypeScript");
    expect(names()).toEqual(["Alpha", "Gamma"]);

    await user.selectOptions(screen.getByLabelText(/tecnología/i), "nextjs");
    expect(names()).toEqual(["Gamma"]);
    expect(screen.getByRole("status")).toHaveTextContent("1 repositorio");

    await user.selectOptions(screen.getByLabelText(/tecnología/i), "");
    expect(names()).toHaveLength(3);
  });

  it("sorts by stars", async () => {
    const user = userEvent.setup();
    render(<ProjectExplorer projects={projects} />);

    await user.selectOptions(screen.getByLabelText(/ordenar/i), "stars");
    expect(names()).toEqual(["Beta", "Gamma", "Alpha"]);
  });

  it("shows an empty state when there are no repos", () => {
    render(<ProjectExplorer projects={[]} />);
    expect(screen.getByText(/no hay repositorios/i)).toBeInTheDocument();
  });
});
