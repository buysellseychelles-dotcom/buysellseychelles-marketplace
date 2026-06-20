-- Supprimer les images liées aux annonces en double
DELETE FROM listing_images
WHERE listing_id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at ASC) AS rn
    FROM listings
    WHERE user_id = 'f65cb17e-0a6a-4dd8-bf68-839212e1c565'
  ) sub
  WHERE rn > 1
);

-- Supprimer les annonces en double (garde la première insérée de chaque titre)
DELETE FROM listings
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at ASC) AS rn
    FROM listings
    WHERE user_id = 'f65cb17e-0a6a-4dd8-bf68-839212e1c565'
  ) sub
  WHERE rn > 1
);

SELECT 'OK — ' || count(*) || ' annonces restantes' AS result
FROM listings
WHERE user_id = 'f65cb17e-0a6a-4dd8-bf68-839212e1c565';
