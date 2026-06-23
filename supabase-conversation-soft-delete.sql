-- ============================================================
-- BuySellSeychelles — Suppression de conversation par utilisateur
-- À exécuter dans le SQL editor de Supabase (sywutvsmoccbmylbocex).
-- Idempotent : peut être ré-exécuté sans danger.
-- ============================================================
--
-- Objectif : permettre à chaque participant de masquer une conversation
-- de SA liste sans la supprimer pour l'autre. La conversation réapparaît
-- pour les deux dès qu'un nouveau message est envoyé.
--
-- Deux drapeaux, un par rôle dans la conversation :
--   • hidden_by_user   → masquée pour conversations.user_id   (l'acheteur)
--   • hidden_by_seller → masquée pour conversations.seller_id (le vendeur)
-- Quand les DEUX sont à true, l'API supprime définitivement la
-- conversation et ses messages (nettoyage).

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS hidden_by_user boolean NOT NULL DEFAULT false;

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS hidden_by_seller boolean NOT NULL DEFAULT false;
