import axiosClient from './axiosClient';
import { AuthUser } from './authApi';

export interface UpdateProfilePayload {
  phone?: string;
  bio?: string;
  occupation?: string;
  resumeUrl?: string;
}

/**
 * PATCH /api/users/me
 * Updates current authenticated user profile.
 */
export const updateProfileApi = async (
  payload: UpdateProfilePayload
): Promise<AuthUser> => {
  const { data } = await axiosClient.patch<{ user: AuthUser }>('/users/me', payload);
  return data.user;
};

/**
 * POST /api/uploads/resume
 * Uploads a PDF file (max 5MB) and returns accessible resumeUrl.
 */
export const uploadResumePdfApi = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('resume', file);

  const { data } = await axiosClient.post<{ resumeUrl: string }>(
    '/uploads/resume',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return data.resumeUrl;
};

/**
 * POST /api/uploads/images
 * Uploads up to 5 property images (JPEG/PNG/WEBP, max 5MB/file) and returns relative imageUrls.
 */
export const uploadPropertyImagesApi = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  const { data } = await axiosClient.post<{ imageUrls: string[] }>(
    '/uploads/images',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return data.imageUrls;
};
