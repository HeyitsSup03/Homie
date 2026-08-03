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

/**
 * GET /api/listings/nearby?lat=&lng=&radiusKm=
 * Returns listings within a given radius of a coordinate.
 * (Will be used in Phase 3 — Search + Map)
 */
export const getNearbyListingsApi = async (params: {
  lat: number;
  lng: number;
  radiusKm?: number;
}): Promise<Listing[]> => {
  const { data } = await axiosClient.get<{ listings: Listing[] }>(
    '/listings/nearby',
    { params }
  );
  return data.listings;
};
