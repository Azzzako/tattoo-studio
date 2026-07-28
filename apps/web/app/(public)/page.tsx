import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="container flex flex-col gap-16 py-16">
      <section className="flex flex-col items-start gap-6">
        <span className="rounded-full border px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground">
          Beta controlada
        </span>
        <h1 className="max-w-3xl font-display text-5xl font-semibold leading-tight md:text-6xl">
          Tatuajes que cuentan tu historia, agenda en línea.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Reserva con tu tatuador favorito, conoce su portafolio y mantén tu agenda sincronizada con Google
          Calendar.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/tatuadores">Ver tatuadores</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/eventos">Próximos eventos</Link>
          </Button>
        </div>
      </section>

      <section aria-labelledby="tatuadores">
        <h2 id="tatuadores" className="mb-6 font-display text-3xl font-semibold">
          Nuestros tatuadores
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Inka', styles: 'blackwork · dotwork' },
            { name: 'Mara', styles: 'color · fine-line' },
            { name: 'Yael', styles: 'realismo · microrealismo' },
          ].map((artist) => (
            <Card key={artist.name}>
              <h3 className="font-display text-2xl">{artist.name}</h3>
              <p className="text-sm text-muted-foreground">{artist.styles}</p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="como-funciona">
        <h2 id="como-funciona" className="mb-6 font-display text-3xl font-semibold">
          Cómo reservar
        </h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            'Elige tatuador y servicio',
            'Selecciona un horario disponible',
            'Recibe confirmación por WhatsApp',
          ].map((step, i) => (
            <li key={step} className="rounded-lg border p-4">
              <span className="text-sm font-semibold text-accent">Paso {i + 1}</span>
              <p className="mt-2">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}