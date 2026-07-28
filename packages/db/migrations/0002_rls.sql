-- 0002_rls.sql
-- Row Level Security policies for all business tables.

create or replace function public.current_role() returns membership_role
language sql stable
as $$
  select coalesce(
    (
      select role
      from studio_memberships sm
      where sm.user_id = auth.uid()
        and sm.status = 'active'
      order by case sm.role
        when 'platform_superadmin' then 1
        when 'studio_owner' then 2
        when 'artist_admin' then 3
        else 4
      end
      limit 1
    ),
    'staff_readonly'::membership_role
  );
$$;

create or replace function public.current_studio_id() returns uuid
language sql stable
as $$
  select studio_id
  from studio_memberships
  where user_id = auth.uid()
    and status = 'active'
  order by case role
    when 'platform_superadmin' then 1
    when 'studio_owner' then 2
    when 'artist_admin' then 3
    else 4
  end
  limit 1;
$$;

create or replace function public.is_superadmin() returns boolean
language sql stable
as $$
  select exists (
    select 1 from studio_memberships
    where user_id = auth.uid()
      and status = 'active'
      and role = 'platform_superadmin'
  );
$$;

create or replace function public.is_studio_owner(p_studio_id uuid) returns boolean
language sql stable
as $$
  select exists (
    select 1 from studio_memberships
    where user_id = auth.uid()
      and status = 'active'
      and role = 'studio_owner'
      and studio_id = p_studio_id
  );
$$;

create or replace function public.is_artist_admin(p_artist_id uuid) returns boolean
language sql stable
as $$
  select exists (
    select 1 from studio_memberships sm
    join artist_profiles ap on ap.studio_id = sm.studio_id
    where sm.user_id = auth.uid()
      and sm.status = 'active'
      and sm.role = 'artist_admin'
      and ap.id = p_artist_id
  );
$$;

-- studios
alter table studios enable row level security;
create policy "Studios: superadmin full access"
  on studios for all to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());
create policy "Studios: members can read their own"
  on studios for select to authenticated
  using (id = public.current_studio_id());

-- user_profiles
alter table user_profiles enable row level security;
create policy "Profiles: self read/write"
  on user_profiles for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy "Profiles: studio members read each other"
  on user_profiles for select to authenticated
  using (studio_id = public.current_studio_id());

-- studio_memberships
alter table studio_memberships enable row level security;
create policy "Memberships: self read"
  on studio_memberships for select to authenticated
  using (user_id = auth.uid());
create policy "Memberships: superadmin full access"
  on studio_memberships for all to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());
create policy "Memberships: studio owners manage their studio"
  on studio_memberships for all to authenticated
  using (public.is_studio_owner(studio_id))
  with check (public.is_studio_owner(studio_id));

-- artist_profiles
alter table artist_profiles enable row level security;
create policy "Artists: public read"
  on artist_profiles for select to anon, authenticated
  using (is_public = true and is_active = true);
create policy "Artists: studio members read all"
  on artist_profiles for select to authenticated
  using (studio_id = public.current_studio_id());
create policy "Artists: studio owners manage"
  on artist_profiles for all to authenticated
  using (public.is_studio_owner(studio_id))
  with check (public.is_studio_owner(studio_id));
create policy "Artists: self manage"
  on artist_profiles for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- social_links
alter table social_links enable row level security;
create policy "Social: public read"
  on social_links for select to anon, authenticated
  using (
    exists (
      select 1 from artist_profiles ap
      where ap.id = social_links.artist_id
        and ap.is_public = true
        and ap.is_active = true
    )
  );
create policy "Social: studio members read all"
  on social_links for select to authenticated
  using (
    exists (
      select 1 from artist_profiles ap
      where ap.id = social_links.artist_id
        and ap.studio_id = public.current_studio_id()
    )
  );
create policy "Social: studio owners write"
  on social_links for all to authenticated
  using (
    exists (
      select 1 from artist_profiles ap
      where ap.id = social_links.artist_id and public.is_studio_owner(ap.studio_id)
    )
  )
  with check (
    exists (
      select 1 from artist_profiles ap
      where ap.id = social_links.artist_id and public.is_studio_owner(ap.studio_id)
    )
  );
create policy "Social: artist self write"
  on social_links for all to authenticated
  using (public.is_artist_admin(artist_id))
  with check (public.is_artist_admin(artist_id));

-- services
alter table services enable row level security;
create policy "Services: public read"
  on services for select to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1 from artist_profiles ap
      where ap.id = services.artist_id and ap.is_public = true and ap.is_active = true
    )
  );
create policy "Services: studio members read all"
  on services for select to authenticated
  using (studio_id = public.current_studio_id());
create policy "Services: studio owners write"
  on services for all to authenticated
  using (public.is_studio_owner(studio_id))
  with check (public.is_studio_owner(studio_id));
