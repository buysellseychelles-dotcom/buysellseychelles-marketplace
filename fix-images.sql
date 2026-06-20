-- Remplacer les 7 URLs Unsplash cassées (404)

-- Bateau 1 (Speedboat) — image 1 cassée
UPDATE listing_images SET image_url = 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80'
WHERE image_url = 'https://images.unsplash.com/photo-1559827291-72a3a8d4e2d9?w=800&q=80';

-- Bateau 2 (Catamaran) — image 1 cassée
UPDATE listing_images SET image_url = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80'
WHERE image_url = 'https://images.unsplash.com/photo-1504944132780-5fd0d72dca8a?w=800&q=80';

-- Immobilier Villa — image 2 cassée
UPDATE listing_images SET image_url = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'
WHERE image_url = 'https://images.unsplash.com/photo-1512917774080-9991f1c7c4fb?w=800&q=80';

-- Immobilier Appartement — image 1 cassée
UPDATE listing_images SET image_url = 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'
WHERE image_url = 'https://images.unsplash.com/photo-1580587771525-4e32d04ae1da?w=800&q=80';

-- Animaux Perroquet — image 1 cassée
UPDATE listing_images SET image_url = 'https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=800&q=80'
WHERE image_url = 'https://images.unsplash.com/photo-1548199973-ec2cb9df8855?w=800&q=80';

-- Animaux Perroquet — image 2 cassée
UPDATE listing_images SET image_url = 'https://images.unsplash.com/photo-1570018144715-43110363d70a?w=800&q=80'
WHERE image_url = 'https://images.unsplash.com/photo-1612024782955-49fae79b42d5?w=800&q=80';

-- Tourisme Excursion — image 1 cassée
UPDATE listing_images SET image_url = 'https://images.unsplash.com/photo-1544551763-92ab472cad5d?w=800&q=80'
WHERE image_url = 'https://images.unsplash.com/photo-1483683804023-e1b6eff3a18e?w=800&q=80';

SELECT 'OK — images mises à jour' as result;
