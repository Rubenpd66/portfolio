import { portfolioConfig } from "@/portfolio.config";

/** Site-wide texts built from the config only, so metadata never waits on the GitHub API. */
export const SITE_NAME = `${portfolioConfig.profile.name ?? "Desarrollador"} · Portfolio`;
export const SITE_DESCRIPTION =
  portfolioConfig.profile.bio ?? "Portfolio de desarrollador generado automáticamente desde GitHub.";
