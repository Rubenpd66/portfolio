import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StackSection } from "./StackSection";

describe("StackSection", () => {
  it("renders each language with its share", () => {
    render(
      <StackSection
        stack={[
          { name: "TypeScript", percent: 70.5 },
          { name: "Luau", percent: 29.5 },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: /stack/i })).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "TypeScript" })).toHaveAttribute(
      "aria-valuenow",
      "70.5",
    );
    expect(screen.getByText("29,5 %")).toBeInTheDocument();
  });

  it("hides languages that round to 0 %", () => {
    render(
      <StackSection
        stack={[
          { name: "TypeScript", percent: 100 },
          { name: "Shell", percent: 0 },
        ]}
      />,
    );
    expect(screen.queryByText("Shell")).not.toBeInTheDocument();
  });

  it("renders nothing without data", () => {
    const { container } = render(<StackSection stack={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
