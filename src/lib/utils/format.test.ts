import { describe, expect, it } from "vitest";
import { formatDate, formatPercent, httpsOrNull } from "./format";

describe("formatDate", () => {
  it("formats an ISO date in Spanish, independent of the local time zone", () => {
    expect(formatDate("2026-01-01T00:30:00Z")).toBe("1 ene 2026");
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatDate("not a date")).toBe("");
  });
});

describe("formatPercent", () => {
  it("uses the Spanish decimal comma", () => {
    expect(formatPercent(29.5)).toBe("29,5 %");
  });
});

describe("httpsOrNull", () => {
  it("keeps https URLs", () => {
    expect(httpsOrNull("https://example.com/a")).toBe("https://example.com/a");
  });

  it.each([null, "", "http://example.com", "javascript:alert(1)", "not a url"])(
    "rejects %s",
    (value) => {
      expect(httpsOrNull(value)).toBeNull();
    },
  );
});
