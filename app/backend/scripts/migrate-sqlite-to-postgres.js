#!/usr/bin/env node
/**
 * Simple migration script: read rows from SQLite (prisma/dev.db) and insert into Postgres (DATABASE_URL).
 * - Idempotent via ON CONFLICT DO NOTHING
 * - Inserts tables in an order that respects foreign keys
 *
 * Usage:
 *   node scripts/migrate-sqlite-to-postgres.js
 *
 * Requirements: set env var DATABASE_URL to your Supabase Postgres connection string.
 * Install runtime deps if needed: `npm install sqlite3 pg sqlite` (sqlite is for the open() wrapper)
 */

const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { Client } = require('pg');

async function openSqlite(dbFile) {
  return open({ filename: dbFile, driver: sqlite3.Database });
}

function tryParseJson(val) {
  if (val === null || val === undefined) return null;
  if (typeof val !== 'string') return val;
  const s = val.trim();
  if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
    try { return JSON.parse(s); } catch (e) { return val; }
  }
  return val;
}

async function migrate() {
  const SQLITE_PATH = path.join(__dirname, '..', 'prisma', 'dev.db');
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('DATABASE_URL env var is required (Supabase connection)');
    process.exit(1);
  }

  const sqlite = await openSqlite(SQLITE_PATH);
  const pg = new Client({ connectionString: DATABASE_URL });
  await pg.connect();

  // Order chosen from migrations to satisfy FK dependencies
  const tables = [
    'User',
    'Business',
    'Team',
    'TeamMember',
    'Lead',
    'Booking',
    'AvailableSlot',
    'EmailSequence',
    'Analytics',
    'LeadRoutingRule',
    'Subscription',
    'Payment',
    'ABTest',
    'SeoAudit',
    'WebsiteGenerationConfig',
    'OnboardingConversation'
  ];

  for (const table of tables) {
    try {
      const rows = await sqlite.all(`SELECT * FROM "${table}"`);
      if (!rows || rows.length === 0) {
        console.log(`Skipping ${table}: no rows`);
        continue;
      }

      console.log(`Migrating ${rows.length} rows from ${table}...`);

      for (const row of rows) {
        const cols = Object.keys(row);
        const vals = cols.map((c) => tryParseJson(row[c]));

        const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
        const quotedCols = cols.map((c) => `"${c}"`).join(', ');

        const sql = `INSERT INTO "${table}" (${quotedCols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
        try {
          await pg.query(sql, vals);
        } catch (err) {
          console.error(`Failed to insert into ${table}:`, err.message || err);
        }
      }
      console.log(`Finished migrating table ${table}`);
    } catch (err) {
      console.warn(`Table ${table} not found in SQLite, skipping.`);
    }
  }

  await pg.end();
  await sqlite.close();
  console.log('Migration complete.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
