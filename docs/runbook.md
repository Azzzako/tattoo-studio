# Runbook

Procedimientos operativos durante beta.

## Despliegue

1. Crear PR contra `develop`.
2. CI debe pasar (format, lint, typecheck, test, build).
3. Merge a `staging` para pruebas internas.
4. Una vez validado, abrir PR a `main`.
5. Merge a `main` dispara auto-deploy en Vercel (configurado por la integración del repo).

## Secretes requeridos

Configurar antes del primer deploy en **Vercel → Project → Settings → Environment Variables**. Variables planas (no sensibles) van en el mismo lugar. Para variables sensibles a nivel de entorno (preview / production) usar Environment Variables por ambiente.

`TOKEN_ENCRYPTION_KEY` debe tener al menos 32 caracteres (generar con `openssl rand -hex 32`).

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

## Flujo publico: Cotizar / Reservar

El wizard en `/tatuadores/{slug}/reservar/` bifurca entre dos subflujos:

### Cotizar (`submitQuote` server action)

1. Cliente llena idea (>=10 chars), opcional budget MXN, hasta 5 adjuntos
   (jpeg/png/webp, 8 MB c/u).
2. Server action sube adjuntos al bucket publico `quote-attachments`
   (`{studio_id}/{quote_id}/{n}.{ext}`).
3. Inserta row en `quotes` + rows en `quote_attachments` (admin client, RLS bypass).
4. Construye mensaje wa.me con summary + URLs publicas de los adjuntos.
5. Devuelve `whatsappUrl`. Cliente hace click -> abre WhatsApp con texto
   pre-armado al numero del estudio (`NEXT_PUBLIC_STUDIO_WHATSAPP` o
   `WHATSAPP_PHONE_ID`).
6. Estudio recibe el mensaje como iniciado-por-cliente. No requiere
   templates pre-aprobados en Meta WhatsApp Business.

### Reservar (`submitBooking` server action)

1. Cliente elige servicio + slot (datepicker real, slots via
   `listSlots()`).
2. Server action valida slot libre (overlap check contra
   `appointments` no cancelados).
3. Upsert customer por `(studio_id, phone_e164)`.
4. Inserta `appointments` row con `status='pending'` y `source='web'`.
5. Construye mensaje wa.me confirmando al estudio.
6. Estudio confirma al cliente via WhatsApp (respuesta manual o via
   route handler cuando templates aprueben).

### Configuracion

- `NEXT_PUBLIC_STUDIO_WHATSAPP`: numero del estudio en formato E.164
  sin `+` (ej. `5215512345678`). Expuesto al cliente para construir
  el wa.me URL.
- `WHATSAPP_PHONE_ID`: id que Meta dio al numero. Usado por el server
  para llamadas futuras a Cloud API (cuando se aprueben templates).

### Migration a Meta Cloud API (futuro)

Cuando Meta apruebe templates `quote_received` y `booking_pending`,
migrar de `wa.me` a POST `/v18.0/{phone_id}/messages`. La funcion
`buildWhatsAppUrl()` queda como fallback. Las columnas `quotes` y
`appointments` ya tienen todos los datos que la API necesita.

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
