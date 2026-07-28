# Modelo de amenazas

Análisis STRIDE resumido para la beta.

## Spoofing (suplantación)

- **Riesgo:** cliente usa token de cita para ver/modificar otras citas.
- **Mitigación:** tokens de cliente aleatorios (32 bytes) con hash SHA-256 en DB; comparación en tiempo constante; expiración 7 días.

## Tampering (manipulación)

- **Riesgo:** manipular precios, disponibilidad o roles.
- **Mitigación:** RLS en Postgres; Server Actions validan inputs con Zod; nunca exponer service role key.

## Repudiation (repudio)

- **Riesgo:** un admin niega haber modificado algo.
- **Mitigación:** `audit_logs` con actor_user_id, actor_role, entidad y payload JSON.

## Information Disclosure (filtración)

- **Riesgo:** fuga de datos de clientes vía API pública.
- **Mitigación:** RLS con `anon` solo a tablas explícitamente públicas; Supabase Storage con políticas; tokens cifrados; HSTS; CSP; CORS restringido.

## Denial of Service

- **Riesgo:** abuso de endpoints de cron o webhooks.
- **Mitigación:** autenticación por secreto compartido; Cloudflare DDoS; budgets de gasto en Cloudflare; spend caps en Supabase.

## Elevation of Privilege

- **Riesgo:** tatuador edita el estudio de otro.
- **Mitigación:** RLS por `studio_id`; funciones `is_studio_owner`, `is_artist_admin`; pruebas negativas en Playwright.

## Amenazas externas

### Meta WhatsApp

- Plantillas deben pasar aprobación; sin aprobación no se puede iniciar conversación.
- Custodia de `WHATSAPP_ACCESS_TOKEN`; rotar si se filtra.

### Google Calendar

- Scopes sensibles; verificación puede tardar 10 días.
- Refresh tokens cifrados con AES-GCM.
- Revocar conexión si `google_connections.status = 'expired'`.

### Resend

- API key restringida al dominio verificado.
- Listas de supresión automáticas gestionadas por Resend.

## Backups

- Base de datos: Supabase Pro con backups diarios (7 días).
- Objetos: Supabase Storage con versionado opcional.
- Cifrado en reposo gestionado por Supabase.

## Pendientes

- MFA obligatorio para `studio_owner` y `platform_superadmin` desde semana 2.
- Rotación trimestral de tokens de servicio.
- Auditoría anual de dependencias.