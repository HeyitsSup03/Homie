import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Inverse guard — keeps logged-in users away from /login and /register.
 * Redirects them to their role's home instead.
 */
const GuestRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // Wait for rehydration

  if (user) {
    // Owner -> create listing page, Seeker -> search/landing page
    return <Navigate to={user.role === 'owner' ? '/owner/create-listing' : '/'} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
