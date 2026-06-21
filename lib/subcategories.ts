export type Subcat = {
  value: string
  label_en: string
  label_kr: string
  emoji: string
}

export const SUBCATEGORIES: Record<string, Subcat[]> = {
  voiture: [
    { value: 'voiture',     label_en: 'Cars',                  label_kr: 'Loto',             emoji: '🚗' },
    { value: 'moto',        label_en: 'Motorcycles & Scooters',label_kr: 'Moto & Skuter',    emoji: '🏍️' },
    { value: 'velos',       label_en: 'Bicycles',              label_kr: 'Bisiklet',          emoji: '🚲' },
    { value: 'utilitaire',  label_en: 'Trucks & Vans',         label_kr: 'Kamyon & Van',     emoji: '🚚' },
    { value: 'pieces_auto', label_en: 'Parts & Accessories',   label_kr: 'Pyes & Akseswar',  emoji: '🔩' },
  ],
  immobilier: [
    { value: 'immobilier',        label_en: 'For Sale',         label_kr: 'Lavant',        emoji: '🏠' },
    { value: 'location',          label_en: 'For Rent',         label_kr: 'Lalwe',         emoji: '🔑' },
    { value: 'location_vacances', label_en: 'Vacation Rental',  label_kr: 'Lalwe Vakans',  emoji: '🌴' },
    { value: 'terrain',           label_en: 'Land & Plot',      label_kr: 'Terin',         emoji: '🌿' },
    { value: 'commercial',        label_en: 'Commercial',       label_kr: 'Komersyal',     emoji: '🏢' },
  ],
  electronique: [
    { value: 'telephone',    label_en: 'Phones & Tablets',  label_kr: 'Telefon & Tablet',   emoji: '📱' },
    { value: 'informatique', label_en: 'Computers',          label_kr: 'Ordinater',          emoji: '💻' },
    { value: 'tv_audio',     label_en: 'TV & Audio',         label_kr: 'TV & Son',           emoji: '📺' },
    { value: 'photo_video',  label_en: 'Photo & Video',      label_kr: 'Portre & Video',       emoji: '📷' },
    { value: 'jeux_video',   label_en: 'Video Games',        label_kr: 'Jwet Video',         emoji: '🎮' },
    { value: 'electronique', label_en: 'Other Electronics',  label_kr: 'Lot Elektronik',     emoji: '🔌' },
  ],
  bateau: [
    { value: 'bateau', label_en: 'Motor Boats',  label_kr: 'Bato Moteur', emoji: '🚤' },
    { value: 'bateau', label_en: 'Sailing',      label_kr: 'Lavwal',      emoji: '⛵' },
    { value: 'bateau', label_en: 'Fishing',      label_kr: 'Lapech',      emoji: '🎣' },
    { value: 'bateau', label_en: 'Kayak/Paddle', label_kr: 'Kayak',       emoji: '🛶' },
    { value: 'bateau', label_en: 'Catamaran',    label_kr: 'Katamaran',   emoji: '⛵' },
    { value: 'bateau', label_en: 'Equipment',    label_kr: 'Ekipman',     emoji: '⚓' },
  ],
  emploi: [
    { value: 'emploi',         label_en: 'Job Offers', label_kr: 'Ofert Travay', emoji: '💼' },
    { value: 'emploi_demande', label_en: 'Job Wanted', label_kr: 'Rod Travay',   emoji: '🙋' },
  ],
  services: [
    { value: 'services',          label_en: 'Home Services',      label_kr: 'Servis Kay',         emoji: '🔨' },
    { value: 'cours',             label_en: 'Lessons & Tutoring', label_kr: 'Kour & Leson',       emoji: '📚' },
    { value: 'beaute',            label_en: 'Beauty & Wellness',  label_kr: 'Bote & Byennet',     emoji: '💅' },
    { value: 'transport_service', label_en: 'Transport & Moving', label_kr: 'Transpor',           emoji: '🚌' },
    { value: 'services_pro',      label_en: 'Business Services',  label_kr: 'Servis Pro',         emoji: '💻' },
    { value: 'evenements',        label_en: 'Events',             label_kr: 'Evenman',            emoji: '🎉' },
  ],
  tourisme: [
    { value: 'tourisme',    label_en: 'Tours & Excursions', label_kr: 'Tur & Exkursyon', emoji: '🏝️' },
    { value: 'hebergement', label_en: 'Accommodation',      label_kr: 'Lozisman',        emoji: '🛏️' },
    { value: 'activites',   label_en: 'Activities',         label_kr: 'Aktivite',        emoji: '🤿' },
  ],
  mode: [
    { value: 'mode_femme',  label_en: "Women's Clothing",  label_kr: 'Rad Fanm',      emoji: '👗' },
    { value: 'mode_homme',  label_en: "Men's Clothing",    label_kr: 'Rad Zom',       emoji: '👔' },
    { value: 'mode_enfant', label_en: "Children's",        label_kr: 'Zanfan',        emoji: '🧒' },
    { value: 'chaussures',  label_en: 'Shoes',             label_kr: 'Soulye',        emoji: '👟' },
    { value: 'bijoux',      label_en: 'Jewelry & Watches', label_kr: 'Bijou & Mont',  emoji: '💍' },
    { value: 'mode',        label_en: 'Accessories',       label_kr: 'Akseswar',      emoji: '🧣' },
  ],
  maison: [
    { value: 'ameublement',    label_en: 'Furniture',       label_kr: 'Meble',          emoji: '🛋️' },
    { value: 'electromenager', label_en: 'Appliances',      label_kr: 'Elektromenajer', emoji: '🧺' },
    { value: 'decoration',     label_en: 'Decoration',      label_kr: 'Dekorasyon',     emoji: '🪴' },
    { value: 'bricolage',      label_en: 'DIY & Tools',     label_kr: 'Brikolaz',       emoji: '🔧' },
    { value: 'jardin',         label_en: 'Garden & Plants', label_kr: 'Zardin',         emoji: '🌱' },
    { value: 'maison',         label_en: 'Other Home',      label_kr: 'Lot Kay',        emoji: '🏠' },
  ],
  family: [
    { value: 'baby_equipment',   label_en: 'Baby Equipment',          label_kr: 'Baby Equipment',          emoji: '🍼' },
    { value: 'kids_furniture',   label_en: 'Kids Furniture',          label_kr: 'Kids Furniture',          emoji: '🛏️' },
    { value: 'baby_clothing',    label_en: 'Baby Clothing',           label_kr: 'Baby Clothing',           emoji: '👶' },
    { value: 'kids_clothing',    label_en: 'Kids Clothing',           label_kr: 'Kids Clothing',           emoji: '🧒' },
    { value: 'maternity_wear',   label_en: 'Maternity Wear',          label_kr: 'Maternity Wear',          emoji: '🤰' },
    { value: 'kids_shoes',       label_en: 'Kids Shoes',              label_kr: 'Kids Shoes',              emoji: '👟' },
    { value: 'kids_jewelry',     label_en: 'Kids Watches & Jewelry',  label_kr: 'Kids Watches & Jewelry',  emoji: '⌚' },
    { value: 'kids_accessories', label_en: 'Kids Accessories & Bags', label_kr: 'Kids Accessories & Bags', emoji: '🎒' },
    { value: 'kids_toys',        label_en: 'Games & Toys',            label_kr: 'Games & Toys',            emoji: '🧸' },
    { value: 'babysitting',      label_en: 'Babysitting',             label_kr: 'Babysitting',             emoji: '🧑‍🍼' },
  ],
  loisirs: [
    { value: 'loisirs',     label_en: 'Sports & Fitness',      label_kr: 'Spor & Fitness',    emoji: '⚽' },
    { value: 'musique',     label_en: 'Music & Instruments',   label_kr: 'Mizik & Enstriman', emoji: '🎸' },
    { value: 'livres',      label_en: 'Books & Movies',        label_kr: 'Liv & Film',        emoji: '📚' },
    { value: 'jeux_jouets', label_en: 'Games & Toys',          label_kr: 'Jwet & Jouet',      emoji: '🧸' },
    { value: 'collection',  label_en: 'Hobbies & Collections', label_kr: 'Hobi & Koleksyon',  emoji: '🏆' },
  ],
  animaux: [
    { value: 'chiens',         label_en: 'Dogs',            label_kr: 'Lisyen',          emoji: '🐕' },
    { value: 'chats',          label_en: 'Cats',            label_kr: 'Sa',              emoji: '🐈' },
    { value: 'oiseaux',        label_en: 'Birds',           label_kr: 'Zwezo',           emoji: '🦜' },
    { value: 'poissons',       label_en: 'Fish & Aquarium', label_kr: 'Pwason',          emoji: '🐠' },
    { value: 'autres_animaux', label_en: 'Other Animals',   label_kr: 'Lot Zanimo',      emoji: '🐾' },
    { value: 'animaux',        label_en: 'Pet Accessories', label_kr: 'Akseswar Zanimo', emoji: '🦴' },
  ],
  dons: [
    { value: 'dons', label_en: 'Free Items',        label_kr: 'Gratis', emoji: '🎁' },
    { value: 'troc', label_en: 'Exchange / Barter', label_kr: 'Eferan', emoji: '🔄' },
  ],
  pro: [
    { value: 'pro', label_en: 'Office Equipment',    label_kr: 'Birow',          emoji: '🖨️' },
    { value: 'pro', label_en: 'Restaurant / Hotel',  label_kr: 'Restoran/Otel',  emoji: '🍽️' },
    { value: 'pro', label_en: 'Construction Tools',  label_kr: 'Zouti Konstrik', emoji: '🏗️' },
    { value: 'pro', label_en: 'Industrial',          label_kr: 'Indistryèl',     emoji: '🏭' },
    { value: 'pro', label_en: 'Medical',             label_kr: 'Medikal',        emoji: '🏥' },
    { value: 'pro', label_en: 'Agriculture',         label_kr: 'Agrikilti',      emoji: '🌾' },
  ],
  autre: [
    { value: 'autre', label_en: 'Miscellaneous', label_kr: 'Divèr', emoji: '📦' },
  ],
}

