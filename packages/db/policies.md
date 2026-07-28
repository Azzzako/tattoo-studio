# Authorization matrix

All authorization is enforced server-side through Postgres RLS policies. UI affordances are never a substitute for these checks.

| Role | studios | user_profiles | memberships | artists | social | services | availability | clients | appointments | portfolio | events | google |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| anon | – | – | – | read public | read public | read public | – | – | read via token | read public | read published | – |
| platform_superadmin | full | full | full | full | full | full | full | full | full | full | full | full |
| studio_owner | read own | read all | manage own | manage | manage | manage | manage | manage | manage | manage | manage | manage |
| artist_admin | read own | read all | read self | read self + update own | manage own | manage own | manage own | manage related | manage own | manage own | read | manage own |
| staff_readonly | read own | read all | read self | read studio | read studio | read studio | read studio | read studio | read studio | read studio | read studio | read studio |

## Object-level rules

- `appointments.client_token_hash` matches the random token in the URL the client receives.
- `google_connections.refresh_token_cipher` is encrypted with AES-GCM using `TOKEN_ENCRYPTION_KEY`.
- `audit_logs` are append-only and include actor id, role and entity.

## Multi-tenant rules

Every business row carries `studio_id` and RLS policies compare it to `public.current_studio_id()` for the authenticated user.