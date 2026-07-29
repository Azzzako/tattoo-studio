import 'server-only';

import { redirect } from 'next/navigation';

import { getCurrentProfile, type Profile } from './current-user';

export type StaffRole = Extract<Profile['role'], 'admin' | 'artist'>;

export async function requireStaff(): Promise<Profile & { role: StaffRole }> {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?message=Inicia%20sesi%C3%B3n');
  if (profile.role !== 'admin' && profile.role !== 'artist') {
    redirect('/?message=No%20tienes%20acceso');
  }
  return profile as Profile & { role: StaffRole };
}

export async function requireAdmin(): Promise<Profile & { role: 'admin' }> {
  const profile = await requireStaff();
  if (profile.role !== 'admin') {
    redirect('/admin?message=Solo%20administradores');
  }
  return profile as Profile & { role: 'admin' };
}
