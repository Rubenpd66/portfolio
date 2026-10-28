import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cacheLife: vi.fn(),
  readGitHubEnv: vi.fn(() => ({ token: "t", username: "u" })),
  createGitHubClient: vi.fn(() => ({ fake: true })),
  loadPortfolio: vi.fn(async () => ({ loaded: true })),
}));

vi.mock("next/cache", () => ({ cacheLife: mocks.cacheLife }));
vi.mock("@/lib/github/env", () => ({ readGitHubEnv: mocks.readGitHubEnv }));
vi.mock("@/lib/github/client", () => ({ createGitHubClient: mocks.createGitHubClient }));
vi.mock("./load", () => ({ loadPortfolio: mocks.loadPortfolio }));

import { portfolioConfig } from "@/portfolio.config";
import { getPortfolioData } from "./data";

describe("getPortfolioData", () => {
  beforeEach(() => vi.clearAllMocks());

  it("revalidates hourly and loads data with the env-configured client", async () => {
    const data = await getPortfolioData();

    expect(mocks.cacheLife).toHaveBeenCalledWith({ stale: 300, revalidate: 3600, expire: 604_800 });
    expect(mocks.createGitHubClient).toHaveBeenCalledWith({ token: "t", username: "u" });
    expect(mocks.loadPortfolio).toHaveBeenCalledWith({ fake: true }, portfolioConfig);
    expect(data).toEqual({ loaded: true });
  });

  it("fails loudly when the environment is invalid instead of caching empty data", async () => {
    mocks.readGitHubEnv.mockImplementationOnce(() => {
      throw new Error("Variables de entorno de GitHub inválidas");
    });
    await expect(getPortfolioData()).rejects.toThrow(/entorno/);
    expect(mocks.loadPortfolio).not.toHaveBeenCalled();
  });
});
