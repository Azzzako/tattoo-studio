import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { requireStaff } from '@/lib/supabase/guards';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
  no_show: 'No-show',
};

const STATUS_VARIANT: Record<string, 'default' | 'muted' | 'outline'> = {
  pending: 'outline',
  confirmed: 'default',
  cancelled: 'muted',
  completed: 'outline',
  no_show: 'muted',
};

const SOURCE_LABELS: Record<string, string> = {
  web: 'Web',
  whatsapp: 'WhatsApp',
  manual: 'Manual',
  google: 'Google',
};

export default async function AdminCalendarPage() {
  const profile = await requireStaff();
  const supabase = await createSupabaseServerClient();

  const now = new Date();
  const upper = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const { data: rows } = await supabase
    .from('appointments')
    .select('id, starts_at, ends_at, status, source, notes, artist_id, service_id, customer_id')
    .gte('starts_at', now.toISOString())
    .lt('starts_at', upper.toISOString())
    .order('starts_at', { ascending: true })
    .limit(100);

  const list = rows ?? [];

  const ids = collectIds(list);
  const [{ data: artistRows }, { data: serviceRows }, { data: customerRows }] = await Promise.all([
    ids.artistIds.length
      ? supabase.from('tattoo_artists').select('id, slug, display_name').in('id', ids.artistIds)
      : { data: [] },
    ids.serviceIds.length
      ? supabase.from('services').select('id, name').in('id', ids.serviceIds)
      : { data: [] },
    ids.customerIds.length
      ? supabase.from('customers').select('id, full_name').in('id', ids.customerIds)
      : { data: [] },
  ]);

  const artistById = new Map((artistRows ?? []).map((a) => [a.id as string, a]));
  const serviceById = new Map((serviceRows ?? []).map((s) => [s.id as string, s]));
  const customerById = new Map((customerRows ?? []).map((c) => [c.id as string, c]));

  const grouped = groupByDay(list);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl">Calendario</h1>
          <p className="text-muted-foreground text-sm">
            Próximos 30 días · RLS filtra por tu rol ({profile.role})
          </p>
        </div>
      </header>

      {list.length === 0 ? (
        <EmptyState title="Sin citas" description="No hay reservas en los próximos 30 días." />
      ) : (
        grouped.map(([dayKey, dayItems]) => (
          <Card key={dayKey}>
            <CardHeader>
              <CardTitle className="text-base font-medium capitalize">
                {format(new Date(dayKey), "EEEE d 'de' MMMM", { locale: es })}
              </CardTitle>
              <CardDescription>
                {dayItems.length} {dayItems.length === 1 ? 'cita' : 'citas'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hora</TableHead>
                    <TableHead>Tatuador</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dayItems.map((appt) => {
                    const artist = artistById.get(appt.artist_id as string);
                    const service = serviceById.get(appt.service_id as string);
                    const customer = customerById.get(appt.customer_id as string);
                    const statusLabel = STATUS_LABELS[appt.status as string] ?? appt.status;
                    const sourceLabel = SOURCE_LABELS[appt.source as string] ?? appt.source;
                    const variant = STATUS_VARIANT[appt.status as string] ?? 'outline';
                    const start = new Date(appt.starts_at as string);
                    const end = new Date(appt.ends_at as string);
                    return (
                      <TableRow key={appt.id as string}>
                        <TableCell className="font-medium tabular-nums">
                          {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                        </TableCell>
                        <TableCell>{artist?.display_name ?? '—'}</TableCell>
                        <TableCell>{service?.name ?? '—'}</TableCell>
                        <TableCell>{customer?.full_name ?? '—'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[0.6rem] uppercase">
                            {sourceLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={variant}>{statusLabel}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

type RowShape = {
  starts_at: string;
  artist_id: string;
  service_id: string;
  customer_id: string;
};

function collectIds(rows: RowShape[]): {
  artistIds: string[];
  serviceIds: string[];
  customerIds: string[];
} {
  const artistIds = new Set<string>();
  const serviceIds = new Set<string>();
  const customerIds = new Set<string>();
  for (const r of rows) {
    if (r.artist_id) artistIds.add(r.artist_id);
    if (r.service_id) serviceIds.add(r.service_id);
    if (r.customer_id) customerIds.add(r.customer_id);
  }
  return {
    artistIds: [...artistIds],
    serviceIds: [...serviceIds],
    customerIds: [...customerIds],
  };
}

function groupByDay<T extends { starts_at: string }>(rows: T[]): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const r of rows) {
    const day = new Date(r.starts_at).toISOString().slice(0, 10);
    const arr = map.get(day);
    if (arr) arr.push(r);
    else map.set(day, [r]);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}
