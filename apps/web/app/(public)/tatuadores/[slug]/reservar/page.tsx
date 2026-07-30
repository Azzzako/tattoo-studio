import { notFound } from 'next/navigation';

import { listSlots } from '@/lib/supabase/slots';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getArtistBySlug } from '@/lib/supabase/artists-cache';

import BookingWizardPage from './booking-wizard';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function BookingPage({ params }: PageProps) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const supabase = await createSupabaseServerClient();

  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price_cents, currency')
    .eq('is_active', true)
    .eq('studio_id', artist.studio_id)
    .order('price_cents', { ascending: true });

  const serviceList = (services ?? []).map((r) => {
    const row = r as {
      id: string;
      name: string;
      duration_minutes: number;
      price_cents: number;
      currency: string;
    };
    const priceLabel =
      row.price_cents === 0
        ? 'Gratis'
        : `Desde $${(row.price_cents / 100).toLocaleString('es-MX')} ${row.currency}`;
    return {
      id: row.id,
      name: row.name,
      durationMinutes: row.duration_minutes,
      priceLabel,
    };
  });

  const today = new Date();
  const slots: Array<{ startsAtIso: string; endsAtIso: string; status: 'free' | 'busy' }> = [];
  for (let offset = 0; offset < 7; offset++) {
    const day = new Date(today);
    day.setDate(today.getDate() + offset);
    const dayIso = day.toISOString().slice(0, 10);
    const daySlots = await listSlots({ artistId: artist.id, dateIso: dayIso });
    slots.push(...daySlots);
  }

  return (
    <BookingWizardPage
      slug={slug}
      artistDisplayName={artist.display_name}
      services={serviceList}
      initialSlots={slots}
    />
  );
}
