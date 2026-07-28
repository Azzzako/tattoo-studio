import { cn } from '@/lib/cn';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-sm bg-[linear-gradient(90deg,hsl(var(--ink-800))_0%,hsl(var(--ink-700))_50%,hsl(var(--ink-800))_100%)] bg-[length:200%_100%]',
        className,
      )}
      {...props}
    />
  );
}