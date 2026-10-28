/** Subset of the GitHub REST "repository" object that the portfolio uses. */
export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  topics: string[];
  pushed_at: string | null;
  updated_at: string;
  fork: boolean;
  private: boolean;
  archived: boolean;
  default_branch: string;
}

/** Subset of the GitHub REST "user" object. */
export interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  location: string | null;
}

/** Bytes of code per language, as returned by `GET /repos/{owner}/{repo}/languages`. */
export type LanguageBytes = Readonly<Record<string, number>>;
