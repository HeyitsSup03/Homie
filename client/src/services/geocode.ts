/**
 * Frontend geocoding service using OpenCage Data API.
 * Converts a plain-text location query (e.g. "Kolkata, India") into
 * { lat, lng, displayName } for use with the map and /nearby API.
 */

const OPENCAGE_API_KEY = '0c3aa83daf6546548bb5791594f7a100';

export interface GeoResult {
  lat: number;
  lng: number;
  displayName: string;
}

export const geocodeQuery = async (query: string): Promise<GeoResult> => {
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${OPENCAGE_API_KEY}&limit=1&no_annotations=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding request failed.');

  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`Could not find location: "${query}"`);
  }

  const { lat, lng } = data.results[0].geometry;
  const displayName: string = data.results[0].formatted;

  return { lat, lng, displayName };
};
