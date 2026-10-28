import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

describe("contrastRatio", () => {
  it("returns 21 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("returns 1 for identical colors", () => {
    expect(contrastRatio("#2563eb", "#2563eb")).toBeCloseTo(1, 5);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#ffffff", "#2563eb")).toBeCloseTo(contrastRatio("#2563eb", "#ffffff"), 5);
  });

  it("matches the WCAG value for the brand accent on white", () => {
    expect(contrastRatio("#2563eb", "#ffffff")).toBeCloseTo(5.17, 2);
  });

  it("accepts 3-digit hex and is case-insensitive", () => {
    expect(contrastRatio("#FFF", "#000")).toBeCloseTo(21, 5);
  });

  it("throws on non-hex colors", () => {
    expect(() => contrastRatio("blue", "#ffffff")).toThrow(/Color hex no válido/);
  });
});
