'use client';

import { useReducer, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { SuccessBanner } from '@/components/feedback/success-banner';

interface BookingState {
  step: 1 | 2 | 3;
  serviceId: string | null;
  date: Date | null;
  slot: string | null;
  contact: { name: string; email: string; phone: string; idea: string };
  references: string;
}

type Action =
  | { type: 'select_service'; id: string }
  | { type: 'select_date'; date: Date }
  | { type: 'select_slot'; slot: string }
  | { type: 'update_contact'; field: keyof BookingState['contact']; value: string }
  | { type: 'update_references'; value: string }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'reset' };

const SERVICES = [
  { id: 'consulta', name: 'Consulta + diseño', duration: '45 min', price: 'Gratis' },
  { id: 'corta', name: 'Sesión corta', duration: '2 h', price: 'Desde $2,500 MXN' },
  { id: 'larga', name: 'Sesión larga', duration: '5 h', price: 'Desde $6,000 MXN' },
];

const SLOTS = ['11:00', '12:00', '13:00', '16:00', '17:00', '18:00'];

function reducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case 'select_service':
      return { ...state, serviceId: action.id };
    case 'select_date':
      return { ...state, date: action.date, slot: null };
    case 'select_slot':
      return { ...state, slot: action.slot };
    case 'update_contact':
      return { ...state, contact: { ...state.contact, [action.field]: action.value } };
    case 'update_references':
      return { ...state, references: action.value };
    case 'next':
      return { ...state, step: Math.min(3, state.step + 1) as BookingState['step'] };
    case 'prev':
      return { ...state, step: Math.max(1, state.step - 1) as BookingState['step'] };
    case 'reset':
      return { ...state, step: 1 };
    default:
      return state;
  }
}

const STUDIO_WHATSAPP = '5215512345678';

