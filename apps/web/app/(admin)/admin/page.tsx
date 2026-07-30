import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock, UserSquare2, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
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

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
  no_show: 'No-show',
};

export const dynamic = 'force-dynamic';

export default async function AdminLanding() {
  const profile = await requireStaff();
  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const horizon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const [
    artistsCount,
    servicesCount,
    customersCount,
    upcomingCount,
    upcomingRows,
    pendingQuotesCount,
  ] = await Promise.all([
    supabase
      .from('tattoo_artists')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase.from('services').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('customers').select('id', { count: 'exact', head: true }),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .gte('starts_at', now.toISOString())
      .lt('starts_at', horizon.toISOString())
      .neq('status', 'cancelled'),
    supabase
      .from('appointments')
      .select('id, starts_at, ends_at, status, notes, artist_id, service_id, customer_id')
      .gte('starts_at', now.toISOString())
      .order('starts_at', { ascending: true })
      .limit(8),
    supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('status', 'sent'),
  ]);

  const ids = collectIds(upcomingRows.data ?? []);
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

  const stats = [
    {
      label: 'Tatuadores activos',
      value: artistsCount.count ?? 0,
      href: profile.role === 'admin' ? '/admin/artists' : null,
      icon: UserSquare2,
    },
    {
      label: 'Servicios activos',
      value: servicesCount.count ?? 0,
      href: null,
      icon: UserSquare2,
    },
    {
      label: 'Clientes',
      value: customersCount.count ?? 0,
      href: profile.role === 'admin' ? '/admin/customers' : null,
      icon: Users,
    },
    {
      label: 'Proximas 14d',
      value: upcomingCount.count ?? 0,
      href: '/admin/calendar',
      icon: CalendarDays,
    },
    {
      label: 'Cotizaciones pendientes',
      value: pendingQuotesCount.count ?? 0,
      href: '/admin/quotes',
      icon: CalendarDays,
    },
  ];

  const upcoming = upcomingRows.data ?? [];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-display text-3xl">
          Bienvenido{profile.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground text-sm">
          Sesión iniciada como <Badge variant="outline">{profile.role}</Badge>
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          const inner = (
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription className="text-xs uppercase tracking-wider">
                  {s.label}
                </CardDescription>
                <Icon className="text-gold h-4 w-4" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <p className="font-display text-3xl tabular-nums">{s.value}</p>
              </CardContent>
            </Card>
          );
          if (s.href) {
            return (
              <Link key={s.label} href={s.href} className="transition-opacity hover:opacity-80">
                {inner}
              </Link>
            );
          }
          return <div key={s.label}>{inner}</div>;
        })}
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="font-display text-xl">Próximas citas</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/calendar" className="flex items-center gap-2">
              Ver calendario <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </header>
        {upcoming.length === 0 ? (
          <EmptyState
            title="Sin citas próximas"
            description="No hay reservas en los próximos 14 días."
            icon={<Clock className="h-8 w-8" aria-hidden="true" />}
          />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Tatuador</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcoming.map((appt) => {
                  const artist = artistById.get(appt.artist_id as string);
                  const service = serviceById.get(appt.service_id as string);
                  const customer = customerById.get(appt.customer_id as string);
                  const statusLabel = STATUS_LABELS[appt.status as string] ?? appt.status;
                  return (
                    <TableRow key={appt.id as string}>
                      <TableCell className="font-medium tabular-nums">
                        {format(new Date(appt.starts_at as string), 'd MMM HH:mm', { locale: es })}
                      </TableCell>
                      <TableCell>{artist?.display_name ?? '—'}</TableCell>
                      <TableCell>{service?.name ?? '—'}</TableCell>
                      <TableCell>{customer?.full_name ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{statusLabel}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </section>
    </div>
  );
}

type RowShape = {
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
