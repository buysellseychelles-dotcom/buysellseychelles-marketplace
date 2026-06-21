// Quartiers (districts) par île — source partagée entre post-ad, edit-listing
// et search-filters.
//
// La liste Mahé reprend à l'identique l'ancien MAHE_DISTRICTS qui était défini
// en dur dans post-ad. Praslin et La Digue utilisent les districts administratifs
// réels des Seychelles. Les autres îles n'ont pas de découpage en quartiers.

const DISTRICTS: Record<string, string[]> = {
  'Mahé': [
    'Victoria', 'Beau Vallon', 'Anse Royale', 'Mont Fleuri',
    'Quatre Bornes', 'Plaisance', 'Grand Anse', 'Glacis', 'Bel Air', 'Takamaka',
  ],
  'Praslin': [
    'Baie Sainte Anne', 'Grand Anse', 'Anse Volbert', 'Anse Kerlan',
  ],
  'La Digue': [
    'La Passe', 'La Réunion', 'Anse Réunion',
  ],
}

/** Liste des quartiers d'une île (vide si l'île n'a pas de découpage). */
export function districtsFor(island: string): string[] {
  return DISTRICTS[island] ?? []
}

// Tous les quartiers, dédupliqués et triés du plus long au plus court : utile
// pour retrouver le quartier dans une chaîne de localisation libre
// (loc.includes(q)) sans qu'un nom court masque un nom plus spécifique.
export const ALL_DISTRICTS: string[] = Array.from(
  new Set(Object.values(DISTRICTS).flat())
).sort((a, b) => b.length - a.length)
