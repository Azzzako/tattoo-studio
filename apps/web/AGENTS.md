# AGENTS.md

Reglas operativas para humanos y agentes que trabajen en este repositorio.

## 1. Commits

- Conventional Commits (`feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `build`, `ci`).
- Un commit por objetivo. No mezclar refactor con feature.
- Commits atómicos: cada uno deja el repositorio en verde.
- Mensaje en presente y modo imperativo en español.
- Sin emojis en mensajes de commit.
- Nunca incluir secretos, claves, tokens ni archivos generados.

## 2. Ramas

- `main`: producción.
- `staging`: integración.
- `develop`: trabajo activo.
- Ramas de feature: `feat/<scope>-<slug>`.
- Hotfix: `fix/<scope>-<slug>`.

## 3. Push, PR y deploy

- Nunca hacer `git push` sin instrucción explícita del usuario.
- Crear PRs solo cuando el usuario lo solicite.
- Merge con squash salvo que el usuario indique lo contrario.
- El deploy a producción lo dispara GitHub Actions al hacer push a `main`.

## 4. Calidad

Antes de abrir un PR:

```bash
bun install --frozen-lockfile
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run build
```

E2E cuando cambien rutas, auth, autorización o integraciones:

```bash
bun run preview &
bun run test:e2e
```

## 5. Runtime real

Build verde no implica runtime sano. Probar localmente con `bun run preview` (OpenNext) antes de declarar listo cualquier cambio de routing, Server Action o middleware.

## 6. TypeScript y formato

- TypeScript estricto con `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`.
- Sin `any` salvo justificación documentada.
- Prettier con `prettier-plugin-tailwindcss`.

## 7. Sistema de diseño

- Tokens en `apps/web/app/globals.css`.
- No agregar colores hardcoded en componentes; usar tokens.
- Iconos inline con `lucide-react`.
- shadcn/ui en `components/ui/*`.
- Respetar `prefers-reduced-motion` (ya cubierto por CSS).

## 8. Datos y migraciones

- Migraciones en `packages/db/migrations/` numeradas y ordenadas.
- Cada migración es idempotente en su `CREATE IF NOT EXISTS` y `CREATE POLICY`.
- RLS obligatoria en tablas expuestas al cliente.
- Toda tabla de negocio lleva `studio_id`.
- Las pruebas de dominio viven en `packages/domain/src/**`.

## 9. Seguridad

- Secrets nunca en el repositorio. Usar Cloudflare Workers secrets o GitHub Actions secrets.
- Cifrar tokens de Google con `TOKEN_ENCRYPTION_KEY` (AES-GCM en `packages/domain/src/google/sync.ts`).
- Validar inputs con Zod en Server Actions y Route Handlers.
- No exponer `SUPABASE_SERVICE_ROLE_KEY` al cliente.
- Cron endpoints requieren `Authorization: Bearer ${CRON_SECRET}`.

## 10. Tests por alcance

| Alcance                                  | Tipo                                        |
| ---------------------------------------- | ------------------------------------------- |
| Lógica pura (slots, tokens, authz, sync) | unit                                        |
| Server Actions y RLS                     | integration                                 |
| Rutas y permisos                         | E2E con Playwright contra `bun run preview` |

## 11. Despliegue

- Next.js corre en Cloudflare Workers vía `@opennextjs/cloudflare`.
- Variables planas en `wrangler.jsonc` (sin secretos).
- Secretos en `wrangler secret put` o en GitHub Actions.
- Cron jobs declarados en `apps/web/app/api/cron/*` protegidos por `CRON_SECRET`.

## 12. Recursos reutilizados de aaora-solutions

- Disciplina de commits y pushes explícitos.
- Lockfile congelado en CI.
- E2E contra preview (no solo dev).
- Pruebas por alcance.
- Tokens visuales centralizados.
- Respeto de `prefers-reduced-motion`.

No se reutiliza el código de consultora, estética teal ni despliegue a GitHub Pages.
