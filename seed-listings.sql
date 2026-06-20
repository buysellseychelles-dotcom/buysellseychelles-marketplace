-- Désactiver uniquement les triggers utilisateur (pas les contraintes FK système)
ALTER TABLE listings DISABLE TRIGGER USER;

-- Insérer les 28 annonces de test
WITH inserted AS (
  INSERT INTO listings (user_id, title, description, price, currency, category, location, phone, status, urgent, price_negotiable, delivery, rank_score, make, model, year, mileage, fuel_type, gearbox, condition, property_type, bedrooms, bathrooms, area_sqm, furnished, tenure, contract_type, salary, boat_type)
  VALUES

  -- VOITURE 1
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Toyota Hilux Double Cab 2020 — Très bon état','Toyota Hilux 2020 en excellent état, révisions à jour, climatisation, direction assistée. Véhicule importé, dédouané, prêt à immatriculer. Un seul propriétaire non-fumeur. Boîte manuelle 6 vitesses diesel économique. Idéal pour les routes de Mahé, 4x4 engageable.',320000,'SCR','voiture','Victoria, Mahé','+248 2 50 00 01','available',false,false,false,0,'Toyota','Hilux',2020,45000,'diesel','manual','used',null,null,null,null,null,null,null,null,null),

  -- VOITURE 2
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Honda Civic 2022 — Automatique — Comme neuf','Honda Civic 2022 automatique, 18 000 km, couleur blanche, intérieur cuir. Full options : caméra de recul, écran tactile, Apple CarPlay. Garantie constructeur encore valide. Premier propriétaire, entretien Honda officiel.',280000,'SCR','voiture','Beau Vallon, Mahé','+248 2 50 00 01','available',false,true,false,0,'Honda','Civic',2022,18000,'petrol','automatic','used',null,null,null,null,null,null,null,null,null),

  -- IMMOBILIER 1
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Villa 3 chambres vue mer — Beau Vallon','Magnifique villa de 180m² avec vue imprenable sur la mer à Beau Vallon. 3 chambres avec salle de bain en suite, grande terrasse, piscine privée, jardin tropical. Cuisine équipée, salon lumineux. Accès plage à 200m. Titre freehold disponible.',2500000,'SCR','immobilier','Beau Vallon, Mahé','+248 2 50 00 01','available',false,true,false,0,null,null,null,null,null,null,null,'villa',3,3,180,true,'freehold',null,null,null),

  -- IMMOBILIER 2
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Appartement 2 chambres — Centre Victoria','Bel appartement au coeur de Victoria, 2 chambres, 1 salle de bain, cuisine ouverte sur salon lumineux. Balcon avec vue sur les collines. Résidence sécurisée avec parking. Proche marché, banques, hôpital. Leasehold 50 ans renouvelable.',1200000,'SCR','immobilier','Victoria, Mahé','+248 2 50 00 01','available',false,false,false,0,null,null,null,null,null,null,null,'apartment',2,1,85,false,'leasehold',null,null,null),

  -- ELECTRONIQUE 1
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','iPhone 15 Pro 256GB — Titane Naturel — Sous garantie','iPhone 15 Pro 256GB en parfait état, sous garantie Apple juin 2025. Batterie 98% de santé. Vendu avec chargeur USB-C original, câble et boîte complète. Jamais tombé, toujours avec coque. Écran sans rayure.',15000,'SCR','electronique','Victoria, Mahé','+248 2 50 00 01','available',false,false,true,0,null,null,null,null,null,null,'used',null,null,null,null,null,null,null,null,null),

  -- ELECTRONIQUE 2
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Samsung TV 65 pouces QLED 4K Smart — 2023','Téléviseur Samsung 65 pouces QLED 4K, 2023, excellent état. Smart TV Netflix, Disney+, YouTube. Dolby Atmos, 4 ports HDMI. Télécommande originale et solaire incluses. Pied et fixation murale disponibles. Déménagement oblige.',8500,'SCR','electronique','Anse Royale, Mahé','+248 2 50 00 01','available',true,true,false,0,null,null,null,null,null,null,'used',null,null,null,null,null,null,null,null,null),

  -- EMPLOI 1
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Chef de Cuisine — Resort 5 étoiles Praslin','Resort de luxe à Praslin recrute Chef de Cuisine expérimenté. Responsable direction cuisine, création menus, gestion équipe. Minimum 5 ans expérience hôtellerie de luxe. Connaissance cuisine créole seychelloise appréciée. Logement et repas inclus.',null,'SCR','emploi','Praslin','+248 2 50 00 01','available',false,false,false,0,null,null,null,null,null,null,null,null,null,null,null,null,null,'full_time','12000-18000 SCR/mois',null),

  -- EMPLOI 2
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Réceptionniste Bilingue — Hôtel Victoria','Hôtel 4 étoiles à Victoria recherche réceptionniste bilingue anglais et français. Accueil clients internationaux, gestion réservations, facturation. Formation assurée. Horaires tournants matin et soir. Bonne présentation indispensable.',8000,'SCR','emploi','Victoria, Mahé','+248 2 50 00 01','available',false,false,false,0,null,null,null,null,null,null,null,null,null,null,null,null,null,'full_time','8000 SCR/mois',null),

  -- SERVICES 1
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Plombier Professionnel — Intervention rapide Mahé','Plombier certifié 12 ans expérience à Mahé. Fuites urgentes, installation sanitaires, chauffe-eau solaire ou électrique. Disponible 7j/7. Intervention en moins de 2h. Devis gratuit. Garantie 1 an sur toutes interventions.',500,'SCR','services','Mahé','+248 2 50 00 01','available',false,true,false,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null),

  -- SERVICES 2
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Cours Anglais Particuliers — Tous niveaux','Professeur anglais diplômé TESOL, cours particuliers à domicile ou en ligne. Tous niveaux débutant à avancé. Préparation IELTS et TOEFL. Anglais professionnel hôtellerie et tourisme. Petits groupes max 4. Résultats garantis en 3 mois.',300,'SCR','services','Victoria, Mahé','+248 2 50 00 01','available',false,false,false,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null),

  -- BATEAU 1
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Speedboat Yamaha 150cv — 7m — Parfait état','Speedboat 7 mètres, moteur Yamaha 150cv 4 temps 2021. Capacité 8 personnes. GPS Garmin, radio VHF, extincteur, 8 gilets homologués CE. Parfait excursions inter-îles et pêche sportive. Amarré marina Victoria. Contrôle maritime à jour.',280000,'SCR','bateau','Victoria, Mahé','+248 2 50 00 01','available',false,true,false,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,'speedboat'),

  -- BATEAU 2
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Catamaran 10 places — Charter ou Vente','Catamaran 12 mètres, 10 places passagers. Snorkeling, barbecue inox, système son, toilettes à bord. Licence charter valide jusqu en 2026. Amarré à Praslin. Revenus charter estimés 2500 EUR par semaine en haute saison.',1800000,'SCR','bateau','Praslin','+248 2 50 00 01','available',false,true,false,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,'catamaran'),

  -- TOURISME 1
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Villa Vacances Pieds dans l''Eau — Praslin','Villa de vacances directement sur la plage Anse Volbert, Praslin. 2 chambres climatisées, grande terrasse vue mer, cuisine équipée, WiFi fibre. Accès direct mer cristalline turquoise. À 10 min de Anse Lazio. Location à la semaine ou au mois.',5000,'EUR','tourisme','Praslin','+248 2 50 00 01','available',false,true,false,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null),

  -- TOURISME 2
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Excursion Anse Source d''Argent — La Digue','Journée complète à La Digue, visite Anse Source d''Argent (plus belle plage du monde). Ferry Praslin inclus, vélos, snorkeling, déjeuner créole seychellois inclus. Guide francophone diplômé. Départ 8h, retour 17h. Max 10 personnes.',1200,'SCR','tourisme','La Digue','+248 2 50 00 01','available',false,false,false,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null),

  -- MODE 1
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Robe de Soirée Longue — Taille S/M — Neuve','Robe de soirée longue couleur corail nacré, taille S/M (36-38 EU). Jamais portée, étiquette présente. Achetée 350 EUR à Paris. Tissu satiné, dos nu élégant, légèrement fendue côté. Parfaite pour mariages et soirées de gala.',1800,'SCR','mode','Victoria, Mahé','+248 2 50 00 01','available',false,true,true,0,null,null,null,null,null,null,'new',null,null,null,null,null,null,null,null,null),

  -- MODE 2
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Nike Air Max 270 — Pointure 42 — Boîte originale','Baskets Nike Air Max 270 pointure 42 EU, coloris noir et blanc classique. Neuves dans boîte originale, jamais portées. Achetées à Dubaï. Prix boutique 220 EUR. Légères et très confortables, amorti Air Max à l''arrière.',1500,'SCR','mode','Mont Fleuri, Mahé','+248 2 50 00 01','available',false,false,true,0,null,null,null,null,null,null,'new',null,null,null,null,null,null,null,null,null),

  -- MAISON 1
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Canapé Angle 5 Places Cuir — Gris Anthracite','Canapé angle 5 places cuir véritable gris anthracite. Très bon état, foyer sans enfants ni animaux. Dimensions 280x200cm. Coffre de rangement intégré, méridienne réversible. Nettoyage professionnel récent. À retirer sur place Anse Royale.',4500,'SCR','maison','Anse Royale, Mahé','+248 2 50 00 01','available',false,true,false,0,null,null,null,null,null,null,'used',null,null,null,null,null,null,null,null,null),

  -- MAISON 2
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Salon de Jardin Teck — Table + 6 Chaises','Salon de jardin teck naturel certifié FSC : table rectangulaire 200x100cm et 6 chaises avec coussins imperméables gris anthracite. Bois traité résistance humidité tropicale. Très bon état, entretenu à huile de teck tous les 6 mois.',6500,'SCR','maison','Glacis, Mahé','+248 2 50 00 01','available',false,false,false,0,null,null,null,null,null,null,'used',null,null,null,null,null,null,null,null,null),

  -- LOISIRS 1
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','VTT Trek Marlin 7 — 2022 — Taille M','VTT Trek Marlin 7 taille M pour 170 à 180cm, 2022, coloris bleu Nautical. Cadre aluminium, 29 pouces, 24 vitesses Shimano Deore. Fourche Rock Shox Judy 100mm. Freins hydrauliques Tektro. Environ 800km, parfait état.',7500,'SCR','loisirs','Beau Vallon, Mahé','+248 2 50 00 01','available',false,true,false,0,null,null,null,null,null,null,'used',null,null,null,null,null,null,null,null,null),

  -- LOISIRS 2
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Planche Surf Mousse 8 pieds + Combinaison','Kit surf complet : planche mousse 8 pieds 2, leash 9 pieds, pad de traction + combinaison shortie 2mm taille L. Parfait pour vagues de Beau Vallon et Grand Anse Mahé. Très bon état. Vendu uniquement ensemble.',3200,'SCR','loisirs','Grand Anse Mahé','+248 2 50 00 01','available',false,false,false,0,null,null,null,null,null,null,'used',null,null,null,null,null,null,null,null,null),

  -- ANIMAUX 1
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Chiots Labrador Retriever — 2 mois — Vaccinés','Portée de chiots Labrador Retriever, 2 mois, vaccinés et vermifugés. Parents visibles sur place, lignée familiale douce et sociable avec enfants. 4 mâles disponibles : 2 noirs et 2 chocolat. Certificat vétérinaire fourni.',3500,'SCR','animaux','Quatre Bornes, Mahé','+248 2 50 00 01','available',false,false,false,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null),

  -- ANIMAUX 2
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Perroquet Youyou du Sénégal — Apprivoisé','Youyou du Sénégal mâle, 3 ans, très apprivoisé. Parle une vingtaine de mots. Vendu avec grande cage inox 80x60cm, perchoir bois, jouets et 2 mois stock nourriture. Vaccinations à jour, certificat CITES inclus. Vente cause déménagement.',4500,'SCR','animaux','Victoria, Mahé','+248 2 50 00 01','available',true,false,false,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null),

  -- DONS 1
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','DON — Livres Scolaires Primaire et Secondaire','Je donne gratuitement une centaine de livres scolaires en bon état. Manuels primaire CP au CM2 et secondaire 6ème à 3ème, français et anglais. Dictionnaires et encyclopédies inclus. À venir chercher à Mont Fleuri. Premier arrivé premier servi.',0,'SCR','dons','Mont Fleuri, Mahé','+248 2 50 00 01','available',false,false,false,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null),

  -- DONS 2
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','DON — Vêtements Enfants 2 à 8 ans — Bon état','Je donne un grand sac de vêtements enfants garçon et fille tailles 2 à 8 ans. Shorts, t-shirts, robes, pantalons, pyjamas. Tous lavés, repassés, très bon état. Quelques jouets inclus. Pas de revente.',0,'SCR','dons','Plaisance, Mahé','+248 2 50 00 01','available',false,false,false,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null),

  -- PRO 1
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Compresseur Air Professionnel 100L — 3cv','Compresseur air professionnel 100 litres, moteur 3cv, pression max 10 bars. Marque Michelin Pro Series. Parfait état, révisé il y a 6 mois. Avec tuyau pneumatique 5m, pistolet gonflage et dépoussiérage. Vente cause cessation activité.',12000,'SCR','pro','Victoria, Mahé','+248 2 50 00 01','available',true,true,false,0,null,null,null,null,null,null,'used',null,null,null,null,null,null,null,null,null),

  -- PRO 2
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Groupe Électrogène Diesel 15 KVA — Silencieux','Groupe électrogène diesel silencieux 15 KVA, Kohler Professional, 2021. Démarrage automatique sur coupure secteur. Parfait pour restaurants, hôtels, commerces. 3 litres par heure à pleine charge. Seulement 450 heures utilisation. Révisions à jour.',45000,'SCR','pro','Anse Royale, Mahé','+248 2 50 00 01','available',false,true,true,0,null,null,null,null,null,null,'used',null,null,null,null,null,null,null,null,null),

  -- AUTRE 1
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Collection Timbres Seychelles 1970-2000','Belle collection de timbres Seychelles 1970 à 2000, incluant premières émissions post-indépendance 1976. Environ 450 timbres classés dans album professionnel. Quelques séries complètes rares années 80. Certificats authenticité pour pièces principales.',2500,'SCR','autre','Victoria, Mahé','+248 2 50 00 01','available',false,true,true,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null),

  -- AUTRE 2
  ('f65cb17e-0a6a-4dd8-bf68-839212e1c565','Appareil Photo Argentique Nikon F3 — Vintage','Nikon F3 argentique professionnel, légendaire boîtier des années 80. Corps excellent état, obturateur vérifié et calibré par technicien certifié. Vendu avec Nikkor 50mm f/1.4 AI-S, sac cuir original, courroie. Fonctionne parfaitement.',5500,'SCR','autre','Bel Air, Mahé','+248 2 50 00 01','available',false,false,true,0,null,null,null,null,null,null,'used',null,null,null,null,null,null,null,null,null)

  RETURNING id, title, category
)
SELECT * FROM inserted;

