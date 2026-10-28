import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "./site";

describe("resolveSiteUrl", () => {
  it("uses NEXT_PUBLIC_SITE_URL when it is set", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://ruben.dev/" }).href).toBe("https://ruben.dev/");
  });

  it("falls back to the Vercel production domain", () => {
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "portfolio-ruben.vercel.app" }).href).toBe(
      "https://portfolio-ruben.vercel.app/",
    );
  });

  it("falls back to localhost during local development", () => {
    expect(resolveSiteUrl({}).href).toBe("http://localhost:3000/");
  });

  it("ignores blank values", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "  ", VERCEL_PROJECT_PRODUCTION_URL: "" }).href).toBe(
      "http://localhost:3000/",
    );
  });

  it("keeps only the origin of the configured URL", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://ruben.dev/blog?x=1#y" }).href).toBe(
      "https://ruben.dev/",
    );
  });

  it("uses the deployment URL on Vercel preview builds so previews never point at production", () => {
    expect(
      resolveSiteUrl({
        VERCEL_ENV: "preview",
        VERCEL_URL: "portfolio-git-x.vercel.app",
        VERCEL_PROJECT_PRODUCTION_URL: "portfolio-ruben.vercel.app",
      }).href,
    ).toBe("https://portfolio-git-x.vercel.app/");
  });

  it("accepts plain http only for localhost", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "http://localhost:3100" }).href).toBe("http://localhost:3100/");
    expect(() => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "http://ruben.dev" })).toThrow(/https/);
  });

  it("rejects URLs that are not http(s)", () => {
    expect(() => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "javascript:alert(1)" })).toThrow(/NEXT_PUBLIC_SITE_URL/);
    expect(() => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "no es una url" })).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });
});
