import axiosClient from './axiosClient';
import { AxiosError } from 'axios';

export type UserRole = 'owner' | 'seeker';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  hasListing?: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// Extract a readable error message from an Axios error
export const getErrorMessage = (err: unknown): string => {
  if (err instanceof AxiosError && err.response?.data?.message) {
    return err.response.data.message as string;
  }
  return 'Something went wrong. Please try again.';
};

export const registerApi = async (payload: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<AuthResponse> => {
  const { data } = await axiosClient.post<AuthResponse>('/auth/register', payload);
  return data;
};

export const loginApi = async (payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const { data } = await axiosClient.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const getMeApi = async (): Promise<AuthUser> => {
  const { data } = await axiosClient.get<{ user: AuthUser }>('/auth/me');
  return data.user;
};
