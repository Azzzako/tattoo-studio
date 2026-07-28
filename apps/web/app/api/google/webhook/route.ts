import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const headers = request.headers;
  const channelId = headers.get('x-goog-channel-id');
  const resourceId = headers.get('x-goog-resource-id');
  const state = headers.get('x-goog-resource-state');
  if (!channelId || !resourceId || !state) {
    return NextResponse.json({ error: 'invalid_headers' }, { status: 400 });
  }

  const supabase = await createClient();
  await supabase.from('sync_log').insert({
    channel_id: null,
    artist_id: '00000000-0000-0000-0000-000000000000',
    event_kind: state,
    payload: { channelId, resourceId },
  });
  if (state === 'sync') return new NextResponse(null, { status: 204 });
  return new NextResponse(null, { status: 204 });
}
