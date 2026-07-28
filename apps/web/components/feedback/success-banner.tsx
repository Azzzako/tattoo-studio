import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SuccessBannerProps {
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}

export function SuccessBanner({ title, description, action, className }: SuccessBannerProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-gold/40 bg-gold/5 px-6 py-5 text-foreground sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 text-gold" />
        <div>
          <p className="font-display text-lg leading-tight">{title}</p>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}