-- Réactiver les triggers utilisateur
ALTER TABLE listings ENABLE TRIGGER USER;

-- Maintenant insérer les images
-- (récupère les IDs insérés pour les images)
DO $$
DECLARE
  ids uuid[];
  listing_id uuid;
BEGIN
  SELECT array_agg(id ORDER BY created_at) INTO ids FROM listings WHERE user_id = 'f65cb17e-0a6a-4dd8-bf68-839212e1c565';

  -- Voiture 1
  listing_id := ids[1];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80');

  -- Voiture 2
  listing_id := ids[2];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80');

  -- Immobilier 1
  listing_id := ids[3];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1512917774080-9991f1c7c4fb?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80');

  -- Immobilier 2
  listing_id := ids[4];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1580587771525-4e32d04ae1da?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80');

  -- Electronique 1
  listing_id := ids[5];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80');

  -- Electronique 2
  listing_id := ids[6];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834f?w=800&q=80');

  -- Emploi 1
  listing_id := ids[7];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80');

  -- Emploi 2
  listing_id := ids[8];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80');

  -- Services 1
  listing_id := ids[9];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80');

  -- Services 2
  listing_id := ids[10];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80');

  -- Bateau 1
  listing_id := ids[11];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1559827291-72a3a8d4e2d9?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80');

  -- Bateau 2
  listing_id := ids[12];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1504944132780-5fd0d72dca8a?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80');

  -- Tourisme 1
  listing_id := ids[13];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80');

  -- Tourisme 2
  listing_id := ids[14];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1483683804023-e1b6eff3a18e?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80');

  -- Mode 1
  listing_id := ids[15];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&q=80');

  -- Mode 2
  listing_id := ids[16];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80');

  -- Maison 1
  listing_id := ids[17];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80');

  -- Maison 2
  listing_id := ids[18];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80');

  -- Loisirs 1
  listing_id := ids[19];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800&q=80');

  -- Loisirs 2
  listing_id := ids[20];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80');

  -- Animaux 1
  listing_id := ids[21];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80');

  -- Animaux 2
  listing_id := ids[22];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1548199973-ec2cb9df8855?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1612024782955-49fae79b42d5?w=800&q=80');

  -- Dons 1
  listing_id := ids[23];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80');

  -- Dons 2
  listing_id := ids[24];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&q=80');

  -- Pro 1
  listing_id := ids[25];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80');

  -- Pro 2
  listing_id := ids[26];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80');

  -- Autre 1
  listing_id := ids[27];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1541690238-36d5ad8e7e9b?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80');

  -- Autre 2
  listing_id := ids[28];
  INSERT INTO listing_images (listing_id, image_url) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'),
    (listing_id, 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=800&q=80');

END $$;

SELECT 'OK — ' || count(*) || ' annonces créées avec images' as result FROM listings WHERE user_id = 'f65cb17e-0a6a-4dd8-bf68-839212e1c565';
