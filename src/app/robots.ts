import type { MetadataRoute } from "next";
import { resolveSiteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const site = resolveSiteUrl();
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", site).href,
  };
}
