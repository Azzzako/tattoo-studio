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
        <span className="bg-gold/40 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
        <span className="border-gold relative inline-flex h-10 w-10 rounded-full border" />
      </span>
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
}
