# AGENTS.md

## Project

Sura Pedidos Web v2.0 — wholesale order management app for Suramericana JI SAS. Astro 6 + React 19, TypeScript (strict), ESM. Static site deployed to Vercel.

## Quick Commands

| Task | Command |
|------|---------|
| Dev server (LAN-accessible) | `npm run dev` |
| Build | `npm run build` |
| Type check | `npm run type-check` |
| Lint | `npm run lint` |
| Clean | `npm run clean` |
| Verify (full) | `npm run type-check && npm run lint && npm run build` |

## Key Gotchas

- **`npm run lint` is `astro check`**, not ESLint. There is no ESLint config.
- **React components use `.jsx`**, not `.tsx`. No JSX type annotations — keep it that way.
- **No `.env` files.** All config lives in `src/config/app.config.ts` (schedule, WhatsApp, portfolio thresholds, currency, UI, storage keys).
- **`npm run dev` exposes the server on the LAN** (`--host` flag). Don't commit this flag to production scripts.
- **No test framework.** There are no tests, no test runner, no test scripts.
- **Spanish codebase.** Comments, variable names, commit messages, and docs are in Spanish. Follow this convention.

## Architecture

Atomic Design: `atoms/` → `molecules/` → `organisms/` → `templates/` → `pages/`.

- **Pages** (`src/pages/`): 7 routes. `index.astro` is the main catalog/home.
- **React components**: Only in `organisms/` (CarteraGestion, ClienteSelectorReact). Use `.jsx` extension + CSS Modules (`.module.css`).
- **Astro components**: All other UI. Scoped `<style>` blocks, no CSS Modules for Astro.
- **Data**: Static JSON in `src/data/` (productos, clientes, cartera, cupo, vendedores, ventas).
- **Config**: `src/config/app.config.ts` — single source of truth for business rules.
- **Utils**: `src/utils/` — auth, helpers, PDF generation (jsPDF), Excel export (xlsx).

## Auth & State

- **Auth**: `sessionStorage` (`vendedorSession`). Use `isAuthenticated()`, `getSession()`, `logout()` from `src/utils/auth.ts`.
- **Client data**: `localStorage` key `datosCliente` (set by ClienteSelectorReact on continue).
- **Cart**: `localStorage` key `cartItems`.
- **Route protection**: Client-side `<script>` blocks redirect to `/login` if no session. No server-side auth.

## Business Rules

- **Debt blocking**: `APP_CONFIG.portfolio.blockDays` (currently 20). If any invoice has `dias > blockDays`, client is blocked from catalog. Logic duplicated in `ClienteSelectorReact.jsx` and `ClienteSelectorTemplate.astro`.
- **Time blocking**: `APP_CONFIG.schedule` — hours 5:00–18:00, timezone `America/Bogota`. `BloqueoHorario.astro` enforces this.
- **WhatsApp orders**: Number in `APP_CONFIG.whatsapp.number`. Opens `wa.me` with formatted message.

## Vite Config

`xlsx`, `jspdf`, `jspdf-autotable` are in `optimizeDeps.include` and `ssr.noExternal` in `astro.config.mjs`. These are large client-side libs that must not be externalized during SSR builds.

## Documentation

Detailed docs in `doc/` (14 files). Key references:
- `doc/06-convenciones.md` — coding conventions
- `doc/09-arquitectura-atomic-design.md` — component hierarchy
- `doc/10-guia-verificacion-deudas.md` — debt blocking logic
- `BLOQUEO_HORARIO.md` — time blocking feature
- `CHANGELOG.md` — version history
