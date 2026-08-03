import axiosClient from './axiosClient';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ListingLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface OwnerDetails {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Listing {
  _id: string;
  owner: string;
  title: string;
  rent: number;
  description?: string;
  amenities: string[];
  address: string;
  location: ListingLocation;
  images: string[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  ownerDetails?: OwnerDetails; // populated when fetched via GET /listings/:id
}

export interface CreateListingPayload {
  title: string;
  rent: number;
  description?: string;
  amenities?: string[];
  address: string;
  images?: string[];
}

// ── API calls ──────────────────────────────────────────────────────────────

/**
 * POST /api/listings
 * Owner only — JWT token is automatically attached by axiosClient interceptor.
 * Returns the newly created listing.
 */
export const createListingApi = async (
  payload: CreateListingPayload
): Promise<Listing> => {
  const { data } = await axiosClient.post<{ listing: Listing }>(
    '/listings',
    payload
  );
  return data.listing;
};

/**
 * GET /api/listings/my-listings
 * Owner only — returns all listings created by the logged-in owner, newest first.
 */
export const getMyListingsApi = async (): Promise<Listing[]> => {
  const { data } = await axiosClient.get<{ listings: Listing[] }>(
    '/listings/my-listings'
  );
  return data.listings;
};

/**
 * GET /api/listings/:id
 * Returns a single listing by its MongoDB _id, with owner name/email populated.
 */
export const getListingByIdApi = async (id: string): Promise<Listing> => {
  const { data } = await axiosClient.get<{ listing: Listing }>(
    `/listings/${id}`
  );
  return data.listing;
};

export interface NearbyListingsParams {
  lat: number;
  lng: number;
  radiusKm?: number;
  minRent?: number;
  maxRent?: number;
  amenities?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
}

/**
 * GET /api/listings/nearby?lat=&lng=&radiusKm=&minRent=&maxRent=&amenities=&sortBy=
 * Returns listings within a given radius of a coordinate with optional budget/amenity filters & sorting.
 */
export const getNearbyListingsApi = async (
  params: NearbyListingsParams
): Promise<Listing[]> => {
  const queryParams: Record<string, any> = {
    lat: params.lat,
    lng: params.lng,
  };

  if (params.radiusKm !== undefined) queryParams.radiusKm = params.radiusKm;
  if (params.minRent !== undefined) queryParams.minRent = params.minRent;
  if (params.maxRent !== undefined) queryParams.maxRent = params.maxRent;
  if (params.amenities && params.amenities.length > 0) {
    queryParams.amenities = params.amenities.join(',');
  }
  if (params.sortBy) queryParams.sortBy = params.sortBy;

  const { data } = await axiosClient.get<{ listings: Listing[] }>(
    '/listings/nearby',
    { params: queryParams }
  );
  return data.listings;
};

/**
 * DELETE /api/listings/:id
 * Owner only — deletes a listing by ID.
 */
export const deleteListingApi = async (id: string): Promise<void> => {
  await axiosClient.delete(`/listings/${id}`);
};
