import "server-only";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { seedDatabase } from "./seed";

/**
 * The one SQLite database behind the site, via Node's built-in `node:sqlite`
 * (no native dependency). It lives at data/oneraise.db, creates its own schema
 * and seeds itself on first open. Delete the file (or run `npm run db:reset`)
 * to start again from the seed.
 *
 * Money is whole US dollars in INTEGER columns; every timestamp is epoch
 * milliseconds. Queries are synchronous, so callers that render must go
 * through the data layer in src/server/queries, which calls `connection()`
 * first — otherwise Next would run them once at build time.
 */

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United Kingdom',
  role TEXT NOT NULL CHECK (role IN ('donor', 'creator', 'admin')),
  staff_title TEXT,
  email_verified_at INTEGER,
  two_factor INTEGER NOT NULL DEFAULT 0,
  suspended_at INTEGER,
  card_label TEXT,
  card_expiry TEXT,
  notify_prefs TEXT NOT NULL DEFAULT '{}',
  password_changed_at INTEGER NOT NULL,
  last_sign_in_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE,
  at INTEGER NOT NULL,
  ip TEXT,
  success INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS login_attempts_email ON login_attempts(email, at);

CREATE TABLE IF NOT EXISTS tokens (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('reset', 'verify', 'unlock')),
  expires_at INTEGER NOT NULL,
  used_at INTEGER
);

CREATE TABLE IF NOT EXISTS creators (
  id INTEGER PRIMARY KEY,
  owner_user_id INTEGER UNIQUE REFERENCES users(id),
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  structure TEXT NOT NULL DEFAULT 'Sole trader',
  kyc_status TEXT NOT NULL DEFAULT 'none'
    CHECK (kyc_status IN ('none', 'pending', 'verified', 'stale', 'rejected')),
  kyc_verified_at INTEGER,
  payout_account TEXT,
  payout_currency TEXT NOT NULL DEFAULT 'USD',
  barred_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS identity_checks (
  id INTEGER PRIMARY KEY,
  creator_id INTEGER NOT NULL REFERENCES creators(id),
  status TEXT NOT NULL CHECK (status IN ('incomplete', 'ready', 'resubmitted', 'verified', 'rejected')),
  documents TEXT NOT NULL,
  checks TEXT NOT NULL,
  submitted_at INTEGER NOT NULL,
  decided_at INTEGER,
  decided_by INTEGER REFERENCES users(id),
  note TEXT
);

CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  creator_id INTEGER NOT NULL REFERENCES creators(id),
  title TEXT NOT NULL,
  short_title TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  summary TEXT NOT NULL,
  summary_short TEXT NOT NULL,
  story TEXT NOT NULL DEFAULT '[]',
  hero_caption TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  goal INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'live', 'paused', 'refunded', 'failed', 'taken_down')),
  duration_days INTEGER NOT NULL DEFAULT 30,
  launched_at INTEGER,
  ends_at INTEGER,
  paused_until INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS milestones (
  id INTEGER PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  terms TEXT NOT NULL DEFAULT '',
  amount INTEGER NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('pending', 'current', 'submitted', 'released', 'refunded')),
  due_at INTEGER,
  evidence_note TEXT NOT NULL DEFAULT '',
  evidence TEXT NOT NULL DEFAULT '[]',
  evidence_document TEXT,
  submitted_at INTEGER,
  window_ends_at INTEGER,
  held_by INTEGER REFERENCES users(id),
  held_at INTEGER,
  released_at INTEGER,
  refunded_at INTEGER,
  UNIQUE (campaign_id, position)
);

CREATE TABLE IF NOT EXISTS tiers (
  id INTEGER PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  label TEXT NOT NULL,
  stock INTEGER
);

CREATE TABLE IF NOT EXISTS pledges (
  id INTEGER PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id),
  user_id INTEGER REFERENCES users(id),
  tier_id INTEGER REFERENCES tiers(id),
  backer_name TEXT NOT NULL,
  backer_location TEXT NOT NULL DEFAULT '',
  amount INTEGER NOT NULL,
  card_label TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS pledges_campaign ON pledges(campaign_id, created_at);
CREATE INDEX IF NOT EXISTS pledges_user ON pledges(user_id);

CREATE TABLE IF NOT EXISTS milestone_reviews (
  id INTEGER PRIMARY KEY,
  milestone_id INTEGER NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  pledge_id INTEGER NOT NULL REFERENCES pledges(id),
  decision TEXT NOT NULL CHECK (decision IN ('approve', 'dispute')),
  note TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  UNIQUE (milestone_id, pledge_id)
);

