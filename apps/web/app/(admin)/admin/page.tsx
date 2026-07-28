import { Card } from '@/components/ui/card';

export default function AdminHomePage() {
  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl font-semibold">Resumen</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-muted-foreground">Solicitudes pendientes</p>
          <p className="text-2xl font-semibold">—</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Próximas citas</p>
          <p className="text-2xl font-semibold">—</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Eventos activos</p>
          <p className="text-2xl font-semibold">—</p>
        </Card>
      </div>
    </div>
  );
}