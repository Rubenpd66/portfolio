# Portfolio

Portfolio de desarrollador generado automáticamente desde mi perfil de GitHub.

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS v4 · Zod · Vitest · Playwright · Vercel.

## Desarrollo

```bash
cp .env.example .env.local   # y rellena GITHUB_TOKEN (solo lectura)
npm install
npm run dev
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run typecheck` | Genera tipos de rutas y ejecuta `tsc` |
| `npm run lint` | ESLint |
| `npm test` / `npm run test:cov` | Tests unitarios / con cobertura (mínimo 80 %) |
| `npm run e2e` | Tests E2E con Playwright (contra una web publicada: `E2E_BASE_URL=https://... npm run e2e`) |

El token de GitHub solo se usa en el servidor y nunca se envía al cliente.
