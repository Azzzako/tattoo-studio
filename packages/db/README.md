# @tattoo/db

SQL schemas, migraciones idempotentes y seeds para el proyecto Supabase de Tattoo Studio.

## Convenciones

- Migraciones en `migrations/` numeradas con prefijo `NNNN_*.sql`, ordenadas lexicográficamente.
- Cada migración es idempotente: usa `CREATE ... IF NOT EXISTS`, `DROP TRIGGER IF EXISTS` antes de crear, y `CREATE POLICY` sin nombre duplicado.
- Tablas de negocio llevan siempre `studio_id` (multi-tenant ready, MVP single-studio).
- RLS obligatoria en toda tabla expuesta al cliente.
- Una sola declaración `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` por tabla.

## Aplicar migraciones

### Sin CLI (cuando no hay DB password a mano)

1. `bun run db:seed` no aplica acá — se hace a mano.
2. Dashboard de Supabase del proyecto → `SQL Editor` → `New query`.
3. Pegar el contenido del archivo `migrations/XXXX_*.sql`.
4. `Run`.

### Con Supabase CLI (recomendado a futuro)

Requiere `SUPABASE_DB_PASSWORD` o `DATABASE_URL` con el password en el entorno.

```bash
bun install
bun run db:migrate
bun run db:seed
```

## Roles de la app

| Rol        | Alcance                                             |
| ---------- | --------------------------------------------------- |
| `admin`    | Dueño del estudio: CRUD total sobre su `studio_id`. |
| `artist`   | Tatuador: ve/edita sus appointments y portafolio.   |
| `customer` | Cliente: ve sus propias appointments y datos.       |

Helpers SQL expuestos via `auth.uid()`:

- `current_user_role()` → enum `user_role`
- `current_studio_id()` → uuid del estudio del usuario autenticado
