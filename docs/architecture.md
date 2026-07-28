# Arquitectura

## Vista general

```text
Visitante / Cliente / Tatuador / Admin / Superadmin
                │
                ▼
        Next.js en Cloudflare Workers (OpenNext)
                │
   ┌────────────┼─────────────────────────────┐
   │            │                             │
Supabase Auth  Supabase Postgres + RLS   Supabase Storage
                │                             │
                │                             │
        Cloudflare Cron Triggers         Cloudflare Queues (futuro)
                │                             │
                ▼                             ▼
        Google Calendar API          Meta WhatsApp Cloud API
                ▲                             ▲
                │                             │
        Resend (email fallback)       Resend
```

## Capas

### Frontend (Next.js 15)

- App Router con grupos `(public)`, `(booking)`, `(auth)`, `(admin)` y `(superadmin)`.
- Server Components para páginas que solo leen datos.
- Server Actions para mutaciones.
- Route Handlers para webhooks y OAuth callbacks.
- TypeScript estricto y `typedRoutes`.

### Backend (Server Actions + Route Handlers)

- Toda mutación pasa por Server Actions validadas con Zod.
- Route Handlers gestionan webhooks (Google, WhatsApp) y Cron.
- Lógica de negocio vive en `packages/domain` y se prueba sin Next.js.

### Persistencia (Supabase Postgres)

- Esquema público con RLS obligatoria.
- Funciones helper: `current_role`, `current_studio_id`, `is_superadmin`, `is_studio_owner`, `is_artist_admin`.
- Exclusiones GiST para prevenir dobles reservas.
- Triggers de auditoría.

### Integraciones

- `packages/google`: REST directo a Calendar API. Cifrado AES-GCM para tokens.
- `packages/whatsapp`: cliente Cloud API para plantillas.
- `packages/email`: cliente Resend.
- `packages/email` se usa para invitaciones, recuperaciones y backup de WhatsApp.

### Edge / runtime

- Cloudflare Workers (OpenNext).
- Variables planas en `wrangler.jsonc`.
- Secretes en `wrangler secret put`.
- Cron jobs autenticados con `CRON_SECRET`.

## Datos

Entidades principales en `packages/db/migrations/0001_init.sql`:

- `studios`, `user_profiles`, `studio_memberships`.
- `artist_profiles`, `social_links`, `services`, `availability_rules`, `availability_exceptions`.
- `clients`, `appointments`, `booking_holds`.
- `portfolio_items`, `portfolio_images`.
- `events`, `event_artists`.
- `google_connections`, `calendar_events`, `sync_channels`, `sync_log`.
- `notification_outbox`, `audit_logs`.

## Reserva

1. Cliente selecciona tatuador y servicio.
2. `packages/domain/booking/slots.ts` genera slots considerando reglas, excepciones, citas y eventos de Google.
3. Cliente envía formulario → `POST` en Server Action.
4. Server Action llama a `public.create_booking_hold` (10 minutos).
5. Notificación WhatsApp con enlace seguro.
6. Tatuador confirma → `public.materialize_appointment` (estado `pending`).
7. Job crea evento Google vía `packages/google`.
8. Cliente confirma o rechaza vía enlace (sin cuenta).

## Roles

| Rol | Alcance |
|---|---|
| `anon` | Landing, portafolio público, eventos publicados, reserva sin cuenta |
| `platform_superadmin` | Acceso total multiestudio |
| `studio_owner` | Gestión completa del estudio |
| `artist_admin` | Su perfil, portafolio, disponibilidad y citas |
| `staff_readonly` | Lectura del estudio |

## Observabilidad

- `wrangler.jsonc` con `observability.enabled: true`.
- Cloudflare Workers Logs (incluido).
- `notification_outbox` para reintentos.
- `sync_log` para depurar Google.
- `audit_logs` para investigar cambios sensibles.