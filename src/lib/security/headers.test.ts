import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, securityHeaders } from "./headers";

function directives(policy: string): Map<string, string> {
  return new Map(
    policy.split(";").map((part) => {
      const [name, ...values] = part.trim().split(/\s+/);
      return [name, values.join(" ")];
    }),
  );
}

describe("buildContentSecurityPolicy", () => {
  it("locks down everything the portfolio does not need", () => {
    const csp = directives(buildContentSecurityPolicy({ isDev: false }));

    expect(csp.get("default-src")).toBe("'self'");
    expect(csp.get("object-src")).toBe("'none'");
    expect(csp.get("base-uri")).toBe("'self'");
    expect(csp.get("frame-ancestors")).toBe("'none'");
    expect(csp.get("form-action")).toBe("'self'");
    expect(csp.get("connect-src")).toBe("'self'");
    expect(csp.get("font-src")).toBe("'self'");
    expect(csp.get("frame-src")).toBe("'none'");
  });

  it("allows README images from any https host but no plain http", () => {
    const csp = directives(buildContentSecurityPolicy({ isDev: false }));

    expect(csp.get("img-src")).toBe("'self' data: https:");
  });

  it("never allows eval in production", () => {
    const prod = directives(buildContentSecurityPolicy({ isDev: false }));
    const dev = directives(buildContentSecurityPolicy({ isDev: true }));

    expect(prod.get("script-src")).toBe("'self' 'unsafe-inline'");
    expect(dev.get("script-src")).toContain("'unsafe-eval'");
  });
});

describe("securityHeaders", () => {
  it("returns the hardening headers with the CSP", () => {
    const headers = new Map(securityHeaders({ isDev: false }).map(({ key, value }) => [key, value]));

    expect(headers.get("Content-Security-Policy")).toBe(buildContentSecurityPolicy({ isDev: false }));
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Permissions-Policy")).toMatch(/camera=\(\).*microphone=\(\).*geolocation=\(\)/);
    expect(headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
    expect(headers.get("Strict-Transport-Security")).toBe("max-age=63072000; includeSubDomains");
  });

  it("does not send HSTS in development", () => {
    const keys = securityHeaders({ isDev: true }).map(({ key }) => key);

    expect(keys).not.toContain("Strict-Transport-Security");
  });
});
