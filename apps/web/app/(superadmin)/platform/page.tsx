import { Card } from '@/components/ui/card';

export default function PlatformHomePage() {
  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl font-semibold">Plataforma</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-muted-foreground">Estudios activos</p>
          <p className="text-2xl font-semibold">—</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Administradores</p>
          <p className="text-2xl font-semibold">—</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Citas agendadas</p>
          <p className="text-2xl font-semibold">—</p>
        </Card>
      </div>
    </div>
  );
}