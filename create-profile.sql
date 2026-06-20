-- Créer le profil pour l'utilisateur de test buysellseychelles@gmail.com
INSERT INTO profiles (id, full_name, island, bio, verified, is_pro, created_at)
VALUES (
  'f65cb17e-0a6a-4dd8-bf68-839212e1c565',
  'BuySellSeychelles',
  'Mahé',
  'Official test account for BuySellSeychelles marketplace.',
  true,
  false,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  island    = EXCLUDED.island,
  bio       = EXCLUDED.bio;

SELECT 'OK — profil créé' AS result;
