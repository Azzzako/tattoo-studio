export { createSupabaseBrowserClient, type TypedSupabaseClient } from './client';

export {
  createSupabaseServerClient,
  type TypedSupabaseClient as TypedSupabaseServerClient,
} from './server';

export { createSupabaseAdminClient, type TypedSupabaseAdminClient } from './admin';

export { updateSupabaseSession } from './middleware';

export {
  getCurrentUser,
  getCurrentProfile,
  requireUser,
  requireProfile,
  type Profile,
} from './current-user';

export {
  getArtistsList,
  getArtistBySlug,
  getArtistByProfileId,
  type ArtistRow,
} from './artists-cache';
