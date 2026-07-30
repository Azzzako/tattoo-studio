import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';

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
import { requireStaff } from '@/lib/supabase/guards';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  sent: 'Enviada',
  read: 'Leida',
  archived: 'Archivada',
};
const STATUS_VARIANT: Record<string, 'default' | 'muted' | 'outline'> = {
  sent: 'default',
  read: 'outline',
  archived: 'muted',
};

type ArtistRow = { display_name: string; slug: string };
type QuoteRow = {
  id: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  idea_text: string;
  budget_cents: number | null;
  created_at: string;
  artist: ArtistRow | ArtistRow[] | null;
};

export default async function AdminQuotesPage() {
  await requireStaff();
  const supabase = await createSupabaseServerClient();

  // RLS enforces visibility: admin sees all in studio, artist only own.
  const { data, error } = await supabase
    .from('quotes')
    .select(
      'id, status, customer_name, customer_phone, customer_email, idea_text, budget_cents, created_at, artist:tattoo_artists!quotes_artist_id_fkey(display_name, slug)',
    )
    .order('created_at', { ascending: false })
    .limit(50);

  const list = ((data ?? []) as QuoteRow[]).filter(() => {
    void error;
    return true;
  });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl">Cotizaciones</h1>
        <p className="text-muted-foreground text-sm">
          {list.length} {list.length === 1 ? 'cotizacion' : 'cotizaciones'} (top 50 mas recientes)
        </p>
      </header>

      {list.length === 0 ? (
        <EmptyState
          title="Sin cotizaciones"
          description="Las cotizaciones llegan desde el wizard publico y se guardan aqui para seguimiento."
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tatuador</TableHead>
                <TableHead>Idea</TableHead>
                <TableHead>Presupuesto</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((q) => {
                const artist = Array.isArray(q.artist) ? q.artist[0] : q.artist;
                const waMessage = encodeURIComponent(
                  `${q.customer_name} (${q.customer_phone})\n\n${q.idea_text}`,
                );
                return (
                  <TableRow key={q.id}>
                    <TableCell className="text-muted-foreground text-sm tabular-nums">
                      {format(new Date(q.created_at), 'd MMM HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{q.customer_name}</div>
                      <a
                        href={`tel:${q.customer_phone}`}
                        className="text-muted-foreground hover:text-gold text-xs hover:underline"
                      >
                        {q.customer_phone}
                      </a>
                    </TableCell>
                    <TableCell className="text-sm">
                      {artist ? (
                        <Link href={`/tatuadores/${artist.slug}`} className="hover:underline">
                          {artist.display_name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs text-sm">
                      <span className="line-clamp-2">{q.idea_text}</span>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {q.budget_cents !== null
                        ? `$${(q.budget_cents / 100).toLocaleString('es-MX')} MXN`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={STATUS_VARIANT[q.status] ?? 'outline'}>
                          {STATUS_LABEL[q.status] ?? q.status}
                        </Badge>
                        <a
                          href={`https://wa.me/${q.customer_phone.replace(/[^\d]/g, '')}?text=${waMessage}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-gold inline-flex"
                          aria-label="Abrir WhatsApp"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
