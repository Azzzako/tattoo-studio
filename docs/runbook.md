# Runbook

Procedimientos operativos durante beta.

## Despliegue

1. Crear PR contra `develop`.
2. CI debe pasar (format, lint, typecheck, test, build).
3. Merge a `staging` para pruebas internas.
4. Una vez validado, abrir PR a `main`.
5. Merge dispara `.github/workflows/deploy.yml` que ejecuta `opennextjs-cloudflare deploy`.

## Secretes requeridos

Configurar antes del primer deploy:

```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put TOKEN_ENCRYPTION_KEY
wrangler secret put GOOGLE_OAUTH_CLIENT_ID
wrangler secret put GOOGLE_OAUTH_CLIENT_SECRET
wrangler secret put GOOGLE_OAUTH_REDIRECT_URI
wrangler secret put WHATSAPP_PHONE_ID
wrangler secret put WHATSAPP_ACCESS_TOKEN
wrangler secret put RESEND_API_KEY
wrangler secret put RESEND_FROM_EMAIL
wrangler secret put CRON_SECRET
```

`TOKEN_ENCRYPTION_KEY` debe tener al menos 32 caracteres.

## Google Calendar

- Configurar OAuth consent screen como `External`.
- Verificar dominio en Google Search Console.
- Publicar pantalla de privacidad en `APP_URL/privacidad`.
- Solicitar verificación de scopes sensibles (10 días aprox).
- Iniciar verificación durante semana 1 del proyecto.
- Scopes iniciales:
  - `https://www.googleapis.com/auth/calendar.events`
  - `https://www.googleapis.com/auth/calendar.readonly`
  - `openid email profile`

## Meta WhatsApp

1. Crear Meta Business Manager.
2. Registrar número apto para Cloud API.
3. Crear app con producto WhatsApp.
4. Solicitar plantillas:
   - `request_received`
   - `request_confirmed`
   - `request_rejected`
   - `request_rescheduled`
   - `request_cancelled`
   - `appointment_reminder`
5. Esperar aprobación (24-72 horas por plantilla).
6. Configurar webhook `/api/whatsapp/webhook`.

## Renovar canales Google

- Cron `app/api/cron/renew-channels` corre cada 6 horas.
- Renueva canales que expiran en < 7 días.
- Si una respuesta 410 es recibida, se inicia sincronización completa.

## Reconciliación

- Cron `app/api/cron/reconcile` ejecuta diario.
- Compara últimos 60 días de `calendar_events` y `appointments`.
- Marca divergencias en `audit_logs`.

## Respaldos

- Supabase Pro incluye backups diarios (7 días).
- Exportar mensualmente vía `pg_dump` y almacenar en R2 cifrado.

## Incidentes

| Síntoma                       | Acción                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| Doble reserva                 | Revisar `audit_logs`; en beta es bug, no error del usuario                         |
| Webhook Google 410            | Iniciar sync completo desde `app/api/cron/reconcile`                               |
| Notificación WhatsApp fallida | Revisar `notification_outbox.last_error`; reintentar manualmente si es transitorio |
| Login falla                   | Revisar `SUPABASE_JWT_SECRET` y `SUPABASE_URL`                                     |
| Calendario vacío              | Verificar `calendar_events`; revisar cron de renovación                            |

## Contactos internos

- Propietario del estudio: <definir>
- Dev: <definir>
- Meta support: <definir>
- Google support: <definir>
