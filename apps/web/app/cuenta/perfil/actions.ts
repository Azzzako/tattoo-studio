'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function toggleFeaturedForArtist(formData: FormData): Promise<void> {
  const artistId = String(formData.get('artist_id') ?? '');
  if (!artistId) return;

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (profileRow?.role !== 'admin') return;

  const target = formData.get('featured');
  const featured = target === 'on' || target === 'true' || target === '1';

  await supabase.from('tattoo_artists').update({ featured }).eq('id', artistId);

  revalidateTag('tattoo-artists:list');
  revalidatePath('/admin/artists');
}
