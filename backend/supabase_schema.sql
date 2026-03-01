-- ============================================================
-- Fest-in-a-Box — Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. PACKS table — stores all generated event packs
CREATE TABLE IF NOT EXISTS packs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_name   TEXT NOT NULL,
    pack_data    JSONB NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_packs_user_id ON packs(user_id);
CREATE INDEX IF NOT EXISTS idx_packs_created_at ON packs(created_at DESC);

-- 2. SHARE_TOKENS table — shareable links for collaboration
CREATE TABLE IF NOT EXISTS share_tokens (
    token        TEXT PRIMARY KEY,
    pack_id      UUID REFERENCES packs(id) ON DELETE CASCADE,
    created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_share_tokens_pack_id ON share_tokens(pack_id);

-- 3. REGISTRATIONS table — participants who sign up via QR page
CREATE TABLE IF NOT EXISTS registrations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_token         TEXT REFERENCES share_tokens(token) ON DELETE CASCADE,
    participant_name    TEXT NOT NULL,
    participant_email   TEXT NOT NULL,
    roll_no             TEXT,
    registered_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reg_token ON registrations(share_token);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own packs" ON packs;
DROP POLICY IF EXISTS "Users can insert their own packs" ON packs;
DROP POLICY IF EXISTS "Users can update their own packs" ON packs;
DROP POLICY IF EXISTS "Users can delete their own packs" ON packs;
DROP POLICY IF EXISTS "Service role can do anything on packs" ON packs;
DROP POLICY IF EXISTS "Anyone can read share tokens" ON share_tokens;
DROP POLICY IF EXISTS "Service role can insert share tokens" ON share_tokens;
DROP POLICY IF EXISTS "Anyone can register" ON registrations;
DROP POLICY IF EXISTS "Pack owners can view registrations" ON registrations;

-- PACKS policies
CREATE POLICY "Users can read their own packs"
    ON packs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own packs"
    ON packs FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own packs"
    ON packs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own packs"
    ON packs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on packs"
    ON packs USING (auth.role() = 'service_role');

-- SHARE_TOKENS policies (public read via token)
CREATE POLICY "Anyone can read share tokens"
    ON share_tokens FOR SELECT USING (true);

CREATE POLICY "Service role can insert share tokens"
    ON share_tokens FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- REGISTRATIONS policies
CREATE POLICY "Anyone can register"
    ON registrations FOR INSERT WITH CHECK (true);

CREATE POLICY "Pack owners can view registrations"
    ON registrations FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM share_tokens st
            JOIN packs p ON p.id = st.pack_id
            WHERE st.token = registrations.share_token
            AND p.user_id = auth.uid()
        )
    );

-- ============================================================
-- REALTIME (for collaborative editing)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'packs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE packs;
  END IF;
END $$;

-- ============================================================
-- HELPFUL VIEWS
-- ============================================================
CREATE OR REPLACE VIEW pack_summaries AS
SELECT
    p.id,
    p.user_id,
    p.event_name,
    p.pack_data->'poster_text'->>'headline' AS headline,
    p.created_at,
    COUNT(r.id) AS registration_count
FROM packs p
LEFT JOIN share_tokens st ON st.pack_id = p.id
LEFT JOIN registrations r ON r.share_token = st.token
GROUP BY p.id, p.user_id, p.event_name, p.pack_data, p.created_at;
