import { decryptToken, encryptToken } from '../../domain/src/google/sync.js';

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  scope: string;
}

export interface GoogleCalendarListResponse {
  items?: Array<{ id: string; summary: string; primary?: boolean }>;
  nextSyncToken?: string;
}

export interface GoogleEventListResponse {
  items?: Array<{
    id: string;
    status?: string;
    summary?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
    etag?: string;
    iCalUID?: string;
    updated?: string;
  }>;
  nextSyncToken?: string;
  nextPageToken?: string;
}

export interface GoogleClientConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  encryptionKey: string;
}

export class GoogleCalendarClient {
  constructor(private readonly config: GoogleClientConfig) {}

  buildAuthUrl(state: string): string {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('redirect_uri', this.config.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');
    url.searchParams.set('include_granted_scopes', 'true');
    url.searchParams.set(
      'scope',
      [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly',
        'openid',
        'email',
        'profile',
      ].join(' '),
    );
    url.searchParams.set('state', state);
    return url.toString();
  }

  async exchangeCode(code: string): Promise<GoogleTokens> {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri,
      }),
    });
    if (!res.ok) throw new Error(`google_token_exchange_failed: ${res.status}`);
    return this.parseTokens((await res.json()) as Record<string, unknown>);
  }

  async refresh(refreshToken: string): Promise<GoogleTokens> {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });
    if (!res.ok) throw new Error(`google_token_refresh_failed: ${res.status}`);
    const json = (await res.json()) as Record<string, unknown>;
    return this.parseTokens({ ...json, refresh_token: refreshToken });
  }

  encryptTokens(tokens: GoogleTokens) {
    return {
      accessTokenCipher: encryptToken(tokens.accessToken, this.config.encryptionKey),
      refreshTokenCipher: encryptToken(tokens.refreshToken, this.config.encryptionKey),
    };
  }

  decryptTokens(payload: { accessTokenCipher: string; refreshTokenCipher: string }): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: decryptToken(payload.accessTokenCipher, this.config.encryptionKey),
      refreshToken: decryptToken(payload.refreshTokenCipher, this.config.encryptionKey),
    };
  }

  async listCalendars(tokens: GoogleTokens): Promise<GoogleCalendarListResponse> {
    return this.authedFetch(tokens, 'https://www.googleapis.com/calendar/v3/users/me/calendarList');
  }

  async listEvents(
    tokens: GoogleTokens,
    calendarId: string,
    params: Record<string, string>,
  ): Promise<GoogleEventListResponse> {
    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    );
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    return this.authedFetch(tokens, url.toString());
  }

  async createEvent(
    tokens: GoogleTokens,
    calendarId: string,
    body: Record<string, unknown>,
  ): Promise<{ id: string; etag?: string }> {
    const res = await this.authedFetchRaw(tokens, `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`google_event_create_failed: ${res.status}`);
    const json = (await res.json()) as { id: string; etag?: string };
    return json;
  }

  async watchCalendar(
    tokens: GoogleTokens,
    calendarId: string,
    body: { id: string; address: string; token?: string; ttl?: string },
  ) {
    const res = await this.authedFetchRaw(
      tokens,
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/watch`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) throw new Error(`google_watch_failed: ${res.status}`);
    return (await res.json()) as { id: string; resourceId: string; expiration?: string };
  }

  async stopChannel(tokens: GoogleTokens, channel: { id: string; resourceId: string }) {
    const res = await this.authedFetchRaw(tokens, 'https://www.googleapis.com/calendar/v3/channels/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(channel),
    });
    if (!res.ok && res.status !== 404) throw new Error(`google_stop_failed: ${res.status}`);
  }

  private async parseTokens(json: Record<string, unknown>): Promise<GoogleTokens> {
    const accessToken = String(json.access_token ?? '');
    const refreshToken = String(json.refresh_token ?? '');
    const expiresIn = Number(json.expires_in ?? 0);
    const scope = String(json.scope ?? '');
    if (!accessToken || !refreshToken) {
      throw new Error('google_tokens_missing');
    }
    return {
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      scope,
    };
  }

  private async authedFetch<T>(tokens: GoogleTokens, url: string): Promise<T> {
    const res = await this.authedFetchRaw(tokens, url);
    if (!res.ok) throw new Error(`google_request_failed: ${res.status}`);
    return (await res.json()) as T;
  }

  private async authedFetchRaw(tokens: GoogleTokens, url: string, init: RequestInit = {}) {
    let current = tokens;
    if (new Date(current.expiresAt).getTime() < Date.now() + 30_000) {
      current = await this.refresh(current.refreshToken);
    }
    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${current.accessToken}`);
    let res = await fetch(url, { ...init, headers });
    if (res.status === 401) {
      current = await this.refresh(current.refreshToken);
      headers.set('Authorization', `Bearer ${current.accessToken}`);
      res = await fetch(url, { ...init, headers });
    }
    return res;
  }
}