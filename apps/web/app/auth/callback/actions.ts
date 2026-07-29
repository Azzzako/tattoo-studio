'use server';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function bootstrapProfileIfMissing(): Promise<{
  ok: boolean;
  reason?: string;
}> {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, reason: 'no_session' };

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (existing) return { ok: true };

  const admin = createSupabaseAdminClient();
  const studioId = process.env.STUDIO_ID ?? null;
  const { error } = await admin.from('profiles').insert({
    id: userData.user.id,
    role: 'customer',
    studio_id: studioId,
  });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
