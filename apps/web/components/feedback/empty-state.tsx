import { cn } from '@/lib/cn';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-border bg-ink-900/40 flex flex-col items-center gap-3 rounded-lg border px-6 py-12 text-center',
        className,
      )}
    >
      {icon && <div className="text-gold">{icon}</div>}
      <h3 className="font-display text-2xl">{title}</h3>
      {description && <p className="text-muted-foreground max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
