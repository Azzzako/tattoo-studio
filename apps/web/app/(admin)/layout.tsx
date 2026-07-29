import Link from 'next/link';
import { CalendarDays, Users, UserSquare2 } from 'lucide-react';

import { Logo } from '@/components/brand/logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { requireStaff } from '@/lib/supabase/guards';
import { getCurrentUser } from '@/lib/supabase/current-user';
import { UserMenu } from '@/components/layout/user-menu';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [profile, user] = await Promise.all([requireStaff(), getCurrentUser()]);

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <header className="border-border/80 bg-background/95 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-40 border-b backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              aria-label="Ir al panel"
              className="transition-opacity hover:opacity-80"
            >
              <Logo subtitle="PANEL" />
            </Link>
            <nav aria-label="Panel" className="hidden items-center gap-1 md:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Calendario
                </Link>
              </Button>
              {profile.role === 'admin' && (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/admin/artists" className="flex items-center gap-2">
                      <UserSquare2 className="h-4 w-4" /> Tatuadores
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/admin/customers" className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> Clientes
                    </Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden text-xs sm:inline-flex">
              {profile.role}
            </Badge>
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href="/">Ver sitio</Link>
            </Button>
            <UserMenu
              email={user?.email ?? ''}
              displayName={profile.full_name}
              role={profile.role}
              avatarUrl={profile.avatar_url}
            />
          </div>
        </div>
      </header>
      <main className="container flex-1 py-8">{children}</main>
    </div>
  );
}
