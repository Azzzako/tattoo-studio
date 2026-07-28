import { NextResponse } from 'next/server';
import { GoogleCalendarClient } from '@tattoo/google';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) return NextResponse.json({ error: 'invalid_request' }, { status: 400 });

  const [userId, artistId] = state.split('|');
  if (!userId || !artistId) {
    return NextResponse.json({ error: 'invalid_state' }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY;
  if (!clientId || !clientSecret || !redirectUri || !encryptionKey) {
    return NextResponse.json({ error: 'google_oauth_not_configured' }, { status: 503 });
  }

  const client = new GoogleCalendarClient({ clientId, clientSecret, redirectUri, encryptionKey });
  const tokens = await client.exchangeCode(code);
  const cipher = client.encryptTokens(tokens);

  const supabase = await createClient();
  const { error } = await supabase.from('google_connections').upsert(
    {
      studio_id: process.env.STUDIO_ID!,
      artist_id: artistId,
      google_user_email: userId,
      google_calendar_id: 'primary',
      access_token_cipher: cipher.accessTokenCipher,
      refresh_token_cipher: cipher.refreshTokenCipher,
      access_token_expires_at: tokens.expiresAt,
      scope: tokens.scope,
    },
    { onConflict: 'artist_id,google_calendar_id' },
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.redirect(new URL('/admin/configuracion', url.origin));
}