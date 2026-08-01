import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Inverse guard — keeps logged-in users away from /, /login and /register.
 * Redirects them to their role's home instead.
 * Owners always go to /owner/dashboard (first-time or returning).
 * Seekers always go to /seeker/dashboard.
 */
const GuestRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // Wait for rehydration

  if (user) {
    // Owner -> owner dashboard, Seeker -> seeker dashboard
    return <Navigate to={user.role === 'owner' ? '/owner/dashboard' : '/seeker/dashboard'} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
