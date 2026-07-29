import Link from 'next/link';
import { CalendarDays, UserSquare2, ShieldCheck, Lock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser, getCurrentProfile } from '@/lib/supabase/current-user';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  ScheduleBadge,
  ScheduleText,
  type ScheduleKind,
} from '@/components/artists/schedule-badge';

type ArtistRow = {
  id: string;
  slug: string;
  display_name: string;
  bio: string | null;
  headline: string | null;
  city: string | null;
  years_active: number | null;
  schedule_kind: ScheduleKind | null;
  schedule_weeks: number | null;
  featured: boolean;
  is_active: boolean;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  website: string | null;
};

export const dynamic = 'force-dynamic';

export default async function CuentaLanding() {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  if (!user || !profile) return null;

  const supabase = await createSupabaseServerClient();

  let artistRow: ArtistRow | null = null;
  if (profile.role === 'artist') {
    const { data } = await supabase
      .from('tattoo_artists')
      .select(
        'id, slug, display_name, bio, headline, city, years_active, schedule_kind, schedule_weeks, featured, is_active, instagram, twitter, youtube, website',
      )
      .eq('profile_id', user.id)
      .limit(1);
    artistRow = (data as ArtistRow[] | null)?.[0] ?? null;
  }

  const cards: Array<{
    href: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    hidden?: boolean;
  }> = [
    {
      href: '/cuenta/perfil',
      title: 'Perfil del tatuador',
      description: 'Edita biografía, foto, ciudad, años tatuando, tipo de agenda y redes sociales.',
      icon: UserSquare2,
      hidden: profile.role !== 'artist',
    },
    {
      href: '/admin/calendar',
      title: 'Agenda',
      description:
        profile.role === 'admin' ? 'Todas las citas del estudio.' : 'Tus próximas citas.',
      icon: CalendarDays,
    },
    {
      href: '/admin',
      title: 'Panel',
      description: 'Resumen y accesos rápidos.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-display text-3xl">
          Hola{profile.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>{user.email}</span>
          <Badge variant="outline">{profile.role}</Badge>
        </p>
      </header>

      {artistRow && (
        <Card>
          <CardHeader>
            <CardTitle>Tu perfil público</CardTitle>
            <CardDescription>
              Visible en{' '}
              <Link href={`/tatuadores/${artistRow.slug}`} className="text-gold hover:underline">
                /tatuadores/{artistRow.slug}
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium">{artistRow.display_name}</span>
              {artistRow.featured && <Badge>Destacado</Badge>}
              {!artistRow.is_active && <Badge variant="muted">Inactivo</Badge>}
            </div>
            {(artistRow.city || artistRow.years_active !== null) && (
              <div className="text-muted-foreground">
                {artistRow.city ?? '—'}
                {artistRow.years_active !== null
                  ? ` · ${artistRow.years_active} años tatuando`
                  : ''}
              </div>
            )}
            {artistRow.schedule_kind && (
              <div className="flex flex-wrap items-center gap-2">
                <ScheduleBadge kind={artistRow.schedule_kind} weeks={artistRow.schedule_weeks} />
                <span className="text-muted-foreground text-sm">
                  <ScheduleText kind={artistRow.schedule_kind} weeks={artistRow.schedule_weeks} />
                </span>
              </div>
            )}
            {artistRow.bio && <p className="text-muted-foreground line-clamp-3">{artistRow.bio}</p>}
            <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
              {artistRow.instagram && (
                <a
                  className="hover:underline"
                  href={`https://instagram.com/${artistRow.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{artistRow.instagram}
                </a>
              )}
              {artistRow.twitter && <span>twitter: {artistRow.twitter}</span>}
              {artistRow.youtube && <span>youtube: {artistRow.youtube}</span>}
              {artistRow.website && <span>web: {artistRow.website}</span>}
              {!artistRow.instagram &&
                !artistRow.twitter &&
                !artistRow.youtube &&
                !artistRow.website && <span>Sin redes sociales configuradas.</span>}
            </div>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        {cards
          .filter((c) => !c.hidden)
          .map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.href} href={c.href} className="transition-opacity hover:opacity-80">
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                    <Icon className="text-gold mt-1 h-5 w-5" aria-hidden="true" />
                    <div className="space-y-1.5">
                      <CardTitle>{c.title}</CardTitle>
                      <CardDescription>{c.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <Lock className="text-muted-foreground h-4 w-4" aria-hidden="true" />
          <CardDescription>
            Cambios de email, password y eliminación de cuenta se gestionan desde el panel de
            Supabase (este MVP no expone esas acciones).
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
