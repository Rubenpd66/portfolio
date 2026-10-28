import "server-only";
import { z } from "zod";

/** Fine-grained (github_pat_) or classic (ghp_) personal access token. */
const TOKEN_FORMAT = /^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/;
/** GitHub username rules: alphanumerics and single inner hyphens, at most 39 chars. */
const USERNAME_FORMAT = /^(?=.{1,39}$)[a-z\d](?:[a-z\d]|-(?=[a-z\d]))*$/i;

// Custom messages on purpose: the default ones could echo the received value (the token).
const envSchema = z.object({
  GITHUB_TOKEN: z
    .string({ error: "falta (defínelo en .env.local o en Vercel)" })
    .trim()
    .regex(TOKEN_FORMAT, { error: "formato no válido" }),
  GITHUB_USERNAME: z
    .string({ error: "falta" })
    .trim()
    .regex(USERNAME_FORMAT, { error: "nombre de usuario de GitHub no válido" }),
});

export interface GitHubEnv {
  readonly token: string;
  readonly username: string;
}

/** Reads and validates the server-only GitHub settings. Throws without revealing any value. */
export function readGitHubEnv(
  env: Readonly<Record<string, string | undefined>> = process.env,
): GitHubEnv {
  const result = envSchema.safeParse({
    GITHUB_TOKEN: env.GITHUB_TOKEN,
    GITHUB_USERNAME: env.GITHUB_USERNAME,
  });
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    throw new Error(`Variables de entorno de GitHub inválidas:\n${problems.join("\n")}`);
  }
  return { token: result.data.GITHUB_TOKEN, username: result.data.GITHUB_USERNAME };
}
