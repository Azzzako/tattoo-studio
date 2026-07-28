import { Card } from '@/components/ui/card';

export default function EventsPage() {
  return (
    <div className="container py-12">
      <h1 className="mb-8 font-display text-4xl font-semibold">Eventos y convenciones</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl">Convención Tinta 2026</h2>
          <p className="text-sm text-muted-foreground">CDMX · 30 días desde hoy</p>
        </Card>
      </div>
    </div>
  );
}