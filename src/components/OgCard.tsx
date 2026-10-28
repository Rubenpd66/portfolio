interface OgCardProps {
  title: string;
  eyebrow?: string;
  description?: string;
}

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 180;

function truncate(text: string, limit: number): string {
  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
}

/** 1200x630 social preview rendered by ImageResponse (inline styles and flexbox only). */
export function OgCard({ title, eyebrow, description }: OgCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 28,
        padding: 80,
        background: "#2563eb",
        color: "#ffffff",
      }}
    >
      {eyebrow && <div style={{ fontSize: 32, opacity: 0.85 }}>{eyebrow}</div>}
      <div style={{ fontSize: 80, fontWeight: 700, letterSpacing: -2, wordBreak: "break-word" }}>
        {truncate(title, TITLE_LIMIT)}
      </div>
      {description && <div style={{ fontSize: 34, lineHeight: 1.4, opacity: 0.92 }}>{truncate(description, DESCRIPTION_LIMIT)}</div>}
    </div>
  );
}
