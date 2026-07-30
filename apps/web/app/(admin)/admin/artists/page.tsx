import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Pencil, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { requireAdmin } from '@/lib/supabase/guards';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { toggleFeaturedForArtist } from '@/app/cuenta/perfil/actions';
import { approveProfileChange, rejectProfileChange } from '@/app/(admin)/admin/artists/actions';

export const dynamic = 'force-dynamic';

type ArtistRow = {
  id: string;
  slug: string;
  display_name: string;
  bio: string | null;
  specialties: string[] | null;
  is_active: boolean;
  featured: boolean;
  city: string | null;
  years_active: number | null;
  schedule_kind: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  website: string | null;
};

type ChangeRow = {
  id: string;
  status: string;
  created_at: string;
  proposed_changes: Record<string, unknown>;
  artist: { display_name: string; slug: string } | { display_name: string; slug: string }[];
};

function summarizeChange(proposed: Record<string, unknown>): string {
  const fields = Object.keys(proposed);
  if (fields.length === 0) return 'Sin cambios';
  if (fields.length === 1) {
    const field = fields[0]!;
    if (field === 'avatar_path') {
      return 'Cambio de avatar';
    }
    return `Cambio de ${field}`;
  }
  return `${fields.length} campos: ${fields.slice(0, 3).join(', ')}${fields.length > 3 ? '...' : ''}`;
}

export default async function AdminArtistsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [{ data: artists }, { data: pendingChanges }] = await Promise.all([
    supabase
      .from('tattoo_artists')
      .select(
        'id, slug, display_name, bio, specialties, is_active, featured, city, years_active, schedule_kind, instagram, twitter, youtube, website',
      )
      .order('display_name', { ascending: true }),
    supabase
      .from('artist_profile_changes')
      .select(
        'id, status, created_at, proposed_changes, artist:tattoo_artists!artist_profile_changes_artist_id_fkey(display_name, slug)',
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const artistList = (artists ?? []) as ArtistRow[];
  const changesList = (pendingChanges ?? []) as ChangeRow[];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-display text-3xl">Tatuadores</h1>
        <p className="text-muted-foreground text-sm">
          {artistList.length} tatuadores · {artistList.filter((a) => a.is_active).length} activos ·{' '}
          {artistList.filter((a) => a.featured).length} destacados
        </p>
      </header>

      {/* Pending changes */}
      <section className="space-y-3">
        <h2 className="font-display text-xl">Cambios pendientes</h2>
        {changesList.length === 0 ? (
          <EmptyState
            title="Sin cambios pendientes"
            description="Las propuestas de los tatuadores aparecen aqui para aprobacion."
          />
        ) : (
          <Card>
            <ul className="divide-border divide-y">
              {changesList.map((change) => {
                const artist = Array.isArray(change.artist) ? change.artist[0] : change.artist;
                return (
                  <li key={change.id} className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge>{change.status}</Badge>
                          <span className="text-ink-100 font-medium">
                            {artist?.display_name ?? 'Tatuador'}
                          </span>
                          {artist?.slug && (
                            <Link
                              href={`/tatuadores/${artist.slug}`}
                              className="text-muted-foreground text-xs hover:underline"
                            >
                              /tatuadores/{artist.slug}
                            </Link>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {format(new Date(change.created_at), "d MMM yyyy 'a las' HH:mm", {
                            locale: es,
                          })}
                        </p>
                        <p className="text-ink-300 text-sm">
                          {summarizeChange(change.proposed_changes)}
                        </p>
                        <details className="text-muted-foreground mt-1 text-xs">
                          <summary className="cursor-pointer">Ver JSON</summary>
                          <pre className="bg-ink-900 mt-2 max-w-xl overflow-x-auto rounded-md p-2 font-mono text-xs">
                            {JSON.stringify(change.proposed_changes, null, 2)}
                          </pre>
                        </details>
                      </div>
                      <div className="flex items-center gap-2">
                        <form action={approveProfileChange}>
                          <input type="hidden" name="change_id" value={change.id} />
                          <Button type="submit" size="sm">
                            <CheckCircle2 className="h-4 w-4" /> Aprobar
                          </Button>
                        </form>
                        <form action={rejectProfileChange}>
                          <input type="hidden" name="change_id" value={change.id} />
                          <Button type="submit" variant="outline" size="sm">
                            <X className="h-4 w-4" /> Rechazar
                          </Button>
                        </form>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>

      {/* Artists table */}
      <section className="space-y-3">
        <h2 className="font-display text-xl">Plantilla</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Años</TableHead>
                <TableHead>Agenda</TableHead>
                <TableHead>Especialidades</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Destacado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artistList.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <Link href={`/tatuadores/${a.slug}`} className="font-medium hover:underline">
                      {a.display_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs">{a.slug}</code>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{a.city ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm tabular-nums">
                    {a.years_active !== null ? String(a.years_active) : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {a.schedule_kind ?? '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {((a.specialties as string[] | null) ?? []).map((s) => (
                        <Badge key={s} variant="muted">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {a.is_active ? <Badge>Activo</Badge> : <Badge variant="muted">Inactivo</Badge>}
                  </TableCell>
                  <TableCell>
                    <form
                      action={toggleFeaturedForArtist}
                      className="inline-flex items-center gap-2"
                    >
                      <input type="hidden" name="artist_id" value={a.id} />
                      <label className="flex cursor-pointer items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          name="featured"
                          defaultChecked={Boolean(a.featured)}
                          className="peer sr-only"
                        />
                        <span className="border-border peer-checked:border-gold peer-checked:bg-gold/20 inline-block h-5 w-9 rounded-full border transition-colors" />
                        <span className="text-muted-foreground peer-checked:text-gold">
                          {a.featured ? 'Destacado' : '—'}
                        </span>
                      </label>
                      <button
                        type="submit"
                        className="text-ink-400 hover:text-gold text-xs underline"
                      >
                        guardar
                      </button>
                    </form>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/admin/artists/${a.id}/edit`}
                        className="flex items-center gap-2"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  );
}
