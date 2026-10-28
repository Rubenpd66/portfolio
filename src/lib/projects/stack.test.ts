import { describe, expect, it } from "vitest";
import { computeStack } from "./stack";

describe("computeStack", () => {
  it("aggregates bytes across repos and returns percentages, biggest first", () => {
    const stack = computeStack([
      { TypeScript: 600, CSS: 100 },
      { TypeScript: 200, Kotlin: 100 },
    ]);

    expect(stack).toEqual([
      { name: "TypeScript", percent: 80 },
      { name: "CSS", percent: 10 },
      { name: "Kotlin", percent: 10 },
    ]);
  });

  it("limits the number of entries", () => {
    const stack = computeStack([{ A: 5, B: 4, C: 3 }], { limit: 2 });

    expect(stack.map((s) => s.name)).toEqual(["A", "B"]);
  });

  it("treats a negative limit as zero", () => {
    expect(computeStack([{ A: 1 }], { limit: -1 })).toEqual([]);
  });

  it("ignores configured languages (e.g. generated markup)", () => {
    const stack = computeStack([{ TypeScript: 50, HTML: 50 }], { ignore: ["html"] });

    expect(stack).toEqual([{ name: "TypeScript", percent: 100 }]);
  });

  it("rounds to one decimal", () => {
    expect(computeStack([{ A: 1, B: 2 }])).toEqual([
      { name: "B", percent: 66.7 },
      { name: "A", percent: 33.3 },
    ]);
  });

  it("returns an empty list when there is no code", () => {
    expect(computeStack([])).toEqual([]);
    expect(computeStack([{ A: 0 }])).toEqual([]);
  });
});