CREATE TABLE IF NOT EXISTS disputes (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  milestone_id INTEGER NOT NULL REFERENCES milestones(id),
  status TEXT NOT NULL CHECK (status IN ('new', 'in_review', 'awaiting_creator', 'resolved', 'withdrawn')),
  assignee_id INTEGER REFERENCES users(id),
  opened_at INTEGER NOT NULL,
  deadline_at INTEGER NOT NULL,
  creator_response TEXT,
  creator_response_at INTEGER,
  decision TEXT CHECK (decision IN ('release', 'refund')),
  decided_by INTEGER REFERENCES users(id),
  decided_at INTEGER,
  reason TEXT
);

CREATE TABLE IF NOT EXISTS updates (
  id INTEGER PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS follows (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id INTEGER NOT NULL REFERENCES creators(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, creator_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id),
  campaign_text TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT NOT NULL,
  reporter_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'actioned', 'dismissed')),
  created_at INTEGER NOT NULL,
  resolved_at INTEGER
);

CREATE TABLE IF NOT EXISTS refund_batches (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'settled')),
  created_at INTEGER NOT NULL,
  settled_at INTEGER
);

CREATE TABLE IF NOT EXISTS refunds (
  id INTEGER PRIMARY KEY,
  batch_id INTEGER NOT NULL REFERENCES refund_batches(id),
  pledge_id INTEGER NOT NULL REFERENCES pledges(id),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'paid', 'failed')),
  failure_reason TEXT,
  failure_action TEXT,
  paid_at INTEGER
);
CREATE INDEX IF NOT EXISTS refunds_pledge ON refunds(pledge_id);

CREATE TABLE IF NOT EXISTS payouts (
  id INTEGER PRIMARY KEY,
  milestone_id INTEGER NOT NULL UNIQUE REFERENCES milestones(id),
  gross INTEGER NOT NULL,
  fee INTEGER NOT NULL,
  net INTEGER NOT NULL,
  account TEXT NOT NULL,
  released_at INTEGER NOT NULL,
  paid_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  at INTEGER NOT NULL,
  actor_id INTEGER REFERENCES users(id),
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  reason TEXT NOT NULL,
  amount INTEGER,
  source TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
`;

const DB_PATH = process.env.ONERAISE_DB_PATH ?? path.join(process.cwd(), "data", "oneraise.db");

const globalForDb = globalThis as unknown as { __oneraiseDb?: DatabaseSync };

function open(): DatabaseSync {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const conn = new DatabaseSync(DB_PATH);
  conn.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  conn.exec(SCHEMA);

  // Seed exactly once, even if two workers open the file at the same moment.
  conn.exec("BEGIN IMMEDIATE");
  try {
    const seeded = conn.prepare("SELECT value FROM meta WHERE key = 'seeded_at'").get();
    if (!seeded) {
      seedDatabase(conn);
      conn.prepare("INSERT INTO meta (key, value) VALUES ('seeded_at', ?)").run(String(Date.now()));
    }
    conn.exec("COMMIT");
  } catch (error) {
    conn.exec("ROLLBACK");
    throw error;
  }
  return conn;
}

export function db(): DatabaseSync {
  if (!globalForDb.__oneraiseDb) globalForDb.__oneraiseDb = open();
  return globalForDb.__oneraiseDb;
}

let depth = 0;

/**
 * Run `fn` atomically. Nested calls become savepoints, so domain operations
 * that each open a transaction can be composed inside a larger one. `fn` must
 * be synchronous — node:sqlite is, and an await inside would let another
 * request interleave with the open transaction.
 */
export function tx<T>(fn: () => T): T {
  const conn = db();
  const savepoint = `sp_${depth}`;
  conn.exec(depth === 0 ? "BEGIN IMMEDIATE" : `SAVEPOINT ${savepoint}`);
  depth++;
  try {
    const result = fn();
    depth--;
    conn.exec(depth === 0 ? "COMMIT" : `RELEASE ${savepoint}`);
    return result;
  } catch (error) {
    depth--;
    conn.exec(depth === 0 ? "ROLLBACK" : `ROLLBACK TO ${savepoint}; RELEASE ${savepoint}`);
    throw error;
  }
}

type Param = string | number | bigint | null | Uint8Array;
type Row = Record<string, unknown>;

export function all<T = Row>(sql: string, ...params: Param[]): T[] {
  return db().prepare(sql).all(...params) as T[];
}

export function get<T = Row>(sql: string, ...params: Param[]): T | undefined {
  return db().prepare(sql).get(...params) as T | undefined;
}

export function run(sql: string, ...params: Param[]): { changes: number; lastId: number } {
  const result = db().prepare(sql).run(...params);
  return { changes: Number(result.changes), lastId: Number(result.lastInsertRowid) };
}
