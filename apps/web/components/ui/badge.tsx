import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.15em] transition-colors',
  {
    variants: {
      variant: {
        default: 'border-gold bg-gold/10 text-gold',
        outline: 'border-border bg-transparent text-ink-200',
        solid: 'border-foreground bg-foreground text-background',
        muted: 'border-ink-700 bg-ink-900 text-ink-300',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };