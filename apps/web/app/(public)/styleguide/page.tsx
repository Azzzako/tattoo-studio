import { ArrowRight, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo, Logomark } from '@/components/brand/logo';

export default function StyleguidePage() {
  return (
    <div className="container max-w-5xl py-20">
      <header className="mb-12">
        <p className="text-gold text-xs uppercase tracking-[0.2em]">Sistema de diseño</p>
        <h1 className="font-display mt-3 text-6xl">Styleguide</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl text-sm">
          Vista de componentes y tokens visuales de Insigne Tattoo. Solo desarrollo.
        </p>
      </header>

      <Section title="Logo">
        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
            <CardDescription>Bickham Script Pro + versalitas Gotham.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-12">
            <Logo />
            <Logomark />
          </CardContent>
        </Card>
      </Section>

      <Section title="Tipografía">
        <Card>
          <CardHeader>
            <CardTitle>Display (Bickham Script Pro)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-display text-5xl">Reservar con Insigne.</p>
            <p className="font-display text-gold text-3xl">Geometría con intención.</p>
            <p className="font-display text-ink-300 text-xl">Una conversación larga.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sans (Gotham)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-gold text-sm uppercase tracking-[0.2em]">Mayúsculas espaciadas</p>
            <p className="text-base">Cuerpo base 16px / Gotham Book</p>
            <p className="text-muted-foreground text-sm">Texto secundario 14px / Gotham Light</p>
          </CardContent>
        </Card>
      </Section>

      <Section title="Paleta">
        <Card>
          <CardHeader>
            <CardTitle>Monocromática + dorado opaco</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-5 gap-2 md:grid-cols-11">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((step) => (
              <div key={step} className="space-y-1">
                <div
                  className="border-border aspect-square border"
                  style={{ backgroundColor: `hsl(0 0% ${100 - step * 0.7}%)` }}
                />
                <p className="text-ink-400 font-mono text-[0.65rem]">ink-{step}</p>
              </div>
            ))}
            <div className="space-y-1">
              <div className="bg-gold aspect-square" />
              <p className="text-gold font-mono text-[0.65rem]">gold</p>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section title="Botones">
        <Card>
          <CardContent className="flex flex-wrap gap-3">
            <Button>
              Reservar <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline">Ver tatuadores</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructivo</Button>
            <Button size="sm">Pequeño</Button>
            <Button size="lg">Grande</Button>
          </CardContent>
        </Card>
      </Section>

      <Section title="Badges">
        <Card>
          <CardContent className="flex flex-wrap gap-3">
            <Badge>
              <Sparkles className="h-3 w-3" />
              Default
            </Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="solid">Solid</Badge>
            <Badge variant="muted">Muted</Badge>
          </CardContent>
        </Card>
      </Section>

      <Section title="Avatares">
        <Card>
          <CardContent className="flex flex-wrap gap-4">
            <Avatar>
              <AvatarImage src="https://picsum.photos/seed/avatar-1/200/200" alt="Avatar" />
              <AvatarFallback>IN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="https://picsum.photos/seed/avatar-2/200/200" alt="Avatar" />
              <AvatarFallback>MA</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="https://picsum.photos/seed/avatar-3/200/200" alt="Avatar" />
              <AvatarFallback>YA</AvatarFallback>
            </Avatar>
          </CardContent>
        </Card>
      </Section>

      <Section title="Inputs">
        <Card>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="sg-name">Nombre</Label>
              <Input id="sg-name" placeholder="Tu nombre" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sg-email">Correo</Label>
              <Input id="sg-email" type="email" placeholder="tu@correo.com" />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="sg-text">Mensaje</Label>
              <Textarea id="sg-text" placeholder="Cuéntanos tu idea" />
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section title="Skeleton">
        <Card>
          <CardContent className="space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="aspect-[3/4] w-full" />
          </CardContent>
        </Card>
      </Section>

      <Section title="Calendar">
        <Card>
          <CardContent>
            <CalendarPicker mode="single" className="border-border rounded-md border" />
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12 space-y-6">
      <h2 className="font-display text-3xl">
        <span className="text-gold">·</span> {title}
      </h2>
      {children}
    </section>
  );
}
