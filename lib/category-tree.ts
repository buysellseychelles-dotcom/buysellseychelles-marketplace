export type SubCat = {
  value: string
  en: string
  kr: string
}

export type TopCat = {
  id: string
  icon: string
  en: string
  kr: string
  subs: SubCat[]
}

export const CATEGORY_TREE: TopCat[] = [
  {
    id: 'vehicules',
    icon: '🚗',
    en: 'Vehicles',
    kr: 'Transpor',
    subs: [
      { value: 'voiture',     en: 'Cars',                  kr: 'Vwati' },
      { value: 'moto',        en: 'Motorcycles & Scooters', kr: 'Moto & Skuter' },
      { value: 'velos',       en: 'Bicycles',              kr: 'Velo' },
      { value: 'bateau',      en: 'Boats',                 kr: 'Bato' },
      { value: 'utilitaire',  en: 'Trucks & Vans',         kr: 'Kamyon & Van' },
      { value: 'pieces_auto', en: 'Parts & Accessories',   kr: 'Pyes & Akseswar' },
    ],
  },
  {
    id: 'immobilier_group',
    icon: '🏡',
    en: 'Real Estate',
    kr: 'Imobilye',
    subs: [
      { value: 'immobilier',         en: 'For Sale',          kr: 'Lavant' },
      { value: 'location',           en: 'For Rent',          kr: 'Lalwe' },
      { value: 'location_vacances',  en: 'Vacation Rental',   kr: 'Lalwe Vakans' },
      { value: 'terrain',            en: 'Land & Plot',       kr: 'Teren' },
      { value: 'commercial',         en: 'Commercial',        kr: 'Komersyal' },
    ],
  },
  {
    id: 'electronique_group',
    icon: '📱',
    en: 'Electronics',
    kr: 'Elektronik',
    subs: [
      { value: 'telephone',    en: 'Phones & Tablets',  kr: 'Telefon & Tablet' },
      { value: 'informatique', en: 'Computers',         kr: 'Ordinater' },
      { value: 'tv_audio',     en: 'TV, Audio & Video', kr: 'TV & Son' },
      { value: 'photo_video',  en: 'Photo & Video',     kr: 'Portre & Video' },
      { value: 'jeux_video',   en: 'Video Games',       kr: 'Jwet Video' },
      { value: 'electronique', en: 'Other Electronics', kr: 'Lot Elektronik' },
    ],
  },
  {
    id: 'maison_group',
    icon: '🛋️',
    en: 'Home & Garden',
    kr: 'Lakaz & Zarden',
    subs: [
      { value: 'ameublement',   en: 'Furniture',       kr: 'Meble' },
      { value: 'electromenager',en: 'Appliances',      kr: 'Elektromenajer' },
      { value: 'decoration',    en: 'Decoration',      kr: 'Dekorasyon' },
      { value: 'bricolage',     en: 'DIY & Tools',     kr: 'Brikolaz & Zouti' },
      { value: 'jardin',        en: 'Garden & Plants', kr: 'Zardin & Plant' },
      { value: 'maison',        en: 'Other Home',      kr: 'Lot Kay' },
    ],
  },
  {
    id: 'mode_group',
    icon: '👗',
    en: 'Fashion',
    kr: 'Lanmod',
    subs: [
      { value: 'mode_femme',  en: "Women's Clothing", kr: 'Rad Fanm' },
      { value: 'mode_homme',  en: "Men's Clothing",   kr: 'Rad Zom' },
      { value: 'mode_enfant', en: "Children's",       kr: 'Zanfan' },
      { value: 'chaussures',  en: 'Shoes',            kr: 'Soulye' },
      { value: 'bijoux',      en: 'Jewelry & Watches',kr: 'Bijou & Mont' },
      { value: 'mode',        en: 'Accessories',      kr: 'Akseswar' },
    ],
  },
  {
    id: 'family_group',
    icon: '🧸',
    en: 'Family',
    kr: 'Fanmiy',
    // Sub-categories are English-only (no Creole translation): kr mirrors en.
    subs: [
      { value: 'baby_equipment',  en: 'Baby Equipment',          kr: 'Baby Equipment' },
      { value: 'kids_furniture',  en: 'Kids Furniture',          kr: 'Kids Furniture' },
      { value: 'baby_clothing',   en: 'Baby Clothing',           kr: 'Baby Clothing' },
      { value: 'kids_clothing',   en: 'Kids Clothing',           kr: 'Kids Clothing' },
      { value: 'maternity_wear',  en: 'Maternity Wear',          kr: 'Maternity Wear' },
      { value: 'kids_shoes',      en: 'Kids Shoes',              kr: 'Kids Shoes' },
      { value: 'kids_jewelry',    en: 'Kids Watches & Jewelry',  kr: 'Kids Watches & Jewelry' },
      { value: 'kids_accessories',en: 'Kids Accessories & Bags', kr: 'Kids Accessories & Bags' },
      { value: 'kids_toys',       en: 'Games & Toys',            kr: 'Games & Toys' },
      { value: 'babysitting',     en: 'Babysitting',             kr: 'Babysitting' },
    ],
  },
  {
    id: 'emploi_group',
    icon: '💼',
    en: 'Jobs',
    kr: 'Travay',
    subs: [
      { value: 'emploi',         en: 'Job Offers',  kr: 'Ofert Travay' },
      { value: 'emploi_demande', en: 'Job Wanted',  kr: 'Rod Travay' },
    ],
  },
  {
    id: 'services_group',
    icon: '🔧',
    en: 'Services',
    kr: 'Servis',
    subs: [
      { value: 'services',          en: 'Home Services',     kr: 'Servis Kay' },
      { value: 'cours',             en: 'Lessons & Tutoring',kr: 'Kour & Leson' },
      { value: 'beaute',            en: 'Beauty & Wellness', kr: 'Bote & Byennet' },
      { value: 'transport_service', en: 'Transport & Moving',kr: 'Transpor & Demennaz' },
      { value: 'services_pro',      en: 'Business Services', kr: 'Servis Pro' },
      { value: 'evenements',        en: 'Events',            kr: 'Evenman' },
    ],
  },
  {
    id: 'loisirs_group',
    icon: '⚽',
    en: 'Sports & Leisure',
    kr: 'Spor & Lwazir',
    subs: [
      { value: 'loisirs',    en: 'Sports & Fitness',       kr: 'Spor & Fitness' },
      { value: 'musique',    en: 'Music & Instruments',    kr: 'Mizik & Enstriman' },
      { value: 'livres',     en: 'Books, Movies & Music',  kr: 'Liv, Film & Mizik' },
      { value: 'jeux_jouets',en: 'Games & Toys',           kr: 'Jwet & Jouet' },
      { value: 'collection', en: 'Hobbies & Collections',  kr: 'Hobi & Koleksyon' },
    ],
  },
  {
    id: 'animaux_group',
    icon: '🐾',
    en: 'Pets & Animals',
    kr: 'Zanimo',
    subs: [
      { value: 'chiens',              en: 'Dogs',             kr: 'Lisyen' },
      { value: 'chats',               en: 'Cats',             kr: 'Sa' },
      { value: 'oiseaux',             en: 'Birds',            kr: 'Zwezo' },
      { value: 'poissons',            en: 'Fish & Aquarium',  kr: 'Pwason' },
      { value: 'autres_animaux',      en: 'Other Animals',    kr: 'Lot Zanimo' },
      { value: 'animaux',             en: 'Pet Accessories',  kr: 'Akseswar Zanimo' },
    ],
  },
  {
    id: 'tourisme_group',
    icon: '🌴',
    en: 'Tourism & Activities',
    kr: 'Tourizm & Aktivite',
    subs: [
      { value: 'tourisme',    en: 'Tours & Excursions', kr: 'Tur & Exkursyon' },
      { value: 'hebergement', en: 'Accommodation',      kr: 'Lozisman' },
      { value: 'activites',   en: 'Activities',         kr: 'Aktivite' },
    ],
  },
  {
    id: 'dons_group',
    icon: '🎁',
    en: 'Free & Exchange',
    kr: 'Gratwit e Esanz',
    subs: [
      { value: 'dons', en: 'Free Items',        kr: 'Gratwit' },
      { value: 'troc', en: 'Exchange / Barter', kr: 'Eferan' },
    ],
  },
  {
    id: 'community_group',
    icon: '🤝',
    en: 'Community',
    kr: 'Kominote',
    // Sub-categories are English-only (no Creole translation): kr mirrors en.
    subs: [
      { value: 'wanted',     en: 'Wanted',       kr: 'Wanted' },
      { value: 'lost_found', en: 'Lost & Found', kr: 'Lost & Found' },
    ],
  },
  {
    id: 'pro_group',
    icon: '🏭',
    en: 'Pro Equipment',
    kr: 'Lekipaman Pro',
    subs: [
      { value: 'pro', en: 'Professional Equipment', kr: 'Lekipaman Pro' },
    ],
  },
  {
    id: 'autre_group',
    icon: '📦',
    en: 'Other',
    kr: 'Lezot',
    subs: [
      { value: 'autre', en: 'Other', kr: 'Lot Zafer' },
    ],
  },
]

// Flat lookup: category value → label
export function getCatLabel(value: string, lang: 'en' | 'kr'): string {
  for (const top of CATEGORY_TREE) {
    if (top.subs.length === 1 && top.subs[0].value === value) return top.subs[0][lang]
    const sub = top.subs.find(s => s.value === value)
    if (sub) return sub[lang]
  }
  return value
}

// Find which top category contains a given value
export function getTopCatForValue(value: string): TopCat | null {
  return CATEGORY_TREE.find(top => top.subs.some(s => s.value === value)) ?? null
}
