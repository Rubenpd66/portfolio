import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReadmeDoc } from "@/lib/projects/types";
import { Readme } from "./Readme";

function doc(markdown: string): ReadmeDoc {
  return { markdown, context: { owner: "Rubenpd66", repo: "Kartana", branch: "main" } };
}

describe("Readme", () => {
  it("renders GitHub flavored markdown", () => {
    render(<Readme doc={doc("Texto **fuerte**\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n- [x] hecho")} />);

    expect(screen.getByText("fuerte").tagName).toBe("STRONG");
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("demotes headings so the page keeps a single h1", () => {
    render(<Readme doc={doc("# Título\n\n## Sección\n\n### C\n\n#### D\n\n##### E\n\n###### Mínimo")} />);

    expect(screen.getByRole("heading", { name: "Título", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sección", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "C", level: 4 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "D", level: 5 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "E", level: 6 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mínimo", level: 6 })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("strips raw HTML, scripts and event handlers", () => {
    const { container } = render(
      <Readme doc={doc('<script>alert(1)</script>\n\n<img src="x.png" onerror="alert(1)">\n\nFin')} />,
    );

    expect(container.querySelector("script")).toBeNull();
    expect(container.innerHTML).not.toMatch(/onerror|alert/);
    expect(screen.getByText("Fin")).toBeInTheDocument();
  });

  it("turns rejected links into plain text and drops rejected images", () => {
    const { container } = render(
      <Readme doc={doc("[clic](javascript:alert(1))\n\n![Malo](data:image/png;base64,AAAA)")} />,
    );

    expect(screen.getByText("clic").closest("a")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[href=\"\"], [src=\"\"]")).toBeNull();
  });

  it("does not open mailto links in a new tab", () => {
    render(<Readme doc={doc("[Escríbeme](mailto:a@b.es)")} />);

    expect(screen.getByRole("link", { name: "Escríbeme" })).not.toHaveAttribute("target");
  });

  it("makes scrollable code blocks and tables keyboard focusable", () => {
    const { container } = render(<Readme doc={doc("```\ncode\n```\n\n| A |\n| - |\n| 1 |")} />);

    expect(container.querySelector("pre")).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("table")).toHaveAttribute("tabindex", "0");
  });

  it("resolves relative links and images against the repository", () => {
    render(<Readme doc={doc("[Guía](docs/guia.md)\n\n![Captura](./img/home.png)")} />);

    expect(screen.getByRole("link", { name: /guía/i })).toHaveAttribute(
      "href",
      "https://github.com/Rubenpd66/Kartana/blob/main/docs/guia.md",
    );
    expect(screen.getByRole("img", { name: "Captura" })).toHaveAttribute(
      "src",
      "https://raw.githubusercontent.com/Rubenpd66/Kartana/main/img/home.png",
    );
  });

  it("opens external links in a new tab without leaking the opener", () => {
    render(<Readme doc={doc("[Web](https://example.com)")} />);

    const link = screen.getByRole("link", { name: /web/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders in-page anchors as text because headings have no ids", () => {
    render(<Readme doc={doc("[Uso](#uso)")} />);

    expect(screen.getByText("Uso").closest("a")).toBeNull();
  });

  it("lazy-loads images without sending the referrer or extra URL attributes", () => {
    render(<Readme doc={doc("![Logo](https://example.com/logo.png)")} />);

    const image = screen.getByRole("img", { name: "Logo" });
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).toHaveAttribute("referrerpolicy", "no-referrer");
  });
});
