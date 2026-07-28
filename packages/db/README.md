# Database

PostgreSQL via Supabase. All schemas live in the public schema with RLS enabled.

## Files

- `migrations/0001_init.sql`: tables, types, constraints.
- `migrations/0002_rls.sql`: RLS policies and helper functions.
- `migrations/0003_booking.sql`: slot, hold and reservation helpers.
- `migrations/0004_seed.sql`: seed data for the demo studio.

## Helper functions

- `public.current_role()`: highest priority active membership role.
- `public.current_studio_id()`: current studio of the user.
- `public.is_superadmin()`: true for `platform_superadmin`.
- `public.is_studio_owner(uuid)`: true for `studio_owner` of given studio.
- `public.is_artist_admin(uuid)`: true for `artist_admin` of given artist.
- `public.is_slot_available(uuid, tstzrange)`: true if no conflict exists.
- `public.create_booking_hold(uuid, uuid, tstzrange, integer)`: short-lived reservation.
- `public.materialize_appointment(...)`: atomic transition from hold to pending appointment.

## Conflict prevention

- `appointments` has an `exclude using gist (artist_id with =, range with &&)` for `pending` or `confirmed`.
- `booking_holds` has the same exclusion while the hold is unexpired.
- `calendar_events` has the same exclusion for busy events.

These exclusions make double bookings impossible at the database layer.

## Conventions

- All timestamps stored in UTC.
- IANA timezone strings stored alongside ranges.
- All foreign keys include `on delete` behavior.
