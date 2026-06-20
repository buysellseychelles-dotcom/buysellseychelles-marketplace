const { createClient } = require('@supabase/supabase-js')

const sb = createClient(
  'https://sywutvsmoccbmylbocex.supabase.co',
  'REDACTED_SERVICE_ROLE_KEY'
)

const UID = 'f65cb17e-0a6a-4dd8-bf68-839212e1c565'

const listings = [
  // VOITURE
  {
    title: 'Toyota Hilux Double Cab 2020 — Très bon état',
    description: 'Toyota Hilux 2020 en excellent état, révisions à jour, climatisation, direction assistée. Véhicule importé, dédouané, prêt à immatriculer. Un seul propriétaire non-fumeur. Boîte manuelle 6 vitesses diesel économique. Idéal pour les routes de Mahé, 4x4 engageable.',
    price: 320000, currency: 'SCR', category: 'voiture', location: 'Victoria, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: false, delivery: false,
    make: 'Toyota', model: 'Hilux', year: 2020, mileage: 45000, fuel_type: 'diesel', gearbox: 'manual', condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    ]
  },
  {
    title: 'Honda Civic 2022 — Automatique — Comme neuf',
    description: 'Honda Civic 2022 automatique, 18 000 km, couleur blanche, intérieur cuir. Full options : caméra de recul, écran tactile, Apple CarPlay. Garantie constructeur encore valide. Premier propriétaire, entretien Honda officiel. Vente cause achat véhicule familial.',
    price: 280000, currency: 'SCR', category: 'voiture', location: 'Beau Vallon, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: true, delivery: false,
    make: 'Honda', model: 'Civic', year: 2022, mileage: 18000, fuel_type: 'petrol', gearbox: 'automatic', condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
    ]
  },
  // IMMOBILIER
  {
    title: 'Villa 3 chambres vue mer — Beau Vallon',
    description: 'Magnifique villa de 180m² avec vue imprenable sur la mer à Beau Vallon. 3 chambres avec salle de bain en suite, grande terrasse, piscine privée, jardin tropical. Cuisine entièrement équipée, salon lumineux. Accès plage à 200m. Idéale résidence principale ou investissement locatif touristique. Titre freehold disponible.',
    price: 2500000, currency: 'SCR', category: 'immobilier', location: 'Beau Vallon, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: true, delivery: false,
    property_type: 'villa', bedrooms: 3, bathrooms: 3, area_sqm: 180, furnished: true, tenure: 'freehold',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c7c4fb?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    ]
  },
  {
    title: 'Appartement 2 chambres — Centre Victoria',
    description: 'Bel appartement au coeur de Victoria, 2 chambres, 1 salle de bain, cuisine ouverte sur salon lumineux. Balcon avec vue sur les collines. Résidence sécurisée avec parking. Proche de toutes commodités : marché, banques, hôpital. Parfait pour jeune couple ou investissement locatif. Leasehold 50 ans renouvelable.',
    price: 1200000, currency: 'SCR', category: 'immobilier', location: 'Victoria, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: false, delivery: false,
    property_type: 'apartment', bedrooms: 2, bathrooms: 1, area_sqm: 85, furnished: false, tenure: 'leasehold',
    images: [
      'https://images.unsplash.com/photo-1580587771525-4e32d04ae1da?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    ]
  },
  // ELECTRONIQUE
  {
    title: 'iPhone 15 Pro 256GB — Titane Naturel — Sous garantie',
    description: 'iPhone 15 Pro 256GB en parfait état, sous garantie Apple jusqu en juin 2025. Batterie à 98% de santé. Vendu avec chargeur USB-C original, câble et boîte complète. Jamais tombé, toujours utilisé avec coque. Écran sans rayure. Raison vente : passage au 512GB.',
    price: 15000, currency: 'SCR', category: 'electronique', location: 'Victoria, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: false, delivery: true,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
    ]
  },
  {
    title: 'Samsung TV 65 pouces QLED 4K Smart — 2023',
    description: 'Téléviseur Samsung 65 pouces QLED 4K acheté en 2023, excellent état. Smart TV avec Netflix, Disney+, YouTube intégrés. Son Dolby Atmos, 4 ports HDMI, 2 USB. Télécommande originale incluse. Pied et fixation murale disponibles. Déménagement oblige la vente. Livraison possible sur Mahé.',
    price: 8500, currency: 'SCR', category: 'electronique', location: 'Anse Royale, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: true, price_negotiable: true, delivery: false,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
      'https://images.unsplash.com/photo-1593359677879-a4bb92f4834f?w=800&q=80',
    ]
  },
  // EMPLOI
  {
    title: 'Chef de Cuisine — Resort 5 étoiles Praslin',
    description: 'Resort de luxe à Praslin recrute un Chef de Cuisine expérimenté. Responsable de la direction cuisine, création des menus, gestion des approvisionnements et de équipe. Expérience minimum 5 ans en hôtellerie de luxe requise. Connaissance cuisine créole seychelloise appréciée. Logement et repas inclus. Permis de travail facilité.',
    price: null, currency: 'SCR', category: 'emploi', location: 'Praslin',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: false, delivery: false,
    contract_type: 'full_time', salary: '12000-18000 SCR/mois + avantages',
    images: [
      'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    ]
  },
  {
    title: 'Réceptionniste Bilingue — Hôtel Victoria',
    description: 'Hôtel 4 étoiles à Victoria recherche réceptionniste bilingue anglais et français. Missions : accueil clients internationaux, gestion des réservations, facturation. Formation assurée en interne. Horaires tournants matin et soir. Bonne présentation et sens du service indispensables. Expérience hôtellerie appréciée mais non obligatoire.',
    price: 8000, currency: 'SCR', category: 'emploi', location: 'Victoria, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: false, delivery: false,
    contract_type: 'full_time', salary: '8000 SCR/mois',
    images: [
      'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
    ]
  },
  // SERVICES
  {
    title: 'Plombier Professionnel — Intervention rapide Mahé',
    description: 'Plombier certifié avec 12 ans expérience à Mahé. Interventions : fuites urgentes, installation sanitaires, chauffe-eau solaire ou électrique, tuyauterie. Disponible 7j/7 y compris jours fériés. Intervention en moins de 2h sur Mahé. Devis gratuit et sans engagement. Garantie 1 an sur toutes interventions.',
    price: 500, currency: 'SCR', category: 'services', location: 'Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: true, delivery: false,
    images: [
      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ]
  },
  {
    title: 'Cours Anglais Particuliers — Tous niveaux',
    description: 'Professeur anglais diplômé TESOL propose cours particuliers à domicile ou en ligne. Tous niveaux débutant à avancé. Préparation IELTS et TOEFL. Anglais professionnel spécialisé hôtellerie et tourisme. Cours individuels ou petits groupes max 4. Tarif dégressif à partir de 10 séances. Résultats garantis en 3 mois.',
    price: 300, currency: 'SCR', category: 'services', location: 'Victoria, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: false, delivery: false,
    images: [
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    ]
  },
  // BATEAU
  {
    title: 'Speedboat Yamaha 150cv — 7m — Parfait état',
    description: 'Speedboat 7 mètres avec moteur Yamaha 150cv 4 temps, année 2021. Capacité 8 personnes. Équipé GPS Garmin, radio VHF, extincteur, 8 gilets homologués CE. Parfait pour excursions inter-îles et pêche sportive. Amarré marina Victoria. Logbook complet. Contrôle maritime à jour.',
    price: 280000, currency: 'SCR', category: 'bateau', location: 'Victoria, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: true, delivery: false,
    boat_type: 'speedboat',
    images: [
      'https://images.unsplash.com/photo-1559827291-72a3a8d4e2d9?w=800&q=80',
      'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80',
    ]
  },
  {
    title: 'Catamaran 10 places — Charter ou Vente',
    description: 'Catamaran 12 mètres, 10 places passagers, idéal pour charter touristique ou croisière privée inter-îles. Équipé snorkeling, barbecue inox, système son, toilettes à bord. Licence charter valide jusqu en 2026. Amarré à Praslin. Revenus charter estimés 2500 EUR par semaine en haute saison.',
    price: 1800000, currency: 'SCR', category: 'bateau', location: 'Praslin',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: true, delivery: false,
    boat_type: 'catamaran',
    images: [
      'https://images.unsplash.com/photo-1504944132780-5fd0d72dca8a?w=800&q=80',
      'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80',
    ]
  },
  // TOURISME
  {
    title: 'Villa Vacances Pieds dans l Eau — Praslin',
    description: 'Superbe villa de vacances directement sur la plage Anse Volbert, Praslin. 2 chambres climatisées, grande terrasse vue mer directe, cuisine équipée, WiFi fibre. Accès direct mer cristalline turquoise. À 10 min de Anse Lazio. Disponible à la semaine ou au mois. Idéale couple ou petite famille.',
    price: 5000, currency: 'EUR', category: 'tourisme', location: 'Praslin',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: true, delivery: false,
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
    ]
  },
  {
    title: 'Excursion Anse Source d Argent — La Digue',
    description: 'Journée complète à La Digue avec visite de Anse Source d Argent, élue plus belle plage du monde. Ferry Praslin inclus, vélos, snorkeling aux rochers granitiques, déjeuner créole seychellois inclus. Guide francophone diplômé. Départ 8h, retour 17h. Max 10 personnes. Réservation 48h à avance.',
    price: 1200, currency: 'SCR', category: 'tourisme', location: 'La Digue',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: false, delivery: false,
    images: [
      'https://images.unsplash.com/photo-1483683804023-e1b6eff3a18e?w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    ]
  },
  // MODE
  {
    title: 'Robe de Soirée Longue — Taille S/M — Neuve',
    description: 'Magnifique robe de soirée longue couleur corail nacré, taille S/M (36-38 EU). Jamais portée, étiquette présente. Achetée 350 EUR à Paris. Tissu satiné de qualité, dos nu élégant, légèrement fendue côté. Parfaite pour mariages et soirées de gala. Vente suite changement de programme.',
    price: 1800, currency: 'SCR', category: 'mode', location: 'Victoria, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: true, delivery: true,
    condition: 'new',
    images: [
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
      'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&q=80',
    ]
  },
  {
    title: 'Nike Air Max 270 — Pointure 42 — Boîte originale',
    description: 'Baskets Nike Air Max 270 pointure 42 EU (US 8.5), coloris noir et blanc classique. Neuves dans boîte originale, jamais portées. Achetées à Dubaï. Prix boutique 220 EUR. Légères et très confortables, amorti Air Max à arrière. Idéales sport ou usage quotidien. Expédition possible sur Mahé.',
    price: 1500, currency: 'SCR', category: 'mode', location: 'Mont Fleuri, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: false, delivery: true,
    condition: 'new',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
    ]
  },
  // MAISON
  {
    title: 'Canapé Angle 5 Places Cuir — Gris Anthracite',
    description: 'Canapé angle 5 places en cuir véritable, coloris gris anthracite moderne. Très bon état, foyer sans enfants ni animaux. Dimensions 280cm x 200cm. Coffre de rangement intégré, méridienne réversible. Nettoyage professionnel récent. À retirer sur place uniquement à Anse Royale.',
    price: 4500, currency: 'SCR', category: 'maison', location: 'Anse Royale, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: true, delivery: false,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
    ]
  },
  {
    title: 'Salon de Jardin Teck — Table + 6 Chaises',
    description: 'Salon de jardin en teck naturel certifié FSC : 1 table rectangulaire 200x100cm et 6 chaises avec coussins imperméables gris anthracite. Bois traité résistance humidité tropicale. Vendu avec housse de protection imperméable. Très bon état, entretenu à huile de teck tous les 6 mois.',
    price: 6500, currency: 'SCR', category: 'maison', location: 'Glacis, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: false, delivery: false,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80',
    ]
  },
  // LOISIRS
  {
    title: 'VTT Trek Marlin 7 — 2022 — Taille M',
    description: 'VTT Trek Marlin 7 taille M pour 170 à 180cm, année 2022, coloris bleu Nautical. Cadre aluminium, 29 pouces, 24 vitesses Shimano Deore. Fourche Rock Shox Judy 100mm. Freins hydrauliques Tektro. Environ 800km, parfait état. Idéal pistes VTT Mahé et sentiers Signal Hill.',
    price: 7500, currency: 'SCR', category: 'loisirs', location: 'Beau Vallon, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: true, delivery: false,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80',
      'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800&q=80',
    ]
  },
  {
    title: 'Planche Surf Mousse 8 pieds + Combinaison',
    description: 'Kit surf complet débutant et intermédiaire : planche mousse 8 pieds 2 idéale apprentissage, leash 9 pieds, pad de traction + combinaison shortie 2mm taille L. Parfait pour vagues de Beau Vallon et Grand Anse Mahé. Très bon état. Vendu uniquement ensemble non séparable.',
    price: 3200, currency: 'SCR', category: 'loisirs', location: 'Grand Anse Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: false, delivery: false,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80',
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80',
    ]
  },
  // ANIMAUX
  {
    title: 'Chiots Labrador Retriever — 2 mois — Vaccinés',
    description: 'Portée de chiots Labrador Retriever, 2 mois, vaccinés primo-vaccination et vermifugés. Parents visibles sur place, lignée familiale douce et sociable avec enfants. 4 mâles disponibles : 2 noirs et 2 chocolat. Certificat vétérinaire complet fourni. Remise en main propre uniquement à Mahé.',
    price: 3500, currency: 'SCR', category: 'animaux', location: 'Quatre Bornes, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: false, delivery: false,
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80',
    ]
  },
  {
    title: 'Perroquet Youyou du Sénégal — Apprivoisé',
    description: 'Youyou du Sénégal mâle, 3 ans, très apprivoisé. Parle une vingtaine de mots. Vendu avec grande cage inox 80x60cm, perchoir bois naturel, jouets et 2 mois stock nourriture granulés. Vaccinations à jour, certificat sanitaire CITES inclus. Vente cause déménagement en métropole.',
    price: 4500, currency: 'SCR', category: 'animaux', location: 'Victoria, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: true, price_negotiable: false, delivery: false,
    images: [
      'https://images.unsplash.com/photo-1548199973-ec2cb9df8855?w=800&q=80',
      'https://images.unsplash.com/photo-1612024782955-49fae79b42d5?w=800&q=80',
    ]
  },
  // DONS
  {
    title: 'DON — Livres Scolaires Primaire et Secondaire',
    description: 'Je donne gratuitement une centaine de livres scolaires en bon état. Manuels primaire CP au CM2 et secondaire 6ème à 3ème, en français et anglais. Dictionnaires et encyclopédies inclus. Parfait pour la rentrée scolaire. À venir chercher sur place à Mont Fleuri. Premier arrivé premier servi. Pas de revente.',
    price: 0, currency: 'SCR', category: 'dons', location: 'Mont Fleuri, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: false, delivery: false,
    images: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
    ]
  },
  {
    title: 'DON — Vêtements Enfants 2 à 8 ans — Bon état',
    description: 'Je donne un grand sac de vêtements enfants garçon et fille tailles 2 à 8 ans. Shorts, t-shirts, robes, pantalons, pyjamas. Tous lavés, repassés, très bon état. Quelques jouets et livres images également inclus. Merci de venir chercher uniquement si vous avez réellement besoin. Pas de revente.',
    price: 0, currency: 'SCR', category: 'dons', location: 'Plaisance, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: false, delivery: false,
    images: [
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80',
      'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&q=80',
    ]
  },
  // PRO
  {
    title: 'Compresseur Air Professionnel 100L — 3cv',
    description: 'Compresseur air professionnel 100 litres, moteur 3cv, pression max 10 bars. Marque Michelin Pro Series. Parfait état, révisé il y a 6 mois. Vendu avec 5m tuyau pneumatique, pistolet gonflage et dépoussiérage. Idéal atelier mécanique, menuiserie, carrosserie. Vente cause cessation activité professionnelle.',
    price: 12000, currency: 'SCR', category: 'pro', location: 'Victoria, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: true, price_negotiable: true, delivery: false,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ]
  },
  {
    title: 'Groupe Électrogène Diesel 15 KVA — Silencieux',
    description: 'Groupe électrogène diesel silencieux 15 KVA, marque Kohler Professional, année 2021. Démarrage automatique en cas de coupure secteur. Parfait pour restaurants, hôtels, commerces. Consommation 3 litres par heure à pleine charge. Seulement 450 heures utilisation. Toutes révisions constructeur à jour.',
    price: 45000, currency: 'SCR', category: 'pro', location: 'Anse Royale, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: true, delivery: true,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=800&q=80',
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80',
    ]
  },
  // AUTRE
  {
    title: 'Collection Timbres Seychelles 1970-2000',
    description: 'Belle collection de timbres des Seychelles couvrant 1970 à 2000, incluant premières émissions post-indépendance 1976. Environ 450 timbres en très bon état classés dans album de collection professionnel. Quelques séries complètes rares des années 80. Certificats authenticité pour pièces principales.',
    price: 2500, currency: 'SCR', category: 'autre', location: 'Victoria, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: true, delivery: true,
    images: [
      'https://images.unsplash.com/photo-1541690238-36d5ad8e7e9b?w=800&q=80',
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80',
    ]
  },
  {
    title: 'Appareil Photo Argentique Nikon F3 — Vintage',
    description: 'Nikon F3 argentique professionnel, légendaire boîtier des années 80. Corps excellent état cosmétique, obturateur vérifié et calibré par technicien Nikon certifié. Vendu avec objectif Nikkor 50mm f/1.4 AI-S, sac cuir original, courroie. Fonctionne parfaitement. Idéal passionné photo argentique ou collection.',
    price: 5500, currency: 'SCR', category: 'autre', location: 'Bel Air, Mahé',
    phone: '+248 2 50 00 01', status: 'available', urgent: false, price_negotiable: false, delivery: true,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
      'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=800&q=80',
    ]
  },
]

async function run() {
  let ok = 0
  for (const l of listings) {
    const { images, ...listing } = l
    const { data, error } = await sb
      .from('listings')
      .insert({ ...listing, user_id: UID, rank_score: 0 })
      .select('id')
      .single()

    if (error) {
      console.error('ERR', listing.category, listing.title.substring(0, 40), '-', error.message)
      continue
    }

    for (const url of images) {
      await sb.from('listing_images').insert({ listing_id: data.id, image_url: url })
    }
    console.log('OK', listing.category.padEnd(12), listing.title.substring(0, 45))
    ok++
  }
  console.log(`\nDone: ${ok}/${listings.length} annonces créées`)
}

run()
