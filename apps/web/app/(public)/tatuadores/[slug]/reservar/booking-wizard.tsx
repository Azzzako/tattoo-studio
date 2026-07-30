'use client';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useActionState, useCallback, useReducer } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SuccessBanner } from '@/components/feedback/success-banner';
import { SlotPicker, type ClientSlot } from '@/components/reservar/slot-picker';
import { QuoteAttachmentsInput } from '@/components/cotizar/quote-attachments-input';
import {
  submitBooking,
  submitQuote,
  type BookingActionResult,
  type QuoteActionResult,
} from './actions';

type Flow = 'quote' | 'booking';

type State = {
  flow: Flow | null;
  step: 1 | 2 | 3;
  idea: string;
  budgetMxn: string;
  attachmentCount: number;
  serviceId: string | null;
  startsAtIso: string | null;
  dateIso: string | null;
  name: string;
  email: string;
  phone: string;
};

type Action =
  | { type: 'pick_flow'; flow: Flow }
  | { type: 'update_idea'; value: string }
  | { type: 'update_budget'; value: string }
  | { type: 'update_attachments'; count: number }
  | { type: 'update_service'; id: string }
  | { type: 'update_slot'; startsAtIso: string; dateIso: string }
  | { type: 'update_name'; value: string }
  | { type: 'update_email'; value: string }
  | { type: 'update_phone'; value: string }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'reset' };

const INITIAL: State = {
  flow: null,
  step: 1,
  idea: '',
  budgetMxn: '',
  attachmentCount: 0,
  serviceId: null,
  startsAtIso: null,
  dateIso: null,
  name: '',
  email: '',
  phone: '',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'pick_flow':
      return { ...state, flow: action.flow, step: 2 };
    case 'update_idea':
      return { ...state, idea: action.value };
    case 'update_budget':
      return { ...state, budgetMxn: action.value };
    case 'update_attachments':
      return { ...state, attachmentCount: action.count };
    case 'update_service':
      return { ...state, serviceId: action.id };
    case 'update_slot':
      return { ...state, dateIso: action.dateIso, startsAtIso: action.startsAtIso };
    case 'update_name':
      return { ...state, name: action.value };
    case 'update_email':
      return { ...state, email: action.value };
    case 'update_phone':
      return { ...state, phone: action.value };
    case 'next':
      return { ...state, step: Math.min(3, state.step + 1) as State['step'] };
    case 'prev':
      return { ...state, step: Math.max(1, state.step - 1) as State['step'] };
    case 'reset':
      return INITIAL;
    default:
      return state;
  }
}

interface BookingWizardPageProps {
  slug: string;
  artistDisplayName: string;
  services: Array<{ id: string; name: string; durationMinutes: number; priceLabel: string }>;
  initialSlots: ClientSlot[];
}

