import { describe, expect, it } from "vitest";
import { readGitHubEnv } from "./env";

const VALID_TOKEN = "github_pat_" + "A".repeat(40);

describe("readGitHubEnv", () => {
  it("returns token and username when both are valid", () => {
    const env = readGitHubEnv({ GITHUB_TOKEN: VALID_TOKEN, GITHUB_USERNAME: "Rubenpd66" });
    expect(env).toEqual({ token: VALID_TOKEN, username: "Rubenpd66" });
  });

  it("accepts classic tokens", () => {
    const token = "ghp_" + "b".repeat(36);
    expect(readGitHubEnv({ GITHUB_TOKEN: token, GITHUB_USERNAME: "a-b" }).token).toBe(token);
  });

  it("trims surrounding whitespace pasted with the values", () => {
    const env = readGitHubEnv({ GITHUB_TOKEN: ` ${VALID_TOKEN}\n`, GITHUB_USERNAME: " Rubenpd66 " });
    expect(env).toEqual({ token: VALID_TOKEN, username: "Rubenpd66" });
  });

  it("throws when the token is missing", () => {
    expect(() => readGitHubEnv({ GITHUB_USERNAME: "Rubenpd66" })).toThrow(/GITHUB_TOKEN/);
  });

  it("throws when the token has an unexpected format", () => {
    expect(() => readGitHubEnv({ GITHUB_TOKEN: "not-a-token", GITHUB_USERNAME: "x" })).toThrow(
      /GITHUB_TOKEN/,
    );
  });

  it("never includes the token value in the error message", () => {
    const leaked = "github_pat_short";
    try {
      readGitHubEnv({ GITHUB_TOKEN: leaked, GITHUB_USERNAME: "-bad-" });
      expect.unreachable();
    } catch (error) {
      expect(String(error)).not.toContain(leaked);
      expect(String(error)).toMatch(/GITHUB_USERNAME/);
    }
  });

  it.each(["", "-start", "end-", "a--b", "a".repeat(40), "has space", "../etc"])(
    "rejects invalid username %j",
    (username) => {
      expect(() => readGitHubEnv({ GITHUB_TOKEN: VALID_TOKEN, GITHUB_USERNAME: username })).toThrow(
        /GITHUB_USERNAME/,
      );
    },
  );
});
