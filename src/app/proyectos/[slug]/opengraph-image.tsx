import { ImageResponse } from "next/og";
import { OgCard } from "@/components/OgCard";
import { getPortfolioData } from "@/lib/portfolio/data";
import { projectSeo } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site-info";

export const alt = `Proyecto de ${SITE_NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export { generateStaticParams } from "./page";

/** Per-project card. Uses the same approved fields as the page metadata (config only for private projects). */
export default async function ProjectOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { featured } = await getPortfolioData();
  const item = featured.find((candidate) => candidate.slug === slug);
  const card = item ? projectSeo(item) : { title: SITE_NAME, description: undefined };
  return new ImageResponse(<OgCard eyebrow={SITE_NAME} title={card.title} description={card.description} />, size);
}
