import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminAgendaPage() {
  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl font-semibold">Agenda</h1>
      <p className="text-muted-foreground text-sm">
        Vista de calendario interactiva: implementación con FullCalendar en sprint 5.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Inicio</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>—</TableCell>
            <TableCell>—</TableCell>
            <TableCell>—</TableCell>
            <TableCell>—</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