create policy "Services: artist self write"
  on services for all to authenticated
  using (public.is_artist_admin(artist_id))
  with check (public.is_artist_admin(artist_id));

-- availability_rules / exceptions
alter table availability_rules enable row level security;
create policy "Availability rules: studio members read"
  on availability_rules for select to authenticated
  using (
    exists (
      select 1 from artist_profiles ap
      where ap.id = availability_rules.artist_id and ap.studio_id = public.current_studio_id()
    )
  );
create policy "Availability rules: studio owners write"
  on availability_rules for all to authenticated
  using (
    exists (
      select 1 from artist_profiles ap
      where ap.id = availability_rules.artist_id and public.is_studio_owner(ap.studio_id)
    )
  )
  with check (
    exists (
      select 1 from artist_profiles ap
      where ap.id = availability_rules.artist_id and public.is_studio_owner(ap.studio_id)
    )
  );
create policy "Availability rules: artist self write"
  on availability_rules for all to authenticated
  using (public.is_artist_admin(artist_id))
  with check (public.is_artist_admin(artist_id));

alter table availability_exceptions enable row level security;
create policy "Availability exceptions: studio members read"
  on availability_exceptions for select to authenticated
  using (
    exists (
      select 1 from artist_profiles ap
      where ap.id = availability_exceptions.artist_id and ap.studio_id = public.current_studio_id()
    )
  );
create policy "Availability exceptions: studio owners write"
  on availability_exceptions for all to authenticated
  using (
    exists (
      select 1 from artist_profiles ap
      where ap.id = availability_exceptions.artist_id and public.is_studio_owner(ap.studio_id)
    )
  )
  with check (
    exists (
      select 1 from artist_profiles ap
      where ap.id = availability_exceptions.artist_id and public.is_studio_owner(ap.studio_id)
    )
  );
create policy "Availability exceptions: artist self write"
  on availability_exceptions for all to authenticated
  using (public.is_artist_admin(artist_id))
  with check (public.is_artist_admin(artist_id));

-- clients
alter table clients enable row level security;
create policy "Clients: studio members read"
  on clients for select to authenticated
  using (studio_id = public.current_studio_id());
create policy "Clients: studio owners write"
  on clients for all to authenticated
  using (public.is_studio_owner(studio_id))
  with check (public.is_studio_owner(studio_id));
create policy "Clients: artist self write"
  on clients for all to authenticated
  using (
    exists (
      select 1 from appointments a
      where a.client_id = clients.id and public.is_artist_admin(a.artist_id)
    )
  )
  with check (
    exists (
      select 1 from appointments a
      where a.client_id = clients.id and public.is_artist_admin(a.artist_id)
    )
  );

-- appointments
alter table appointments enable row level security;
create policy "Appointments: studio members read"
  on appointments for select to authenticated
  using (studio_id = public.current_studio_id());
create policy "Appointments: studio owners write"
  on appointments for all to authenticated
  using (public.is_studio_owner(studio_id))
  with check (public.is_studio_owner(studio_id));
create policy "Appointments: artist self write"
  on appointments for all to authenticated
  using (public.is_artist_admin(artist_id))
  with check (public.is_artist_admin(artist_id));
create policy "Appointments: client token read"
  on appointments for select to anon, authenticated
  using (
    client_token_hash = current_setting('app.client_token', true)
  );

-- booking_holds
alter table booking_holds enable row level security;
create policy "Holds: studio members read"
  on booking_holds for select to authenticated
  using (studio_id = public.current_studio_id());
create policy "Holds: studio owners write"
  on booking_holds for all to authenticated
  using (public.is_studio_owner(studio_id))
  with check (public.is_studio_owner(studio_id));
create policy "Holds: artist self write"
  on booking_holds for all to authenticated
  using (public.is_artist_admin(artist_id))
  with check (public.is_artist_admin(artist_id));

-- portfolio_items / portfolio_images
alter table portfolio_items enable row level security;
create policy "Portfolio: public read"
  on portfolio_items for select to anon, authenticated
  using (
    is_public = true and is_featured = false is not true
  );
create policy "Portfolio: public featured read"
  on portfolio_items for select to anon, authenticated
  using (is_public = true);
create policy "Portfolio: studio members read all"
  on portfolio_items for select to authenticated
  using (studio_id = public.current_studio_id());
create policy "Portfolio: studio owners write"
  on portfolio_items for all to authenticated
  using (public.is_studio_owner(studio_id))
  with check (public.is_studio_owner(studio_id));
create policy "Portfolio: artist self write"
  on portfolio_items for all to authenticated
  using (public.is_artist_admin(artist_id))
  with check (public.is_artist_admin(artist_id));

