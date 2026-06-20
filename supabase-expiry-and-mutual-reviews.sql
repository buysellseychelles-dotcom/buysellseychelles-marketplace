-- ============================================================
-- BuySellSeychelles — Expiration auto (60j) + Évaluations mutuelles
-- À exécuter dans le SQL editor de Supabase (sywutvsmoccbmylbocex).
-- Idempotent : peut être ré-exécuté sans danger.
-- ============================================================

-- ── 1. Expiration automatique des annonces (60 jours) ─────────

-- Garantit que toute nouvelle annonce expire 60 jours après sa
-- création, même si le client n'envoie pas expires_at.
ALTER TABLE listings
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '60 days');

-- Backfill : les annonces actives sans date d'expiration repartent
-- pour 60 jours à compter de maintenant.
UPDATE listings
  SET expires_at = now() + interval '60 days'
  WHERE expires_at IS NULL
    AND status NOT IN ('sold', 'expired');

-- Drapeau « 7 jours avant » : la colonne renewal_email_sent existe déjà.
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS renewal_email_sent boolean DEFAULT false;

-- Drapeau « jour J » : évite d'envoyer deux fois l'avis final.
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS final_notice_sent boolean DEFAULT false;

-- ── 2. Transactions : qui a acheté quoi ───────────────────────

-- Acheteur enregistré quand le vendeur clique « ✓ Sold » dans le chat
-- (= l'autre participant de la conversation).
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS buyer_id uuid REFERENCES auth.users(id);

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS sold_at timestamptz;

-- ── 3. Évaluations mutuelles acheteur ↔ vendeur ───────────────
-- La table `reviews` existe déjà :
--   (reviewer_id, seller_id, listing_id, rating, comment)
--   UNIQUE (reviewer_id, seller_id, listing_id)
-- `seller_id` est traité comme « l'utilisateur noté » : il peut donc
-- s'agir d'un acheteur quand c'est le vendeur qui laisse l'avis.

-- Rôle du correspondant qui a laissé l'avis : 'buyer' ou 'seller'.
-- Permet d'afficher « Acheteur vérifié » / « Vendeur vérifié ».
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS reviewer_role text;

-- Marque les avis issus d'une transaction réelle (clic « Sold »).
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS verified_transaction boolean DEFAULT false;
