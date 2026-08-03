import axiosClient from './axiosClient';

// ── Types ──────────────────────────────────────────────────────────────────

export type InterestStatus = 'pending' | 'accepted' | 'declined';

export interface PopulatedSeeker {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  bio?: string;
  occupation?: string;
}

export interface PopulatedListing {
  _id: string;
  title: string;
  address: string;
  rent: number;
  images?: string[];
}

export interface Interest {
  _id: string;
  listing: PopulatedListing | string;
  seeker: PopulatedSeeker | string;
  owner: PopulatedSeeker | string;
  status: InterestStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

// ── API calls ──────────────────────────────────────────────────────────────

/**
 * POST /api/interests
 * Seeker only — express interest in a listing.
 */
export const expressInterestApi = async (
  listingId: string,
  message?: string
): Promise<Interest> => {
  const { data } = await axiosClient.post<{ interest: Interest }>('/interests', {
    listingId,
    message,
  });
  return data.interest;
};

/**
 * GET /api/interests/my-listings
 * Owner only — returns all interest requests received for the owner's listings.
 */
export const getOwnerInterestsApi = async (): Promise<Interest[]> => {
  const { data } = await axiosClient.get<{ interests: Interest[] }>(
    '/interests/my-listings'
  );
  return data.interests;
};

/**
 * GET /api/interests/my-interests
 * Seeker only — returns all interest requests the seeker has submitted.
 * Used to check existing interest status on /listings/:id.
 */
export const getSeekerInterestsApi = async (): Promise<Interest[]> => {
  const { data } = await axiosClient.get<{ interests: Interest[] }>(
    '/interests/my-interests'
  );
  return data.interests;
};

/**
 * PATCH /api/interests/:id/status
 * Owner only — accept or decline an interest request.
 */
export const updateInterestStatusApi = async (
  interestId: string,
  status: 'accepted' | 'declined'
): Promise<Interest> => {
  const { data } = await axiosClient.patch<{ interest: Interest }>(
    `/interests/${interestId}/status`,
    { status }
  );
  return data.interest;
};

/**
 * DELETE /api/interests/:id
 * Seeker or Owner — deletes an interest request and chat history.
 */
export const deleteInterestApi = async (interestId: string): Promise<void> => {
  await axiosClient.delete(`/interests/${interestId}`);
};
