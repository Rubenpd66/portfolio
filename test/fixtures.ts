import type { GitHubRepo, GitHubUser } from "@/lib/github/types";
import type { Project } from "@/lib/projects/types";

export function makeRepo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    name: "demo-repo",
    description: "A demo repository",
    html_url: "https://github.com/Rubenpd66/demo-repo",
    homepage: null,
    language: "TypeScript",
    stargazers_count: 0,
    topics: [],
    pushed_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    fork: false,
    private: false,
    archived: false,
    default_branch: "main",
    ...overrides,
  };
}

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    slug: "demo-repo",
    name: "demo-repo",
    description: "A demo repository",
    repoUrl: "https://github.com/Rubenpd66/demo-repo",
    homepage: null,
    languages: ["TypeScript"],
    topics: [],
    stars: 0,
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

export function makeUser(overrides: Partial<GitHubUser> = {}): GitHubUser {
  return {
    login: "Rubenpd66",
    name: "Rubén",
    bio: "Estudiante de DAM",
    avatar_url: "https://avatars.githubusercontent.com/u/1",
    html_url: "https://github.com/Rubenpd66",
    location: "España",
    ...overrides,
  };
}
