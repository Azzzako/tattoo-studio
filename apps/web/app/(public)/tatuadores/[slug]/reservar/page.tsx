import { notFound } from 'next/navigation';

import BookingWizard from './booking-wizard';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{ slug: string }>;
}

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

export const dynamic = 'force-dynamic';

export default async function BookingPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('tattoo_artists')
    .select('slug')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (!data) notFound();
  return <BookingWizard slug={slug} />;
}
