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
        'border-gold/40 bg-gold/5 text-foreground flex flex-col gap-2 rounded-lg border px-6 py-5 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 className="text-gold mt-0.5 h-5 w-5" />
        <div>
          <p className="font-display text-lg leading-tight">{title}</p>
          {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
