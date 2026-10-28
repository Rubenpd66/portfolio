import { describe, expect, it } from "vitest";
import { mapSettled } from "./concurrency";

describe("mapSettled", () => {
  it("keeps input order and reports each outcome", async () => {
    const results = await mapSettled([1, 2, 3], 2, async (n) => {
      if (n === 2) throw new Error("dos");
      return n * 10;
    });

    expect(results[0]).toEqual({ status: "fulfilled", value: 10 });
    expect(results[1]).toMatchObject({ status: "rejected", reason: new Error("dos") });
    expect(results[2]).toEqual({ status: "fulfilled", value: 30 });
  });

  it("never runs more than `limit` tasks at once", async () => {
    let running = 0;
    let peak = 0;
    await mapSettled(Array.from({ length: 10 }, (_, i) => i), 3, async () => {
      running++;
      peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, 1));
      running--;
    });
    expect(peak).toBe(3);
  });

  it("handles an empty list", async () => {
    await expect(mapSettled([], 4, async () => 1)).resolves.toEqual([]);
  });

  it("treats a limit below 1 as 1", async () => {
    await expect(mapSettled([1, 2], 0, async (n) => n)).resolves.toHaveLength(2);
  });
});
