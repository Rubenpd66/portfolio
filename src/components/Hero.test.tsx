import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "./Hero";

const profile = {
  login: "Rubenpd66",
  name: "Rubén",
  bio: "Estudiante de DAM",
  avatarUrl: "https://avatars.githubusercontent.com/u/1",
  location: "España",
};

describe("Hero", () => {
  it("shows name, bio, avatar and location", () => {
    render(<Hero profile={profile} links={{ github: "https://github.com/Rubenpd66" }} />);

    expect(screen.getByRole("heading", { level: 1, name: "Rubén" })).toBeInTheDocument();
    expect(screen.getByText("Estudiante de DAM")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /foto de rubén/i })).toBeInTheDocument();
    expect(screen.getByText("España")).toBeInTheDocument();
  });

  it("renders only the configured contact links", () => {
    render(
      <Hero
        profile={{ ...profile, bio: null, location: null }}
        links={{ github: "https://github.com/Rubenpd66", email: "a@b.es" }}
      />,
    );

    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/Rubenpd66",
    );
    expect(screen.getByRole("link", { name: /email/i })).toHaveAttribute("href", "mailto:a@b.es");
    expect(screen.queryByRole("link", { name: /linkedin/i })).not.toBeInTheDocument();
  });

  it("includes LinkedIn when configured", () => {
    render(
      <Hero
        profile={profile}
        links={{ github: "https://github.com/x", linkedin: "https://linkedin.com/in/x" }}
      />,
    );
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
      "href",
      "https://linkedin.com/in/x",
    );
  });
});