export default function BookingWizardPage({
  slug,
  artistDisplayName,
  services,
  initialSlots,
}: BookingWizardPageProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const [quoteState, quoteFormAction, quotePending] = useActionState<
    QuoteActionResult | undefined,
    FormData
  >(submitQuote, undefined);

  const [bookingState, bookingFormAction, bookingPending] = useActionState<
    BookingActionResult | undefined,
    FormData
  >(submitBooking, undefined);

  const lastResult: QuoteActionResult | BookingActionResult | undefined =
    state.flow === 'quote' ? quoteState : bookingState;
  const pending = state.flow === 'quote' ? quotePending : bookingPending;

  const onPickFlow = useCallback((flow: Flow) => dispatch({ type: 'pick_flow', flow }), []);

  const canAdvance = (() => {
    if (state.step === 1) return state.flow !== null;
    if (state.step === 2) {
      if (state.flow === 'quote') {
        return state.idea.trim().length >= 10 && state.attachmentCount > 0;
      }
      return state.serviceId !== null && state.startsAtIso !== null;
    }
    if (state.step === 3) {
      const emailOk = !state.email || /^\S+@\S+\.\S+$/.test(state.email);
      return state.name.trim().length >= 2 && state.phone.trim().length >= 8 && emailOk;
    }
    return false;
  })();

  if (lastResult?.ok) {
    return (
      <SubmittedState
        slug={slug}
        artistDisplayName={artistDisplayName}
        flow={state.flow ?? 'quote'}
        state={state}
        whatsappUrl={lastResult.whatsappUrl}
      />
    );
  }

  return (
    <div className="container py-12 md:py-20">
      <header className="border-border mb-10 grid gap-4 border-b pb-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-gold text-xs uppercase tracking-[0.2em]">Reservar / Cotizar</p>
          <h1 className="font-display text-5xl capitalize md:text-6xl">Con {artistDisplayName}</h1>
        </div>
        <ImagePlaceholder
          seed={`artist-quick-${slug}`}
          ratio="1/1"
          alt={`Foto de ${artistDisplayName}`}
          className="hidden h-24 w-24 md:block"
        />
      </header>

      <Stepper current={state.step} flow={state.flow} />

      <form
        action={state.flow === 'quote' ? quoteFormAction : bookingFormAction}
        className="space-y-6"
        noValidate
      >
        <input type="hidden" name="artist_slug" value={slug} />
        {state.flow === 'booking' && state.serviceId && (
          <input type="hidden" name="service_id" value={state.serviceId} />
        )}
        {state.flow === 'booking' && state.startsAtIso && (
          <input type="hidden" name="starts_at" value={state.startsAtIso} />
        )}

        {state.step === 1 && <Step1Pick onPick={onPickFlow} selected={state.flow} />}

        {state.step === 2 && state.flow === 'quote' && (
          <Step2Quote
            idea={state.idea}
            budgetMxn={state.budgetMxn}
            onIdea={(v) => dispatch({ type: 'update_idea', value: v })}
            onBudget={(v) => dispatch({ type: 'update_budget', value: v })}
            onAttachments={(n) => dispatch({ type: 'update_attachments', count: n })}
          />
        )}

        {state.step === 2 && state.flow === 'booking' && (
          <Step2Booking
            services={services}
            slots={initialSlots}
            selectedServiceId={state.serviceId}
            selectedStartsAt={state.startsAtIso}
            onService={(id) => dispatch({ type: 'update_service', id })}
            onSlot={(startsAtIso, dateIso) =>
              dispatch({ type: 'update_slot', startsAtIso, dateIso })
            }
          />
        )}

        {state.step === 3 && (
          <Step3Contact
            name={state.name}
            email={state.email}
            phone={state.phone}
            onName={(v) => dispatch({ type: 'update_name', value: v })}
            onEmail={(v) => dispatch({ type: 'update_email', value: v })}
            onPhone={(v) => dispatch({ type: 'update_phone', value: v })}
          />
        )}

        {lastResult?.ok === false && (
          <p role="alert" className="text-destructive text-sm">
            {lastResult.message}
          </p>
        )}

        <NavButtons
          step={state.step}
          flow={state.flow}
          canAdvance={canAdvance}
          pending={pending}
          onPrev={() => dispatch({ type: 'prev' })}
        />
      </form>
    </div>
  );
}

