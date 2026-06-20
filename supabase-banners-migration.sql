-- ============================================================
-- BuySellSeychelles — Self-serve banner ads (script complet)
-- À exécuter dans Supabase → SQL Editor
-- Idempotent : relançable sans erreur.
-- ============================================================

-- 1. Table sponsored_banners (créée seulement si absente)
CREATE TABLE IF NOT EXISTS sponsored_banners (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title         text NOT NULL,
  subtitle      text,
  business_name text,
  image_url     text,
  link_url      text NOT NULL,
  link_label    text DEFAULT 'Learn more',
  active        boolean DEFAULT false,
  starts_at     timestamptz,
  ends_at       timestamptz,
  created_at    timestamptz DEFAULT now()
);

-- 2. Colonnes pour le flux client payant (ajoutées si absentes)
ALTER TABLE sponsored_banners
  ADD COLUMN IF NOT EXISTS user_id           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS stripe_session_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS source            text DEFAULT 'admin'; -- 'admin' | 'client_paid'

-- 3. Index pour compter les bannières clients actives (max 5)
CREATE INDEX IF NOT EXISTS sponsored_banners_active_idx
  ON sponsored_banners(source, active, ends_at);

-- 4. Bucket de stockage public pour les images de bannières
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Row-Level Security
ALTER TABLE sponsored_banners ENABLE ROW LEVEL SECURITY;

-- Lecture publique (la page d'accueil lit avec la clé anon)
DROP POLICY IF EXISTS "Public read banners" ON sponsored_banners;
CREATE POLICY "Public read banners"
  ON sponsored_banners FOR SELECT
  USING (true);

-- Écriture par utilisateurs connectés (page /admin/banners)
DROP POLICY IF EXISTS "Authenticated manage banners" ON sponsored_banners;
CREATE POLICY "Authenticated manage banners"
  ON sponsored_banners FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Le webhook Stripe utilise la service_role → contourne déjà la RLS.

-- ============================================================
-- Notes :
-- • Une bannière "client" = ligne avec source = 'client_paid'.
-- • La home affiche au plus 5 bannières actives
--   (active = true AND ends_at dans le futur) + le slide
--   "Advertise your business here" = 6 au total.
-- • Les bannières disparaissent seules une fois ends_at passé —
--   aucun cron requis, la requête home filtre déjà sur ends_at.
-- ============================================================
