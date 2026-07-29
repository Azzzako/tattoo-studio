'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SuccessBanner } from '@/components/feedback/success-banner';
import { signUpWithMagicLink, type ActionResult } from '@/lib/supabase/auth-actions';

const schema = z.object({
  email: z.string().trim().email('Correo inválido'),
});

type FormValues = z.infer<typeof schema>;

export function SignupForm() {
  const [state, formAction, pending] = useActionState<ActionResult | undefined, FormData>(
    signUpWithMagicLink,
    undefined,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
    mode: 'onSubmit',
  });

  if (state?.ok) {
    return (
      <SuccessBanner
        title="Confirma tu correo"
        description="Te enviamos un enlace. Haz click en él para activar tu cuenta."
      />
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          {...form.register('email')}
          aria-invalid={form.formState.errors.email ? 'true' : undefined}
        />
        {form.formState.errors.email && (
          <p role="alert" className="text-destructive text-xs">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {state?.ok === false && (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Enviando…' : 'Crear cuenta'}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-gold hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
