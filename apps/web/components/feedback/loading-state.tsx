import { cn } from '@/lib/cn';

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = 'Cargando', className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center gap-3 px-6 py-12 text-center', className)}
    >
      <span className="relative flex h-10 w-10">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/40 opacity-75" />
        <span className="relative inline-flex h-10 w-10 rounded-full border border-gold" />
      </span>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}