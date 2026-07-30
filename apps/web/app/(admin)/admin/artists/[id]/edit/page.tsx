import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarUpload } from '@/app/cuenta/perfil/avatar-upload';
import { requireAdmin } from '@/lib/supabase/guards';
import { createSupabaseServerClient } from '@/lib/supabase/server';

import { AdminArtistForm } from './admin-artist-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function AdminArtistEditPage({ params }: PageProps) {
  const profile = await requireAdmin();
  if (profile.role !== 'admin') redirect('/admin?message=Solo%20administradores');
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: artistRow } = await supabase
    .from('tattoo_artists')
    .select(
      'id, slug, display_name, headline, bio, long_bio, specialties, is_active, featured, avatar_path, instagram, twitter, youtube, website, city, years_active, schedule_kind, schedule_weeks',
    )
    .eq('id', id)
    .maybeSingle();

  if (!artistRow) notFound();
  const a = artistRow as {
    id: string;
    slug: string;
    display_name: string;
    headline: string | null;
    bio: string | null;
    long_bio: string | null;
    specialties: string[] | null;
    is_active: boolean;
    featured: boolean;
    avatar_path: string | null;
    instagram: string | null;
    twitter: string | null;
    youtube: string | null;
    website: string | null;
    city: string | null;
    years_active: number | null;
    schedule_kind: string | null;
    schedule_weeks: number | null;
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/artists" className="flex items-center gap-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Volver
          </Link>
        </Button>
        <h1 className="font-display text-3xl">Editar tatuador</h1>
        <p className="text-muted-foreground text-sm">
          <code>{a.slug}</code> · public view:{' '}
          <Link href={`/tatuadores/${a.slug}`} className="text-gold hover:underline">
            /tatuadores/{a.slug}
          </Link>
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>
            El cambio de avatar es directo (no requiere aprobación).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload initialUrl={a.avatar_path} />
        </CardContent>
      </Card>

      <AdminArtistForm
        initial={{
          artist_id: a.id,
          display_name: a.display_name,
          headline: a.headline ?? '',
          bio: a.bio ?? '',
          long_bio: a.long_bio ?? '',
          specialties: (a.specialties ?? []).join(', '),
          city: a.city ?? '',
          years_active: a.years_active !== null ? String(a.years_active) : '',
          schedule_kind: a.schedule_kind ?? '',
          schedule_weeks: a.schedule_weeks !== null ? String(a.schedule_weeks) : '',
          instagram: a.instagram ?? '',
          twitter: a.twitter ?? '',
          youtube: a.youtube ?? '',
          website: a.website ?? '',
          is_active: a.is_active,
          featured: a.featured,
        }}
      />
    </div>
  );
}
