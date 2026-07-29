import { Card } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/supabase/current-user';
import { redirect } from 'next/navigation';

import { LoginForm } from './login-form';

interface LoginPageProps {
  searchParams: Promise<{ after?: string; message?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);
  if (user) redirect(params.after && params.after.startsWith('/') ? params.after : '/');

  return (
    <Card className="space-y-6 p-8">
      <header className="space-y-1">
        <h1 className="font-display text-3xl">Inicia sesión</h1>
        <p className="text-muted-foreground text-sm">
          Te enviaremos un enlace mágico a tu correo para entrar sin contraseña.
        </p>
      </header>
      <LoginForm after={params.after} initialMessage={params.message ?? null} />
    </Card>
  );
}
