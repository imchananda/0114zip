#!/usr/bin/env node
/**
 * Run Phase Data PR2 + PR3 SQL against Supabase Postgres.
 *
 * Requires DATABASE_URL (Supabase → Settings → Database → Connection string URI).
 * Example .env.local:
 *   DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
 *
 * Usage:
 *   node scripts/run-schedule-pr2-pr3.mjs
 *   node scripts/run-schedule-pr2-pr3.mjs --pr2-only
 *   node scripts/run-schedule-pr2-pr3.mjs --pr3-only
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(resolve(root, '.env'));
loadEnvFile(resolve(root, '.env.local'));

const args = new Set(process.argv.slice(2));
const runPr2 = !args.has('--pr3-only');
const runPr3 = !args.has('--pr2-only');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl || /localhost|mydb|johndoe|example/i.test(dbUrl)) {
  console.error(
    'Set DATABASE_URL to your Supabase Postgres URI (not the localhost placeholder in .env).',
  );
  console.error('Dashboard → Project Settings → Database → Connection string → URI');
  process.exit(1);
}

const files = [];
if (runPr2) files.push('supabase/migration_awards_schedule_fields.sql');
if (runPr3) files.push('supabase/migration_schedule_legacy_content_data.sql');

const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  console.log('Connected. Running migrations...\n');

  for (const file of files) {
    const sql = readFileSync(resolve(root, file), 'utf8');
    console.log(`→ ${file}`);
    await client.query(sql);
    console.log(`  ✓ done\n`);
  }

  const verify = await client.query(`
    SELECT
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'awards' AND column_name = 'ceremony_date'
      ) AS pr2_ceremony_date,
      EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'schedule_legacy_migrations'
      ) AS pr3_ledger,
      (SELECT count(*)::int FROM public.awards WHERE show_on_schedule = true) AS awards_on_schedule,
      (SELECT count(*)::int FROM public.schedule_legacy_migrations) AS migrated_legacy_rows
  `);

  console.log('Verification:', verify.rows[0]);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