function buildWhatsAppUrl(slug: string, state: BookingState): string {
  const service = SERVICES.find((s) => s.id === state.serviceId);
  const message = [
    `Hola, soy ${state.contact.name}.`,
    `Quiero reservar con ${slug}.`,
    `Servicio: ${service?.name ?? ''}`,
    `Fecha: ${state.date?.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' }) ?? ''}`,
    `Hora: ${state.slot ?? ''}`,
    `Idea: ${state.contact.idea}`,
  ].join('\n');
  return `https://wa.me/${STUDIO_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export default function BookingWizardPage({ slug }: { slug: string }) {
  const [state, dispatch] = useReducer(reducer, {
    step: 1,
    serviceId: null,
    date: null,
    slot: null,
    contact: { name: '', email: '', phone: '', idea: '' },
    references: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const service = SERVICES.find((s) => s.id === state.serviceId);
  const canAdvance =
    (state.step === 1 && state.serviceId !== null) ||
    (state.step === 2 && state.date !== null && state.slot !== null) ||
    (state.step === 3 &&
      state.contact.name &&
      state.contact.email &&
      state.contact.phone &&
      state.contact.idea);

  if (submitted) {
    const waUrl = buildWhatsAppUrl(slug, state);
    return (
      <div className="container max-w-3xl py-16 md:py-24">
        <SuccessBanner
          title="Tu solicitud está lista."
          description={`Hemos pre-armado un mensaje en WhatsApp para confirmar con ${slug}.`}
          action={
            <Button asChild>
              <a href={waUrl} target="_blank" rel="noreferrer">
                Abrir WhatsApp
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          }
          className="mb-8"
        />
        <div className="border-border bg-ink-900 grid gap-6 border p-8 md:grid-cols-2">
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.2em]">Resumen</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-400">Servicio</dt>
                <dd className="text-foreground text-right">{service?.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-400">Fecha</dt>
                <dd className="text-foreground text-right">
                  {state.date?.toLocaleDateString('es-MX', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-400">Hora</dt>
                <dd className="text-foreground text-right">{state.slot}</dd>
              </div>
            </dl>
          </div>
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.2em]">Tatuador</p>
            <h2 className="font-display mt-4 text-3xl capitalize">{slug}</h2>
            <p className="text-ink-300 mt-2 text-sm">
              Te responderemos a {state.contact.email} en menos de 24 horas.
            </p>
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <Button asChild variant="outline">
            <Link href="/">Volver al inicio</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/tatuadores">Ver más tatuadores</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-20">
      <header className="border-border mb-10 grid gap-4 border-b pb-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-gold text-xs uppercase tracking-[0.2em]">Reservar</p>
          <h1 className="font-display text-5xl capitalize md:text-6xl">Con {slug}</h1>
        </div>
        <ImagePlaceholder
          seed={`artist-quick-${slug}`}
          ratio="1/1"
          alt={`Foto de ${slug}`}
          className="hidden h-24 w-24 md:block"
        />
      </header>

      <ol className="mb-10 flex items-center gap-4 text-xs uppercase tracking-[0.2em]">
        {[
          { id: 1, label: 'Servicio' },
          { id: 2, label: 'Fecha y hora' },
          { id: 3, label: 'Tus datos' },
        ].map(({ id, label }) => {
          const active = state.step === id;
          const done = state.step > id;
          return (
            <li
              key={id}
              className="flex items-center gap-2"
              aria-current={active ? 'step' : undefined}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                  done
                    ? 'border-gold bg-gold text-ink-950'
                    : active
                      ? 'border-gold text-gold'
                      : 'border-border text-ink-400'
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : id}
              </span>
              <span className={active ? 'text-gold' : done ? 'text-foreground' : 'text-ink-400'}>
                {label}
              </span>
              {id < 3 && <span className="bg-border mx-2 h-px w-8" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (state.step < 3) {
            dispatch({ type: 'next' });
          } else {
            setSubmitted(true);
          }
        }}
        className="grid gap-8 md:grid-cols-[1.5fr_1fr]"
      >
        <div key={`step-${state.step}`} className="animate-fade-up min-h-[28rem]">
          {state.step === 1 && (
            <fieldset className="space-y-4">
              <legend className="font-display mb-2 text-2xl">Elige el servicio</legend>
              {SERVICES.map((service) => (
                <label
                  key={service.id}
                  className={`flex cursor-pointer items-center justify-between gap-4 border p-6 transition-colors ${
                    state.serviceId === service.id
                      ? 'border-gold bg-gold/5'
                      : 'border-border bg-ink-900 hover:border-gold/50'
                  }`}
                >
                  <div>
                    <p className="font-display text-2xl">{service.name}</p>
                    <p className="text-ink-300 mt-1 text-sm">{service.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gold font-display text-2xl">{service.price}</p>
                  </div>
                  <input
                    type="radio"
                    name="service"
                    value={service.id}
                    checked={state.serviceId === service.id}
                    onChange={() => dispatch({ type: 'select_service', id: service.id })}
                    className="sr-only"
                  />
                </label>
              ))}
            </fieldset>
          )}

          {state.step === 2 && (
            <div className="grid gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <p className="font-display mb-3 text-2xl">Selecciona el día</p>
                <div className="border-border border p-2">
                  <CalendarPicker
                    mode="single"
                    selected={state.date ?? undefined}
                    onSelect={(d: Date | undefined) =>
                      d && dispatch({ type: 'select_date', date: d })
                    }
                    disabled={(date: Date) => date < new Date()}
                    className="rdp-dark"
                  />
                </div>
              </div>
              <div>
                <p className="font-display mb-3 text-2xl">Elige la hora</p>
                <div className="grid grid-cols-2 gap-2">
                  {SLOTS.map((slot) => (
                    <Button
                      key={slot}
                      type="button"
                      variant={state.slot === slot ? 'default' : 'outline'}
                      onClick={() => dispatch({ type: 'select_slot', slot })}
                      disabled={!state.date}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
                <p className="text-ink-400 mt-4 text-xs">
                  <MapPin className="mr-1 inline h-3 w-3" />
                  Av. Insurgentes Sur 1234, Del Valle, CDMX
                </p>
              </div>
            </div>
          )}

          {state.step === 3 && (
            <div className="space-y-4">
              <p className="font-display text-2xl">Cuéntanos tu idea</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="text-gold h-3.5 w-3.5" />
                    Nombre completo
                  </Label>
                  <Input
                    id="name"
                    required
                    autoComplete="name"
                    value={state.contact.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      dispatch({ type: 'update_contact', field: 'name', value: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="text-gold h-3.5 w-3.5" />
                    Correo
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={state.contact.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      dispatch({ type: 'update_contact', field: 'email', value: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="text-gold h-3.5 w-3.5" />
                    WhatsApp
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={state.contact.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      dispatch({ type: 'update_contact', field: 'phone', value: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="idea" className="flex items-center gap-2">
                    <Calendar className="text-gold h-3.5 w-3.5" />
                    Describe tu tatuaje
                  </Label>
                  <Textarea
                    id="idea"
                    required
                    minLength={20}
                    value={state.contact.idea}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      dispatch({ type: 'update_contact', field: 'idea', value: e.target.value })
                    }
                    placeholder="Estilo, tamaño, zona del cuerpo, referencias..."
                    rows={4}
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="references">Enlaces a referencias (opcional)</Label>
                  <Input
                    id="references"
                    placeholder="Pega enlaces separados por comas"
                    value={state.references}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      dispatch({ type: 'update_references', value: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="text-ink-400 flex items-start gap-2 text-xs">
                <Badge variant="muted">Importante</Badge>
                <p>
                  Esta es una solicitud. {slug} confirmará la fecha en menos de 24 horas. Al enviar
                  te redirigiremos a WhatsApp con el mensaje pre-armado.
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className="border-border bg-ink-900 border p-6">
          <p className="text-gold text-xs uppercase tracking-[0.2em]">Resumen</p>
          <h2 className="font-display mt-3 text-2xl">{slug}</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="border-border flex justify-between gap-4 border-b pb-3">
              <dt className="text-ink-400">Servicio</dt>
              <dd className="text-foreground text-right">{service?.name ?? '—'}</dd>
            </div>
            <div className="border-border flex justify-between gap-4 border-b pb-3">
              <dt className="text-ink-400">Duración</dt>
              <dd className="text-foreground text-right">{service?.duration ?? '—'}</dd>
            </div>
            <div className="border-border flex justify-between gap-4 border-b pb-3">
              <dt className="text-ink-400">Fecha</dt>
              <dd className="text-foreground text-right">
                {state.date?.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' }) ?? '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-400">Hora</dt>
              <dd className="text-foreground text-right">{state.slot ?? '—'}</dd>
            </div>
          </dl>
          <div className="mt-8 flex justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => dispatch({ type: 'prev' })}
              disabled={state.step === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Atrás
            </Button>
            <Button type="submit" disabled={!canAdvance} className="gap-2">
              {state.step < 3 ? 'Continuar' : 'Enviar solicitud'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}
