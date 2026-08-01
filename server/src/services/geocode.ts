const OPENCAGE_API_URL = 'https://api.opencagedata.com/geocode/v1/json';

/**
 * Converts a plain-text address into [longitude, latitude] coordinates
 * using the OpenCage Geocoding API.
 *
 * @throws Error if the address cannot be geocoded (zero results or API failure).
 */
const geocodeAddress = async (address: string): Promise<[number, number]> => {
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
    results: { geometry: { lat: number; lng: number } }[];
    status: { code: number; message: string };
  };

  if (!data.results || data.results.length === 0) {
    throw new Error(`Could not geocode address: "${address}". No results found.`);
  }

  const { lat, lng } = data.results[0].geometry;

  // GeoJSON convention: [longitude, latitude]
  return [lng, lat];
};

export default geocodeAddress;