function Stepper({ current, flow }: { current: 1 | 2 | 3; flow: Flow | null }) {
  const items =
    flow === null
      ? [{ id: 1, label: '¿Que quieres hacer?' }]
      : flow === 'quote'
        ? [
            { id: 1, label: 'Tipo' },
            { id: 2, label: 'Tu idea' },
            { id: 3, label: 'Tus datos' },
          ]
        : [
            { id: 1, label: 'Tipo' },
            { id: 2, label: 'Servicio y hora' },
            { id: 3, label: 'Tus datos' },
          ];

  return (
    <ol className="mb-10 flex items-center gap-4 text-xs uppercase tracking-[0.2em]">
      {items.map(({ id, label }, i) => {
        const active = current === id;
        const done = current > id;
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
            {i < items.length - 1 && (
              <span className="bg-border mx-2 h-px w-8" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Step1Pick({ selected, onPick }: { selected: Flow | null; onPick: (flow: Flow) => void }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {(['quote', 'booking'] as const).map((flow) => {
        const isQuote = flow === 'quote';
        const isSelected = selected === flow;
        return (
          <button
            key={flow}
            type="button"
            onClick={() => onPick(flow)}
            aria-pressed={isSelected}
            className={`border-border group flex flex-col items-start gap-3 border p-6 text-left transition-colors ${
              isSelected ? 'border-gold bg-gold/5' : 'hover:border-gold/50'
            }`}
          >
            <span className="text-gold">
              {isQuote ? <FileText className="h-6 w-6" /> : <Mail className="h-6 w-6" />}
            </span>
            <h2 className="font-display text-2xl">{isQuote ? 'Cotizar' : 'Reservar'}</h2>
            <p className="text-muted-foreground text-sm">
              {isQuote
                ? 'Envia tu idea y referencias visuales. El estudio te responde por WhatsApp en menos de 24 horas.'
                : 'Agenda un slot con el artista. La cita queda confirmada en el calendario del estudio.'}
            </p>
            {isSelected && <Badge>Tu eleccion</Badge>}
          </button>
        );
      })}
    </div>
  );
}

function Step2Quote({
  idea,
  budgetMxn,
  onIdea,
  onBudget,
  onAttachments,
}: {
  idea: string;
  budgetMxn: string;
  onIdea: (v: string) => void;
  onBudget: (v: string) => void;
  onAttachments: (n: number) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="idea_text">Tu idea</Label>
        <Textarea
          id="idea_text"
          name="idea_text"
          required
          minLength={10}
          maxLength={2000}
          rows={6}
          value={idea}
          onChange={(e) => onIdea(e.target.value)}
          placeholder="Estilo, tamano, zona del cuerpo, referencias..."
        />
        <p className="text-muted-foreground text-xs">
          Min. 10 caracteres. Lo que el estudio necesita para darte una cotizacion.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="budget_mxn">Presupuesto aproximado (MXN, opcional)</Label>
        <Input
          id="budget_mxn"
          name="budget_mxn"
          inputMode="numeric"
          type="number"
          min={0}
          max={1_000_000}
          value={budgetMxn}
          onChange={(e) => onBudget(e.target.value)}
          placeholder="5000"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Imagenes de referencia (hasta 5)</Label>
        <QuoteAttachmentsInput name="attachments" onCountChange={onAttachments} />
      </div>
    </div>
  );
}

function Step2Booking({
  services,
  slots,
  selectedServiceId,
  selectedStartsAt,
  onService,
  onSlot,
}: {
  services: Array<{ id: string; name: string; durationMinutes: number; priceLabel: string }>;
  slots: ClientSlot[];
  selectedServiceId: string | null;
  selectedStartsAt: string | null;
  onService: (id: string) => void;
  onSlot: (startsAtIso: string, dateIso: string) => void;
}) {
  const selectedService = services.find((s) => s.id === selectedServiceId) ?? null;

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Servicio</Label>
        <div className="grid gap-3 md:grid-cols-3">
          {services.map((s) => {
            const isSelected = selectedServiceId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onService(s.id)}
                aria-pressed={isSelected}
                className={`border-border flex flex-col items-start gap-2 border p-4 text-left transition-colors ${
                  isSelected ? 'border-gold bg-gold/5' : 'hover:border-gold/50'
                }`}
              >
                <h3 className="font-display text-xl">{s.name}</h3>
                <p className="text-muted-foreground text-xs">
                  {s.durationMinutes} min · {s.priceLabel}
                </p>
                {isSelected && <Badge>Tu eleccion</Badge>}
              </button>
            );
          })}
        </div>
      </div>

      {selectedService && (
        <SlotPicker slots={slots} selectedStartsAt={selectedStartsAt} onPick={onSlot} />
      )}
    </div>
  );
}

function Step3Contact({
  name,
  email,
  phone,
  onName,
  onEmail,
  onPhone,
}: {
  name: string;
  email: string;
  phone: string;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onPhone: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="customer_name">Tu nombre completo</Label>
        <Input
          id="customer_name"
          name="customer_name"
          required
          minLength={2}
          maxLength={120}
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Ana Garcia"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="customer_phone">Telefono (WhatsApp)</Label>
        <Input
          id="customer_phone"
          name="customer_phone"
          required
          inputMode="tel"
          pattern="^\+?[0-9\s()-]{8,20}$"
          value={phone}
          onChange={(e) => onPhone(e.target.value)}
          placeholder="+52 55 1234 5678"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="customer_email">Email (opcional)</Label>
        <Input
          id="customer_email"
          name="customer_email"
          type="email"
          value={email}
          onChange={(e) => onEmail(e.target.value)}
          placeholder="tu@correo.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={500}
          placeholder="Alergias, dudas, referencias rapidas..."
        />
      </div>
    </div>
  );
}

function NavButtons({
  step,
  flow,
  canAdvance,
  pending,
  onPrev,
}: {
  step: 1 | 2 | 3;
  flow: Flow | null;
  canAdvance: boolean;
  pending: boolean;
  onPrev: () => void;
}) {
  return (
    <div className="border-border flex items-center justify-between border-t pt-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onPrev}
        disabled={step === 1 || pending}
      >
        <ArrowLeft className="h-4 w-4" /> Atras
      </Button>
      <Button type="submit" size="sm" disabled={!canAdvance || pending || step < 2}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
          </>
        ) : step === 3 ? (
          flow === 'quote' ? (
            <>
              Enviar cotizacion <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              Confirmar reserva <ArrowRight className="h-4 w-4" />
            </>
          )
        ) : (
          <>
            Continuar <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

function SubmittedState({
  slug,
  artistDisplayName,
  flow,
  state,
  whatsappUrl,
}: {
  slug: string;
  artistDisplayName: string;
  flow: Flow;
  state: State;
  whatsappUrl: string;
}) {
  return (
    <div className="container max-w-3xl py-16 md:py-24">
      <SuccessBanner
        title={flow === 'quote' ? 'Tu cotizacion esta lista.' : 'Tu reserva esta confirmada.'}
        description={
          flow === 'quote'
            ? `Hemos pre-armado un mensaje en WhatsApp para el estudio.`
            : `Cita registrada. El estudio confirma por WhatsApp en menos de 24 horas.`
        }
        action={
          <Button asChild>
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              Abrir WhatsApp <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        }
        className="mb-8"
      />
      <div className="border-border bg-ink-900 grid gap-6 border p-8 md:grid-cols-2">
        <div>
          <p className="text-gold text-xs uppercase tracking-[0.2em]">Resumen</p>
          <dl className="mt-4 space-y-3 text-sm">
            {flow === 'quote' ? (
              <>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-400">Adjuntos</dt>
                  <dd className="text-foreground text-right">{state.attachmentCount}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-400">Idea</dt>
                  <dd className="text-foreground line-clamp-3 text-right">{state.idea}</dd>
                </div>
                {state.budgetMxn && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-400">Presupuesto</dt>
                    <dd className="text-foreground text-right">${state.budgetMxn} MXN</dd>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-400">Servicio</dt>
                  <dd className="text-foreground text-right">
                    {state.startsAtIso
                      ? new Date(state.startsAtIso).toLocaleString('es-MX', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>
        <div>
          <p className="text-gold text-xs uppercase tracking-[0.2em]">Tatuador</p>
          <h2 className="font-display mt-4 text-3xl capitalize">{artistDisplayName}</h2>
          <p className="text-ink-300 mt-2 flex items-center gap-2 text-sm">
            <MessageCircle className="h-4 w-4" />
            El estudio te contacta por WhatsApp.
          </p>
        </div>
      </div>
      <div className="mt-8 flex gap-3">
        <Button asChild variant="outline">
          <Link href={`/tatuadores/${slug}`}>Ver perfil de {artistDisplayName}</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/tatuadores">Ver mas tatuadores</Link>
        </Button>
      </div>
    </div>
  );
}
