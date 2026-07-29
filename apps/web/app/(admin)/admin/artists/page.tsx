import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
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

export const dynamic = 'force-dynamic';

export default async function AdminArtistsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: rows } = await supabase
    .from('tattoo_artists')
    .select(
      'id, slug, display_name, bio, specialties, is_active, featured, city, years_active, schedule_kind, schedule_weeks',
    )
    .order('featured', { ascending: false })
    .order('display_name', { ascending: true });

  const list = rows ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl">Tatuadores</h1>
        <p className="text-muted-foreground text-sm">
          {list.length} {list.length === 1 ? 'tatuador' : 'tatuadores'} ·{' '}
          {list.filter((a) => a.is_active).length} activos · {list.filter((a) => a.featured).length}{' '}
          destacados
        </p>
      </header>

      {list.length === 0 ? (
        <EmptyState title="Sin tatuadores" description="Agregá el primer tatuador desde la DB." />
      ) : (
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((a) => (
                <TableRow key={a.id as string}>
                  <TableCell>
                    <Link
                      href={`/tatuadores/${a.slug as string}`}
                      className="font-medium hover:underline"
                    >
                      {a.display_name as string}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs">{a.slug as string}</code>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {(a.city as string | null) ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm tabular-nums">
                    {a.years_active !== null && a.years_active !== undefined
                      ? String(a.years_active)
                      : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {a.schedule_kind
                      ? `${a.schedule_kind}${a.schedule_weeks ? ` (${a.schedule_weeks}w)` : ''}`
                      : '—'}
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
                      <input type="hidden" name="artist_id" value={a.id as string} />
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
