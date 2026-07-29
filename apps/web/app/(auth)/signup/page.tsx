import { Card } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/supabase/current-user';
import { redirect } from 'next/navigation';

import { SignupForm } from './signup-form';

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect('/');

  return (
    <Card className="space-y-6 p-8">
      <header className="space-y-1">
        <h1 className="font-display text-3xl">Crear cuenta</h1>
        <p className="text-muted-foreground text-sm">
          Te enviaremos un enlace para confirmar tu correo. Sin contraseñas.
        </p>
      </header>
      <SignupForm />
    </Card>
  );
}
