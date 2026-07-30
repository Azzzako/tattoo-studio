# Tattoo Studio

Plataforma para estudio de tatuajes: landing pública, portafolio, agenda por tatuador, espejo Google Calendar y notificaciones WhatsApp.

## Stack

- Next.js 15 + React 19 + TypeScript estricto
- Supabase (Postgres, Auth, Storage, RLS)
- Vercel (Node runtime, auto-deploy desde `main`)
- Meta WhatsApp Cloud API
- Resend
- Tailwind + shadcn/ui
- FullCalendar + Embla Carousel
- Vitest + Playwright

## Estructura

- `apps/web`: Next.js con App Router
- `packages/db`: SQL, migraciones y seeds
- `packages/domain`: lógica de negocio (slots, tokens, sync)
- `packages/google`, `packages/whatsapp`, `packages/email`: integraciones
- `packages/config`: entorno, tsconfig, eslint, prettier
- `packages/ui`: tokens, shadcn setup, helpers

## Comandos

```bash
bun install
bun run dev
bun run build
bun run preview
bun run deploy
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run db:migrate
bun run db:seed
bun run db:reset
```

## Documentación

- `apps/web/AGENTS.md`: reglas operativas
- `docs/architecture.md`: arquitectura
- `docs/runbook.md`: operación diaria
- `docs/threat-model.md`: modelo de amenazas
