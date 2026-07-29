import { SiteHeader, type HeaderUser } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { getCurrentUser, getCurrentProfile } from '@/lib/supabase/current-user';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);

  const headerUser: HeaderUser | null =
    user && profile
      ? {
          email: user.email ?? '',
          displayName: profile.full_name,
          role: profile.role,
          avatarUrl: profile.avatar_url,
        }
      : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader user={headerUser} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
