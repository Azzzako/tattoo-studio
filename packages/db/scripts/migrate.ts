import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL ?? '';
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL or SUPABASE_DB_URL must be set to run migrations');
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    await client.query(`
      create table if not exists schema_migrations (
        filename text primary key,
        applied_at timestamptz not null default now()
      );
    `);
    const dir = path.resolve(new URL('.', import.meta.url).pathname, 'migrations');
    const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      const already = await client.query('select 1 from schema_migrations where filename = $1', [
        file,
      ]);
      if (already.rowCount) continue;
      const sql = await readFile(path.join(dir, file), 'utf8');
      console.log(`→ ${file}`);
      await client.query('begin');
      try {
        await client.query(sql);
        await client.query('insert into schema_migrations (filename) values ($1)', [file]);
        await client.query('commit');
      } catch (err) {
        await client.query('rollback');
        throw err;
      }
    }
    console.log('Migrations complete.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
