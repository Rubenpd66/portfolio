import "server-only";
import { cacheLife } from "next/cache";
import { createGitHubClient } from "@/lib/github/client";
import { readGitHubEnv } from "@/lib/github/env";
import { portfolioConfig } from "@/portfolio.config";
import { loadPortfolio, type PortfolioData } from "./load";

/**
 * Cached portfolio data (ISR): refreshed in the background at most once an hour.
 * If a refresh fails, the stale version keeps being served until it expires (one week).
 * Errors are not caught here on purpose: catching would cache a degraded result.
 */
export async function getPortfolioData(): Promise<PortfolioData> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 604_800 });
  return loadPortfolio(createGitHubClient(readGitHubEnv()), portfolioConfig);
}
