/**
 * CLI: genera una API key para clientes externos.
 *
 * Uso (Bun o Node 20.6+, ambos con --env-file):
 *   bun --env-file=.env run scripts/create-api-key.ts "<nombre>" [studio_id]
 *
 * El comando imprime el plaintext UNA sola vez. La DB solo guarda hash +
 * prefix. Guardá el plaintext en tu secret manager ahora.
 *
 * Solo funciona en server (requiere service-role). No commitear el output.
 */

import { randomBytes, createHash } from 'node:crypto';

import { createSupabaseAdminClient } from '../lib/supabase/admin';

const name = process.argv[2] ?? 'default';
const studioIdArg = process.argv[3];
const studioId = studioIdArg ?? process.env.STUDIO_ID;

if (!studioId) {
  console.error('Falta studio_id. Pasalo como argv[3] o define STUDIO_ID en .env.');
  process.exit(1);
}

const rawKey = `tk_${randomBytes(32).toString('base64url')}`;
const prefix = rawKey.slice(0, 12);
const hash = createHash('sha256').update(rawKey).digest('hex');

const admin = createSupabaseAdminClient();

const { data, error } = await admin
  .from('api_keys')
  .insert({
    studio_id: studioId,
    name,
    prefix,
    hash,
    scopes: ['read:artists'],
  })
  .select('id, name, prefix, scopes, created_at')
  .single();

if (error || !data) {
  console.error('Error creando API key:', error?.message ?? 'unknown');
  process.exit(1);
}

console.log('');
console.log('API key creada. Copiala ahora — solo se muestra una vez:');
console.log('');
console.log(`  ${rawKey}`);
console.log('');
console.log('Metadata:');
console.log(JSON.stringify(data, null, 2));
console.log('');
console.log('Uso:');
console.log(`  curl -H "Authorization: Bearer ${rawKey}" http://localhost:3000/api/v1/artists`);
