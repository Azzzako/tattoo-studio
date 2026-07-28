import { NextResponse } from 'next/server';
import { GoogleCalendarClient } from '@tattoo/google';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const artistId = url.searchParams.get('artistId');
  if (!artistId) return NextResponse.json({ error: 'artistId required' }, { status: 400 });

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.redirect(new URL('/login', url.origin));

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'google_oauth_not_configured' }, { status: 503 });
  }

  const client = new GoogleCalendarClient({
    clientId,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? '',
    redirectUri,
    encryptionKey: process.env.TOKEN_ENCRYPTION_KEY ?? '',
  });
  const state = `${userData.user.id}|${artistId}`;
  return NextResponse.redirect(client.buildAuthUrl(state));
}
