-- 0003_booking.sql
-- Helpers for availability computation and pending reservation flow.

create or replace function public.is_slot_available(
  p_artist_id uuid,
  p_range tstzrange
) returns boolean
language plpgsql
stable
as $$
declare
  v_conflict_appointment int;
  v_conflict_hold int;
  v_conflict_calendar int;
begin
  select 1 into v_conflict_appointment
  from appointments
  where artist_id = p_artist_id
    and range && p_range
    and status in ('pending', 'confirmed')
  limit 1;
  if found then
    return false;
  end if;

  select 1 into v_conflict_hold
  from booking_holds
  where artist_id = p_artist_id
    and range && p_range
    and expires_at > now()
  limit 1;
  if found then
    return false;
  end if;

  select 1 into v_conflict_calendar
  from calendar_events
  where artist_id = p_artist_id
    and range && p_range
    and is_busy = true
  limit 1;
  if found then
    return false;
  end if;

  return true;
end;
$$;

create or replace function public.create_booking_hold(
  p_studio_id uuid,
  p_artist_id uuid,
  p_range tstzrange,
  p_hold_minutes integer default 10
) returns uuid
language plpgsql
as $$
declare
  v_id uuid;
begin
  if not public.is_slot_available(p_artist_id, p_range) then
    raise exception 'slot_unavailable';
  end if;
  insert into booking_holds (studio_id, artist_id, range, expires_at, reason)
  values (p_studio_id, p_artist_id, p_range, now() + (p_hold_minutes || ' minutes')::interval, 'booking_attempt')
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.materialize_appointment(
  p_studio_id uuid,
  p_artist_id uuid,
  p_service_id uuid,
  p_client_id uuid,
  p_range tstzrange,
  p_timezone text,
  p_description text default null,
  p_client_token_hash text default null,
  p_client_token_expires_at timestamptz default null
) returns uuid
language plpgsql
as $$
declare
  v_id uuid;
begin
  if not public.is_slot_available(p_artist_id, p_range) then
    raise exception 'slot_unavailable';
  end if;
  insert into appointments (
    studio_id,
    artist_id,
    service_id,
    client_id,
    status,
    range,
    timezone,
    description,
    client_token_hash,
    client_token_expires_at
  )
  values (
    p_studio_id,
    p_artist_id,
    p_service_id,
    p_client_id,
    'pending',
    p_range,
    p_timezone,
    p_description,
    p_client_token_hash,
    p_client_token_expires_at
  )
  returning id into v_id;
  delete from booking_holds where artist_id = p_artist_id and range && p_range;
  return v_id;
end;
$$;