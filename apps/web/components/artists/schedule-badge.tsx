import { Calendar, Clock, ListChecks, MessageCircle } from 'lucide-react';

import { cn } from '@/lib/cn';

export type ScheduleKind = 'open_now' | 'closes_in_weeks' | 'waitlist_only' | 'by_request';

interface ScheduleBadgeProps {
  kind: ScheduleKind;
  weeks?: number | null;
  className?: string;
}

const CONFIG: Record<ScheduleKind, { label: string; Icon: typeof Calendar; tone: string }> = {
  open_now: {
    label: 'Agenda abierta',
    Icon: Calendar,
    tone: 'border-gold/50 bg-gold/10 text-gold',
  },
  closes_in_weeks: {
    label: 'Cierra pronto',
    Icon: Clock,
    tone: 'border-amber-500/50 bg-amber-500/10 text-amber-300',
  },
  waitlist_only: {
    label: 'Solo lista de espera',
    Icon: ListChecks,
    tone: 'border-ink-600 bg-ink-900 text-ink-200',
  },
  by_request: {
    label: 'Por solicitud',
    Icon: MessageCircle,
    tone: 'border-ink-600 bg-ink-900 text-ink-200',
  },
};

export function ScheduleBadge({ kind, weeks, className }: ScheduleBadgeProps) {
  const cfg = CONFIG[kind];
  const Icon = cfg.Icon;
  const extra = kind === 'closes_in_weeks' && typeof weeks === 'number' ? ` (~${weeks} sem.)` : '';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.15em]',
        cfg.tone,
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {cfg.label}
      {extra}
    </span>
  );
}

export function ScheduleText({ kind, weeks }: { kind: ScheduleKind; weeks?: number | null }) {
  switch (kind) {
    case 'open_now':
      return <>Agenda abierta para reservas.</>;
    case 'closes_in_weeks':
      return (
        <>
          Cierra en ~{typeof weeks === 'number' ? weeks : '?'}{' '}
          {typeof weeks === 'number' ? (weeks === 1 ? 'semana' : 'semanas') : ''}.
        </>
      );
    case 'waitlist_only':
      return <>Solo lista de espera. Escríbenos para sumarte.</>;
    case 'by_request':
      return <>Reservas por solicitud directa con el tatuador.</>;
  }
}