alter table portfolio_images enable row level security;
create policy "Portfolio images: public read"
  on portfolio_images for select to anon, authenticated
  using (
    exists (
      select 1 from portfolio_items pi
      where pi.id = portfolio_images.portfolio_item_id and pi.is_public = true
    )
  );
create policy "Portfolio images: studio members read all"
  on portfolio_images for select to authenticated
  using (
    exists (
      select 1 from portfolio_items pi
      where pi.id = portfolio_images.portfolio_item_id and pi.studio_id = public.current_studio_id()
    )
  );
create policy "Portfolio images: studio owners write"
  on portfolio_images for all to authenticated
  using (
    exists (
      select 1 from portfolio_items pi
      where pi.id = portfolio_images.portfolio_item_id and public.is_studio_owner(pi.studio_id)
    )
  )
  with check (
    exists (
      select 1 from portfolio_items pi
      where pi.id = portfolio_images.portfolio_item_id and public.is_studio_owner(pi.studio_id)
    )
  );
create policy "Portfolio images: artist self write"
  on portfolio_images for all to authenticated
  using (
    exists (
      select 1 from portfolio_items pi
      where pi.id = portfolio_images.portfolio_item_id and public.is_artist_admin(pi.artist_id)
    )
  )
  with check (
    exists (
      select 1 from portfolio_items pi
      where pi.id = portfolio_images.portfolio_item_id and public.is_artist_admin(pi.artist_id)
    )
  );

-- events
alter table events enable row level security;
create policy "Events: public read"
  on events for select to anon, authenticated
  using (is_published = true);
create policy "Events: studio members read all"
  on events for select to authenticated
  using (studio_id = public.current_studio_id());
create policy "Events: studio owners write"
  on events for all to authenticated
  using (public.is_studio_owner(studio_id))
  with check (public.is_studio_owner(studio_id));
create policy "Events: superadmin write"
  on events for all to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

alter table event_artists enable row level security;
create policy "Event artists: public read"
  on event_artists for select to anon, authenticated
  using (
    exists (
      select 1 from events e
      where e.id = event_artists.event_id and e.is_published = true
    )
  );
create policy "Event artists: studio members read"
  on event_artists for select to authenticated
  using (
    exists (
      select 1 from events e
      where e.id = event_artists.event_id and e.studio_id = public.current_studio_id()
    )
  );
create policy "Event artists: studio owners write"
  on event_artists for all to authenticated
  using (
    exists (
      select 1 from events e
      where e.id = event_artists.event_id and public.is_studio_owner(e.studio_id)
    )
  )
  with check (
    exists (
      select 1 from events e
      where e.id = event_artists.event_id and public.is_studio_owner(e.studio_id)
    )
  );

-- google_connections
alter table google_connections enable row level security;
create policy "Google: studio members read"
  on google_connections for select to authenticated
  using (studio_id = public.current_studio_id());
create policy "Google: studio owners write"
  on google_connections for all to authenticated
  using (public.is_studio_owner(studio_id))
  with check (public.is_studio_owner(studio_id));
create policy "Google: artist self write"
  on google_connections for all to authenticated
  using (public.is_artist_admin(artist_id))
  with check (public.is_artist_admin(artist_id));

-- calendar_events
alter table calendar_events enable row level security;
create policy "Calendar events: studio members read"
  on calendar_events for select to authenticated
  using (
    exists (
      select 1 from artist_profiles ap
      where ap.id = calendar_events.artist_id and ap.studio_id = public.current_studio_id()
    )
  );

-- sync_channels / sync_log
alter table sync_channels enable row level security;
create policy "Sync channels: studio members read"
  on sync_channels for select to authenticated
  using (
    exists (
      select 1 from artist_profiles ap
      where ap.id = sync_channels.artist_id and ap.studio_id = public.current_studio_id()
    )
  );
create policy "Sync channels: artist self write"
  on sync_channels for all to authenticated
  using (public.is_artist_admin(artist_id))
  with check (public.is_artist_admin(artist_id));

alter table sync_log enable row level security;
create policy "Sync log: studio members read"
  on sync_log for select to authenticated
  using (
    exists (
      select 1 from artist_profiles ap
      where ap.id = sync_log.artist_id and ap.studio_id = public.current_studio_id()
    )
  );

-- notification_outbox
alter table notification_outbox enable row level security;
create policy "Notifications: studio members read"
  on notification_outbox for select to authenticated
  using (studio_id = public.current_studio_id());

-- audit_logs
alter table audit_logs enable row level security;
create policy "Audit: studio members read"
  on audit_logs for select to authenticated
  using (studio_id = public.current_studio_id() or public.is_superadmin());
create policy "Audit: superadmin read all"
  on audit_logs for select to authenticated
  using (public.is_superadmin());