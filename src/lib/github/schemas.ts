import { z } from "zod";
import type { GitHubRepo, GitHubUser, LanguageBytes } from "./types";

// z.object strips unknown fields, so only the documented subset reaches the app.

export const githubUserSchema = z.object({
  login: z.string(),
  name: z.string().nullable(),
  bio: z.string().nullable(),
  avatar_url: z.url({ protocol: /^https$/ }),
  html_url: z.url({ protocol: /^https$/ }),
  location: z.string().nullable(),
}) satisfies z.ZodType<GitHubUser>;

export const githubRepoSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  html_url: z.url({ protocol: /^https$/ }),
  homepage: z.string().nullable(),
  language: z.string().nullable(),
  stargazers_count: z.number().int().nonnegative(),
  topics: z.array(z.string()).default([]),
  pushed_at: z.string().nullable(),
  updated_at: z.string(),
  fork: z.boolean(),
  private: z.boolean(),
  archived: z.boolean(),
  default_branch: z.string().min(1),
}) satisfies z.ZodType<GitHubRepo, unknown>;

export const languageBytesSchema = z.record(
  z.string(),
  z.number().int().nonnegative(),
) satisfies z.ZodType<LanguageBytes>;
