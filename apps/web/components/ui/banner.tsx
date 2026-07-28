import { cn } from '@/lib/cn';

export function Banner({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        'rounded-md border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent-foreground',
        className,
      )}
    >
      {children}
    </div>
  );
}