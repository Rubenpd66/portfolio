import type { MetadataRoute } from "next";
import { getPortfolioData } from "@/lib/portfolio/data";
import { buildSitemap } from "@/lib/seo/metadata";
import { resolveSiteUrl } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { featured } = await getPortfolioData();
  return buildSitemap(resolveSiteUrl(), featured);
}
