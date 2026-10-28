import { expect, type Page, test } from "@playwright/test";

/**
 * Main recruiter journey against the production build with live GitHub data.
 * Assertions read whatever the page renders, so they survive repos being added or renamed.
 */

function trackRuntimeProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    // Remote README images may 404; only script errors and CSP violations break the page.
    if (message.type() === "error" && /Content Security Policy|Hydration/i.test(message.text())) {
      problems.push(`console: ${message.text()}`);
    }
  });
  return problems;
}

function parseCount(status: string): number {
  const match = /^(\d+)/.exec(status.trim());
  if (!match) throw new Error(`Contador inesperado: "${status}"`);
  return Number(match[1]);
}

test("home → filter and sort → project detail → back", async ({ page }) => {
  const problems = trackRuntimeProblems(page);

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Proyectos destacados" })).toBeVisible();

  const repos = page.getByRole("list", { name: "Repositorios", exact: true });
  const cards = repos.locator(":scope > li");
  const status = page.getByRole("status");
  const total = parseCount(await status.innerText());
  expect(total).toBeGreaterThan(0);
  await expect(cards).toHaveCount(total);

  // Filter by the least common technology: every visible card must mention it.
  const techSelect = page.getByRole("combobox", { name: "Tecnología", exact: true });
  const techOptions = (await techSelect.locator("option").allInnerTexts()).slice(1);
  expect(techOptions.length).toBeGreaterThan(0);
  const tech = techOptions[techOptions.length - 1];
  await techSelect.selectOption(tech);

  const filtered = parseCount(await status.innerText());
  expect(filtered).toBeGreaterThan(0);
  expect(filtered).toBeLessThanOrEqual(total);
  await expect(cards).toHaveCount(filtered);
  for (const card of await cards.all()) {
    const techs = await card.locator("ul li").allInnerTexts();
    expect(techs.map((t) => t.toLowerCase())).toContain(tech.toLowerCase());
  }

  // Back to all repos, sorted by stars: counts must be non-increasing.
  await techSelect.selectOption({ label: "Todas" });
  await expect(cards).toHaveCount(total);
  await page.getByRole("combobox", { name: "Ordenar por" }).selectOption({ label: "Estrellas" });
  const starLabels = await repos.locator("li .sr-only").allInnerTexts();
  const stars = starLabels.map(parseCount);
  expect(stars).toEqual([...stars].sort((a, b) => b - a));

  // Open the first featured project and come back.
  const detailLink = page.getByRole("link", { name: /^Ver detalles de / }).first();
  const title = (await detailLink.getAttribute("aria-label"))!.replace(/^Ver detalles de /, "");
  await detailLink.click();

  await expect(page).toHaveURL(/\/proyectos\/[^/]+$/);
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(page).toHaveTitle(new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

  await page.getByRole("link", { name: "← Volver al portfolio" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Proyectos destacados" })).toBeVisible();

  expect(problems).toEqual([]);
});

test("unknown project shows the not-found page and is kept out of search results", async ({ page }) => {
  // With Cache Components the static shell streams first, so Next keeps 200 and injects noindex
  // (documented "soft 404"); the URL is never in the sitemap either.
  await page.goto("/proyectos/no-existe-este-proyecto");
  await expect(page.getByRole("heading", { level: 1, name: "Página no encontrada" })).toBeVisible();
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).not.toHaveCount(0);
  await page.getByRole("link", { name: "← Volver al portfolio" }).click();
  await expect(page).toHaveURL(/\/$/);
});
