import Link from 'next/link';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ESTUDIO = {
  address: 'Av. Insurgentes Sur 1234, Del Valle, CDMX',
  phone: '+52 55 1234 5678',
  email: 'hola@insigne.tattoo',
  schedule: 'Mar–Sáb · 11:00 – 20:00',
  instagram: 'https://instagram.com/insigne.tattoo',
};

export function SiteFooter() {
  return (
    <footer className="border-border bg-background border-t">
      <div className="container grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="text-muted-foreground mt-6 max-w-sm text-sm leading-relaxed">
            Estudio de tatuajes en Ciudad de México. Piezas únicas, hechas a mano y contigo en cada
            decisión.
          </p>
          <ul className="text-ink-300 mt-8 flex flex-col gap-3 text-sm">
            <li className="flex items-center gap-3">
              <MapPin className="text-gold h-4 w-4" />
              {ESTUDIO.address}
            </li>
            <li className="flex items-center gap-3">
              <Phone className="text-gold h-4 w-4" />
              {ESTUDIO.phone}
            </li>
            <li className="flex items-center gap-3">
              <Mail className="text-gold h-4 w-4" />
              <a href={`mailto:${ESTUDIO.email}`} className="hover:text-gold">
                {ESTUDIO.email}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-gold mb-4 text-xs font-semibold uppercase tracking-[0.2em]">
            Estudio
          </h3>
          <ul className="text-ink-300 space-y-3 text-sm">
            <li>
              <Link href="/tatuadores" className="hover:text-gold">
                Tatuadores
              </Link>
            </li>
            <li>
              <Link href="/eventos" className="hover:text-gold">
                Eventos
              </Link>
            </li>
            <li>
              <Link href="/proceso" className="hover:text-gold">
                Proceso
              </Link>
            </li>
            <li>
              <Link href="/cuidados" className="hover:text-gold">
                Cuidados
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-gold mb-4 text-xs font-semibold uppercase tracking-[0.2em]">
            Boletín
          </h3>
          <p className="text-muted-foreground text-sm">
            Avísame cuando abras agenda y nuevos diseños de cada tatuador.
          </p>
          <form className="mt-4 flex gap-2" action="/api/newsletter/subscribe" method="post">
            <Input
              type="email"
              name="email"
              required
              placeholder="tu@correo.com"
              aria-label="Correo electrónico"
              className="bg-ink-900"
            />
            <Button type="submit" size="sm" variant="outline">
              Unirme
            </Button>
          </form>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-gold hover:text-gold mt-8 gap-2 px-0"
          >
            <a href={ESTUDIO.instagram} rel="noreferrer" target="_blank">
              <Instagram className="h-4 w-4" />
              @insigne.tattoo
            </a>
          </Button>
        </div>
      </div>
      <div className="border-border border-t">
        <div className="text-muted-foreground container flex flex-col items-start justify-between gap-2 py-6 text-xs sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Insigne Tattoo. Todos los derechos reservados.</p>
          <p>{ESTUDIO.schedule}</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-gold">
              Acceder
            </Link>
            <Link href="/privacidad" className="hover:text-gold">
              Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-gold">
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
