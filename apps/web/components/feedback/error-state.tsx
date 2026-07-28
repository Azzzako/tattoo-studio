import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ErrorStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ErrorState({ title, description, action, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'border-destructive/40 bg-destructive/5 flex flex-col items-center gap-3 rounded-lg border px-6 py-12 text-center',
        className,
      )}
    >
      <AlertTriangle className="text-destructive h-8 w-8" />
      <h3 className="font-display text-2xl">{title}</h3>
      {description && <p className="text-muted-foreground max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
