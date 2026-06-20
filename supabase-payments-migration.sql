-- ============================================================
-- BuySellSeychelles — Payments migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add missing boost columns to listings (if not already present)
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS boost_type text,
  ADD COLUMN IF NOT EXISTS boost_score numeric DEFAULT 0;

-- 2. user_purchases — tracks photo packs, banner ads, etc.
CREATE TABLE IF NOT EXISTS user_purchases (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_type      text NOT NULL,
  listing_id        uuid REFERENCES listings(id) ON DELETE SET NULL,
  stripe_session_id text UNIQUE,
  amount_cents      integer,
  currency          text DEFAULT 'eur',
  expires_at        timestamptz,
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_purchases_user_id_idx  ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS user_purchases_product_idx  ON user_purchases(product_type);
CREATE INDEX IF NOT EXISTS user_purchases_expires_idx  ON user_purchases(expires_at);

-- Row-level security: users can only see their own purchases
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own purchases"
  ON user_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert (webhook)
CREATE POLICY "Service role insert purchases"
  ON user_purchases FOR INSERT
  WITH CHECK (true);

-- 3. Indexes on listings for boost ordering
CREATE INDEX IF NOT EXISTS listings_boosted_idx       ON listings(boosted, boosted_at DESC);
CREATE INDEX IF NOT EXISTS listings_boost_expires_idx ON listings(boost_expires_at);

-- 4. Optional: auto-expire boosts via a function + cron
-- Uncomment and schedule with pg_cron (available in Supabase Pro):
-- CREATE OR REPLACE FUNCTION expire_boosts() RETURNS void AS $$
-- BEGIN
--   UPDATE listings SET boosted = false, boost_type = null, boost_score = 0
--   WHERE boosted = true AND boost_expires_at < now();
-- END;
-- $$ LANGUAGE plpgsql;
-- SELECT cron.schedule('expire-boosts', '0 * * * *', 'SELECT expire_boosts()');
