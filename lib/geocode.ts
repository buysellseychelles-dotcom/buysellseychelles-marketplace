export type LatLng = { lat: number; lng: number }

// Approximate coordinates for Seychelles islands and districts
const COORDS: Record<string, LatLng> = {
  // Mahé districts
  'victoria':       { lat: -4.619,  lng: 55.449 },
  'beau vallon':    { lat: -4.547,  lng: 55.436 },
  'anse royale':    { lat: -4.738,  lng: 55.505 },
  'mont fleuri':    { lat: -4.643,  lng: 55.457 },
  'quatre bornes':  { lat: -4.680,  lng: 55.472 },
  'plaisance':      { lat: -4.667,  lng: 55.465 },
  'grand anse':     { lat: -4.701,  lng: 55.475 },
  'grand anse mahé':{ lat: -4.701,  lng: 55.475 },
  'glacis':         { lat: -4.577,  lng: 55.447 },
  'bel air':        { lat: -4.637,  lng: 55.448 },
  'takamaka':       { lat: -4.765,  lng: 55.510 },
  // Islands
  'mahé':           { lat: -4.650,  lng: 55.459 },
  'mahe':           { lat: -4.650,  lng: 55.459 },
  'praslin':        { lat: -4.329,  lng: 55.724 },
  'la digue':       { lat: -4.361,  lng: 55.836 },
  'silhouette':     { lat: -4.483,  lng: 55.244 },
  'other islands':  { lat: -4.500,  lng: 55.500 },
  'autres îles':    { lat: -4.500,  lng: 55.500 },
}

const SEYCHELLES_CENTER: LatLng = { lat: -4.620, lng: 55.452 }

export function geocode(location: string | null | undefined): LatLng | null {
  if (!location) return null
  const lower = location.toLowerCase()
  // Try district first (e.g. "Victoria, Mahé")
  for (const [key, coords] of Object.entries(COORDS)) {
    if (lower.includes(key)) return coords
  }
  return null
}

export function geocodeOrDefault(location: string | null | undefined): LatLng {
  return geocode(location) ?? SEYCHELLES_CENTER
}

export const SEYCHELLES_BOUNDS = {
  center: SEYCHELLES_CENTER,
  zoom: 11,
}
