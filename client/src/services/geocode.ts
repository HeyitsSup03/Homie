import axiosClient from '../api/axiosClient';

/**
 * Frontend geocoding service.
 * Calls backend proxy GET /api/listings/geocode?q=...
 * The secret OpenCage API key remains 100% secure on the server!
 */

export interface GeoResult {
  lat: number;
  lng: number;
  displayName: string;
}

export const geocodeQuery = async (query: string): Promise<GeoResult> => {
  const { data } = await axiosClient.get<GeoResult>('/listings/geocode', {
    params: { q: query },
  });
  return data;
};
