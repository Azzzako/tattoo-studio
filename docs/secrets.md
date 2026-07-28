# GitHub Secrets

Secrets requeridos para CI y deploy. Configurar vía `gh secret set` o en `Settings → Secrets and variables → Actions`.

## Secrets obligatorios

### Aplicación

| Nombre | Descripción |
|---|---|
| `APP_URL` | URL pública (ej. `https://tattoo-studio.example.com`) |
| `STUDIO_ID` | UUID del estudio seed (por defecto `00000000-0000-0000-0000-000000000001`) |

### Supabase

| Nombre | Descripción |
|---|---|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Llave anon pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave service role (solo servidor) |
| `SUPABASE_DB_URL` | URL Postgres directa para migraciones |

### Cifrado

| Nombre | Descripción |
|---|---|
| `TOKEN_ENCRYPTION_KEY` | AES-GCM ≥32 caracteres para cifrar tokens de Google |

### Email (Resend)

| Nombre | Descripción |
|---|---|
| `RESEND_API_KEY` | API key de Resend |
| `RESEND_FROM_EMAIL` | Remitente verificado |

### Google Calendar

| Nombre | Descripción |
|---|---|
| `GOOGLE_OAUTH_CLIENT_ID` | OAuth client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_OAUTH_REDIRECT_URI` | `https://APP_URL/api/google/oauth/callback` |

### Meta WhatsApp

| Nombre | Descripción |
|---|---|
| `WHATSAPP_PHONE_ID` | Phone number ID |
| `WHATSAPP_ACCESS_TOKEN` | System user access token |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Business account ID |

### Cloudflare (deploy)

| Nombre | Descripción |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Account ID |
| `CLOUDFLARE_API_TOKEN` | Token con scope `Workers Scripts:Edit` |

### Cron

| Nombre | Descripción |
|---|---|
| `CRON_SECRET` | Secreto compartido para endpoints `/api/cron/*` |

## Configuración con `gh`

```bash
gh secret set APP_URL --body "https://tattoo-studio.example.com"
gh secret set SUPABASE_URL --body "https://xxx.supabase.co"
gh secret set SUPABASE_ANON_KEY --body "..."
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "..."
gh secret set SUPABASE_DB_URL --body "postgresql://..."
gh secret set TOKEN_ENCRYPTION_KEY --body "$(openssl rand -hex 32)"
gh secret set RESEND_API_KEY --body "..."
gh secret set RESEND_FROM_EMAIL --body "no-reply@tattoo-studio.example.com"
gh secret set GOOGLE_OAUTH_CLIENT_ID --body "..."
gh secret set GOOGLE_OAUTH_CLIENT_SECRET --body "..."
gh secret set GOOGLE_OAUTH_REDIRECT_URI --body "https://tattoo-studio.example.com/api/google/oauth/callback"
gh secret set WHATSAPP_PHONE_ID --body "..."
gh secret set WHATSAPP_ACCESS_TOKEN --body "..."
gh secret set WHATSAPP_BUSINESS_ACCOUNT_ID --body "..."
gh secret set CLOUDFLARE_ACCOUNT_ID --body "..."
gh secret set CLOUDFLARE_API_TOKEN --body "..."
gh secret set CRON_SECRET --body "$(openssl rand -hex 32)"
```

## Variables (no secretas)

Variables públicas también necesarias. Configurar en `Settings → Secrets and variables → Actions → Variables`:

| Nombre | Valor |
|---|---|
| `DEFAULT_TZ` | `America/Mexico_City` |
| `DEFAULT_LOCALE` | `es-MX` |

```bash
gh variable set DEFAULT_TZ --body "America/Mexico_City"
gh variable set DEFAULT_LOCALE --body "es-MX"
```

## Branch protection (GitHub Pro)

Cuando la cuenta sea Pro o el repo sea público, habilitar:

```bash
gh api -X PUT /repos/Azzzako/tattoo-studio/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  --input .github/branch-protection.json
```

`branch-protection.json`:

```json
{
  "required_status_checks": { "strict": true, "contexts": ["verify"] },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 1
  },
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
```

## Limitación actual

Repos privados en plan Free **no soportan branch protection**. Mantengo la rama `main` desprotegida temporalmente hasta:

1. Actualizar a GitHub Pro.
2. Hacer el repo público.
3. Aplicar la configuración anterior.

Mientras tanto, se confía en disciplina local y revisión manual.

## Verificación

Después de configurar:

1. Hacer push a una rama `feat/test-secrets`.
2. Abrir PR contra `main`.
3. CI debe correr `verify` con éxito.
4. Confirmar que no aparecen secretos en logs.