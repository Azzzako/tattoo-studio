// Database types for Supabase clients.
//
// Regenerate after schema changes with:
//   supabase gen types typescript --linked > apps/web/lib/supabase/types.ts
//
// Until generated, clients use the untyped SupabaseClient (see ./client.ts,
// ./server.ts, ./admin.ts). This file exists so callers can `import type {
// Database } from './types'` once it's regenerated.
//
// Expected shape (post-generation):
//
//   export type Database = {
//     public: {
//       Tables: { studios: { Row: {...}; Insert: {...}; Update: {...} } };
//       Functions: { current_user_role: { Returns: 'admin' | 'artist' | 'customer' } };
//     };
//   };

export type Database = never;
