import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../api/authApi';

interface ProtectedRouteProps {
  requiredRole?: UserRole;
}

/**
 * Guards a route so only authenticated users can access it.
 * Optionally restricts to a specific role.
 * Redirects to /login while unauthenticated.
 * Enforces that owners without listings cannot access the dashboard.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null; // Wait for rehydration before deciding

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    // Logged in but wrong role — send to their own home
    return <Navigate to={user.role === 'owner' ? (user.hasListing ? '/owner/dashboard' : '/owner/create-listing') : '/'} replace />;
  }

  // If user is an owner without any property listing, block access to pages other than /owner/create-listing
  if (user.role === 'owner' && !user.hasListing && location.pathname !== '/owner/create-listing') {
    return <Navigate to="/owner/create-listing" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
