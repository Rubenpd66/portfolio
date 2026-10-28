import { ImageResponse } from "next/og";
import { OgCard } from "@/components/OgCard";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/site-info";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social preview card. Built from the config only: no GitHub request, no repository content. */
export default function OpenGraphImage() {
  return new ImageResponse(<OgCard title={SITE_NAME} description={SITE_DESCRIPTION} />, size);
}
