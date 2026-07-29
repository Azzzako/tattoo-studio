import { redirect } from 'next/navigation';

import { AvatarUpload } from './avatar-upload';
import { ProfileForm } from './profile-form';
import { getCurrentUser, getCurrentProfile } from '@/lib/supabase/current-user';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ArtistProfilePage() {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  if (!user) redirect('/login?message=Inicia%20sesi%C3%B3n');
  if (!profile) redirect('/cuenta');
  if (profile.role !== 'artist' && profile.role !== 'admin') {
    redirect('/cuenta?message=Solo%20tatuadores%20pueden%20editar%20perfil');
  }

  const supabase = await createSupabaseServerClient();
  const { data: artistRows, error: artistErr } = await supabase
    .from('tattoo_artists')
    .select(
      'id, display_name, slug, headline, bio, long_bio, specialties, is_active, avatar_path, instagram, twitter, youtube, website, city, years_active, schedule_kind, schedule_weeks, profile_id',
    )
    .eq('profile_id', user.id)
    .limit(5);

  const artistRow = artistRows?.[0] ?? null;

  if (!artistRow) {
    return (
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="font-display text-3xl">Perfil</h1>
          <p className="text-muted-foreground text-sm">
            Tu rol es <code>artist</code> pero no estás vinculado a una fila de tatuador. Pedile a
            un admin que te asocie a un <code>slug</code>.
          </p>
        </header>
        <details className="text-muted-foreground rounded-md border p-4 font-mono text-xs">
          <summary className="cursor-pointer">Debug info (dev only)</summary>
          <pre className="mt-2 whitespace-pre-wrap break-all">
            {JSON.stringify(
              {
                authUserId: user.id,
                profileId: profile.id,
                profileRole: profile.role,
                queryError: artistErr?.message ?? null,
                rowsFound: artistRows?.length ?? 0,
              },
              null,
              2,
            )}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-display text-3xl">Perfil del tatuador</h1>
        <p className="text-muted-foreground text-sm">
          Slug público: <code>{artistRow.slug as string}</code>
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <AvatarUpload initialUrl={(artistRow.avatar_path as string | null) ?? null} />

        <ProfileForm
          initial={{
            display_name: (artistRow.display_name as string | null) ?? '',
            headline: (artistRow.headline as string | null) ?? '',
            bio: (artistRow.bio as string | null) ?? '',
            long_bio: (artistRow.long_bio as string | null) ?? '',
            specialties: ((artistRow.specialties as string[] | null) ?? []).join(', '),
            city: (artistRow.city as string | null) ?? '',
            years_active:
              artistRow.years_active !== null && artistRow.years_active !== undefined
                ? String(artistRow.years_active)
                : '',
            schedule_kind: (artistRow.schedule_kind as string | null) ?? '',
            schedule_weeks:
              artistRow.schedule_weeks !== null && artistRow.schedule_weeks !== undefined
                ? String(artistRow.schedule_weeks)
                : '',
            instagram: (artistRow.instagram as string | null) ?? '',
            twitter: (artistRow.twitter as string | null) ?? '',
            youtube: (artistRow.youtube as string | null) ?? '',
            website: (artistRow.website as string | null) ?? '',
          }}
        />
      </section>
    </div>
  );
}
