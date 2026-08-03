const OPENCAGE_API_URL = 'https://api.opencagedata.com/geocode/v1/json';

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export const geocodeAddressDetailed = async (address: string): Promise<GeocodeResult> => {
  const apiKey = process.env.OPENCAGE_API_KEY;
  if (!apiKey) {
    throw new Error('OPENCAGE_API_KEY is not configured in environment variables.');
  }

  const url = `${OPENCAGE_API_URL}?q=${encodeURIComponent(address)}&key=${apiKey}&limit=1&no_annotations=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Geocoding API request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as {
    results: { geometry: { lat: number; lng: number }; formatted: string }[];
    status: { code: number; message: string };
  };

  if (!data.results || data.results.length === 0) {
    throw new Error(`Could not geocode address: "${address}". No results found.`);
  }

  const { lat, lng } = data.results[0].geometry;
  const displayName = data.results[0].formatted;

  return { lat, lng, displayName };
};

/**
 * Converts a plain-text address into [longitude, latitude] coordinates
 * using the OpenCage Geocoding API.
 */
const geocodeAddress = async (address: string): Promise<[number, number]> => {
  const res = await geocodeAddressDetailed(address);
  // GeoJSON convention: [longitude, latitude]
  return [res.lng, res.lat];
};

export default geocodeAddress;
