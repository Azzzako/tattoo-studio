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
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  shine?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, shine = true, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
        {shine ? (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -inset-x-1 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-[transform,opacity] duration-500 group-hover/btn:translate-x-[150%] group-hover/btn:opacity-100"
            />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
