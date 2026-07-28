import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Input, Textarea } from '@/components/ui/input';

interface BookingPageProps {
  params: { slug: string };
}

export default function BookingPage({ params }: BookingPageProps) {
  if (!['inka', 'mara'].includes(params.slug)) notFound();
  return (
    <div className="container grid gap-8 py-12 lg:grid-cols-2">
      <section>
        <h1 className="font-display text-3xl font-semibold">Reservar con {params.slug}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Selecciona un día disponible y completa el formulario. Te confirmaremos por WhatsApp.
        </p>
        <form className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">WhatsApp</Label>
            <Input id="phone" name="phone" type="tel" required autoComplete="tel" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="idea">Idea del tatuaje</Label>
            <Textarea id="idea" name="idea" required minLength={20} />
          </div>
          <Button type="submit">Enviar solicitud</Button>
        </form>
      </section>
      <aside>
        <Calendar mode="single" className="rounded-lg border" />
        <p className="mt-4 text-xs text-muted-foreground">
          Las horas disponibles se mostrarán tras seleccionar un día.
        </p>
      </aside>
    </div>
  );
}