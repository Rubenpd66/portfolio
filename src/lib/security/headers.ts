interface HeaderOptions {
  readonly isDev: boolean;
}

export interface Header {
  readonly key: string;
  readonly value: string;
}

/**
 * Static CSP (no nonces): nonces force dynamic rendering, which would break ISR.
 * Next's inline bootstrap scripts need 'unsafe-inline'; README markdown never renders raw HTML,
 * so no user content can inject a script. Dev adds 'unsafe-eval' for React's debugging tools.
 */
export function buildContentSecurityPolicy({ isDev }: HeaderOptions): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    // README images come from arbitrary https hosts; next/image is served from 'self'.
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  return directives.join("; ");
}

export function securityHeaders(options: HeaderOptions): Header[] {
  return [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy(options) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    // Browsers ignore HSTS over plain http, so `next start` on localhost is unaffected.
    ...(options.isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
  ];
}
