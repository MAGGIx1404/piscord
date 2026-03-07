/**
 * PostgreSQL schema definition for Flowcord auth foundation.
 * Run this via your migration runner or psql.
 */
export const schema = /* sql */ `
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  -- Users
  CREATE TABLE IF NOT EXISTS users (
    id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username        TEXT        NOT NULL UNIQUE,
    email           TEXT        NOT NULL UNIQUE,
    password_hash   TEXT        NOT NULL,
    avatar_url      TEXT,
    is_2fa_enabled  BOOLEAN     NOT NULL DEFAULT FALSE,
    totp_secret     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Refresh sessions
  CREATE TABLE IF NOT EXISTS refresh_sessions (
    id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id     TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT        NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_refresh_sessions_user_id ON refresh_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_refresh_sessions_token_hash ON refresh_sessions(token_hash);

  -- Auto-update updated_at
  CREATE OR REPLACE FUNCTION set_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE OR REPLACE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
`;
