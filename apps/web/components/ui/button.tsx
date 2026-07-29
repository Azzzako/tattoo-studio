'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-gold text-gold-foreground hover:bg-gold/90 shadow-[0_0_0_0_hsl(var(--gold))] hover:shadow-[0_0_24px_-4px_hsl(var(--gold)/0.5)] transition-shadow',
        secondary: 'bg-ink-100 text-ink-900 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-50',
        outline: 'border border-input bg-background hover:bg-ink-100 dark:hover:bg-ink-800',
        ghost: 'hover:bg-ink-100 dark:hover:bg-ink-800',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  shine?: boolean;
}

/**
 * Button principal. El shine se aplica mediante pseudo-elemento
 * (after:) para no romper la composición de Radix `Slot` cuando
 * `asChild` está activo. Por defecto shine solo aparece en la
 * variante primary y respeta prefers-reduced-motion.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size, asChild = false, shine, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const shouldShine = shine ?? variant === 'default';
    return (
      <Comp
        ref={ref}
        data-shine={shouldShine ? 'true' : undefined}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
