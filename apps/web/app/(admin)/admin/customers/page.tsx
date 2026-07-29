import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: rows } = await supabase
    .from('customers')
    .select('id, full_name, email, phone_e164, notes, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  const list = rows ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl">Clientes</h1>
        <p className="text-muted-foreground text-sm">
          {list.length} {list.length === 1 ? 'cliente' : 'clientes'} (top 100 más recientes)
        </p>
      </header>

      {list.length === 0 ? (
        <EmptyState title="Sin clientes" description="Los clientes se crean al agendar." />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead>Alta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((c) => (
                <TableRow key={c.id as string}>
                  <TableCell className="font-medium">{c.full_name as string}</TableCell>
                  <TableCell>
                    {c.email ? (
                      <a
                        href={`mailto:${c.email as string}`}
                        className="hover:text-gold text-sm hover:underline"
                      >
                        {c.email as string}
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`tel:${c.phone_e164 as string}`}
                      className="text-sm tabular-nums hover:underline"
                    >
                      {c.phone_e164 as string}
                    </a>
                  </TableCell>
                  <TableCell className="text-muted-foreground line-clamp-2 max-w-md text-sm">
                    {(c.notes as string | null) ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm tabular-nums">
                    {format(new Date(c.created_at as string), 'd MMM yyyy', { locale: es })}
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
