import { cn } from '@/lib/cn';

/**
 * Logotipo tipográfico de Insigne Tattoo.
 *
 * "Insigne Tattoo" se renderiza con la tipografía display (Bickham Script Pro).
 * El subtítulo usa la tipografía sans en versalitas espaciadas para dar
 * presencia editorial.
 */
export function Logo({
  className,
  subtitle = 'ESTUDIO · CDMX',
}: {
  className?: string;
  subtitle?: string;
}) {
  return (
    <div className={cn('flex flex-col items-start gap-0.5', className)}>
      <span className="font-display text-foreground text-3xl leading-none tracking-tight">
        Insigne
        <span className="text-gold"> Tattoo</span>
      </span>
      <span className="text-ink-400 text-[0.6rem] font-medium uppercase tracking-[0.35em]">
        {subtitle}
      </span>
    </div>
  );
}

export function Logomark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('h-8 w-8', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="14" className="text-gold" />
      <path d="M11 21 L21 11 M11 11 L21 21" className="text-foreground" />
      <circle cx="16" cy="16" r="2" fill="currentColor" className="text-gold" />
    </svg>
  );
}
