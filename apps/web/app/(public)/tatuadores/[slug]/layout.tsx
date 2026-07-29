import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function generateStaticParams() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from('tattoo_artists').select('slug').eq('is_active', true);
    return (data ?? [])
      .map((r) => ({ slug: (r as { slug: string }).slug }))
      .filter((p) => Boolean(p.slug));
  } catch {
    return [];
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
