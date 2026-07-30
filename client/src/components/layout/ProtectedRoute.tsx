import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../api/authApi';

interface ProtectedRouteProps {
  requiredRole?: UserRole;
}

/**
 * Guards a route so only authenticated users can access it.
 * Optionally restricts to a specific role.
 * Redirects to /login while unauthenticated.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // Wait for rehydration before deciding

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    // Logged in but wrong role — send to their own home
    return <Navigate to={user.role === 'owner' ? '/owner/create-listing' : '/'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
