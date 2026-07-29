import { cn } from '@/lib/cn';

export function Banner({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        'border-accent/30 bg-accent/5 text-accent-foreground rounded-md border px-4 py-3 text-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}
