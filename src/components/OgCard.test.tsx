import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OgCard } from "./OgCard";

const OG_LIMIT = 180;
const TITLE_LIMIT = 60;

describe("OgCard", () => {
  it("shows the eyebrow, title and description", () => {
    render(<OgCard eyebrow="Rubén · Portfolio" title="Kartana" description="Carta digital con QR" />);

    expect(screen.getByText("Rubén · Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Kartana")).toBeInTheDocument();
    expect(screen.getByText("Carta digital con QR")).toBeInTheDocument();
  });

  it("omits the eyebrow and description when missing", () => {
    const { container } = render(<OgCard title="Rubén · Portfolio" />);

    expect(container.firstElementChild?.childElementCount).toBe(1);
  });

  it("truncates long descriptions so they fit the card", () => {
    render(<OgCard title="X" description={"a".repeat(400)} />);

    expect(screen.getByText(/^a+…$/).textContent).toHaveLength(OG_LIMIT + 1);
  });

  it("truncates very long titles", () => {
    render(<OgCard title={"b".repeat(200)} />);

    expect(screen.getByText(/^b+…$/).textContent).toHaveLength(TITLE_LIMIT + 1);
  });
});