export const CATEGORY_META: Record<string, {
  label_en: string; label_kr: string; textColor: string; bg: string; border?: string
}> = {
  voiture:      { label_en: 'Vehicles',         label_kr: 'Transpor',    textColor: '#fff',    bg: '#003F87' },
  immobilier:   { label_en: 'Real Estate',       label_kr: 'Propriete',   textColor: '#1a1a1a', bg: '#FCD116' },
  electronique: { label_en: 'Electronics',       label_kr: 'Elektronik',  textColor: '#fff',    bg: '#BE0027' },
  bateau:       { label_en: 'Boats',             label_kr: 'Bato',        textColor: '#333',    bg: '#FFFFFF', border: '#d1d5db' },
  emploi:       { label_en: 'Jobs',              label_kr: 'Travay',      textColor: '#fff',    bg: '#d97706' },
  services:     { label_en: 'Services',          label_kr: 'Servis',      textColor: '#fff',    bg: '#7c3aed' },
  tourisme:     { label_en: 'Tourism',           label_kr: 'Tourizm',     textColor: '#fff',    bg: '#059669' },
  mode:         { label_en: 'Fashion',           label_kr: 'Mod',         textColor: '#fff',    bg: '#db2777' },
  family:       { label_en: 'Family',            label_kr: 'Fanmiy',      textColor: '#fff',    bg: '#0d9488' },
  maison:       { label_en: 'Home & Garden',     label_kr: 'Lakaz',       textColor: '#fff',    bg: '#ea580c' },
  loisirs:      { label_en: 'Sports & Leisure',  label_kr: 'Spor/Lwazip', textColor: '#fff',    bg: '#0284c7' },
  animaux:      { label_en: 'Pets & Animals',    label_kr: 'Zanimo',      textColor: '#fff',    bg: '#92400e' },
  dons:         { label_en: 'Free & Exchange',   label_kr: 'Gratis',      textColor: '#fff',    bg: '#15803d' },
  pro:          { label_en: 'Pro Equipment',     label_kr: 'Ekipman Pro', textColor: '#fff',    bg: '#374151' },
  autre:        { label_en: 'Other',             label_kr: 'Lot',         textColor: '#fff',    bg: '#4b5563' },
}
