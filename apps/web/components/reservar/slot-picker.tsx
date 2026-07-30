'use client';

import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export type ClientSlot = {
  startsAtIso: string;
  endsAtIso: string;
  status: 'free' | 'busy';
};

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTimeLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface SlotPickerProps {
  slots: ClientSlot[];
  loading?: boolean;
  selectedStartsAt: string | null;
  onPick: (startsAtIso: string, dateIso: string) => void;
}

export function SlotPicker({ slots, loading, selectedStartsAt, onPick }: SlotPickerProps) {
  if (loading) {
    return (
      <div className="border-border flex items-center justify-center gap-2 rounded-md border p-6 text-sm">
        <Loader2 className="text-gold h-4 w-4 animate-spin" /> Buscando horarios...
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="border-border bg-ink-900 rounded-md border p-4 text-sm">
        <p className="text-muted-foreground">
          Sin horarios libres en los proximos 7 dias. Contacta al estudio por WhatsApp.
        </p>
      </div>
    );
  }

  const byDay = new Map<string, ClientSlot[]>();
  for (const slot of slots) {
    const day = slot.startsAtIso.slice(0, 10);
    const arr = byDay.get(day);
    if (arr) arr.push(slot);
    else byDay.set(day, [slot]);
  }

  return (
    <div className="space-y-3">
      <p className="text-ink-400 text-xs uppercase tracking-[0.2em]">Horarios disponibles</p>
      {Array.from(byDay.entries()).map(([day, daySlots]) => (
        <div key={day} className="space-y-1.5">
          <p className="text-gold text-xs font-medium capitalize">
            {formatDateLabel(`${day}T12:00:00`)}
          </p>
          <div className="flex flex-wrap gap-2">
            {daySlots.map((slot) => {
              const isSelected = selectedStartsAt === slot.startsAtIso;
              const isFree = slot.status === 'free';
              return (
                <Button
                  key={slot.startsAtIso}
                  type="button"
                  size="sm"
                  variant={isSelected ? 'default' : 'outline'}
                  disabled={!isFree}
                  onClick={() => onPick(slot.startsAtIso, day)}
                  className={cn(!isFree && 'opacity-40')}
                  aria-pressed={isSelected}
                >
                  {formatTimeLabel(slot.startsAtIso)}
                  {!isFree && <span className="ml-1 text-[0.6rem] uppercase">ocupado</span>}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
