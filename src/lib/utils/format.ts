// UTC so the server render and the client hydration always print the same day.
const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const percentFormatter = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });

/** "2026-03-15T12:00:00Z" -> "15 mar 2026". Empty string for an invalid date. */
export function formatDate(iso: string): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return "";
  return dateFormatter.format(time).replace(".", "");
}

/** 29.5 -> "29,5 %" */
export function formatPercent(value: number): string {
  return `${percentFormatter.format(value)} %`;
}

/** Returns the URL only if it is a valid https URL, so it is safe to use as an href. */
export function httpsOrNull(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}
