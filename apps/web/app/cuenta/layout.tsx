import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';

import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { getCurrentUser, getCurrentProfile } from '@/lib/supabase/current-user';
import { UserMenu } from '@/components/layout/user-menu';

export default async function CuentaLayout({ children }: { children: React.ReactNode }) {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  if (!user) redirect('/login?message=Inicia%20sesi%C3%B3n');
  if (!profile) redirect('/?message=Perfil%20no%20encontrado');

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <header className="border-border/80 bg-background/95 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-40 border-b backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Volver
              </Link>
            </Button>
            <Link href="/cuenta" className="transition-opacity hover:opacity-80">
              <Logo subtitle="MI CUENTA" />
            </Link>
          </div>
          <UserMenu
            email={user.email ?? ''}
            displayName={profile.full_name}
            role={profile.role}
            avatarUrl={profile.avatar_url}
          />
        </div>
      </header>
      <main className="container flex-1 py-8">{children}</main>
    </div>
  );
}
