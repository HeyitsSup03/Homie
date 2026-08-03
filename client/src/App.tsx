import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import GuestRoute from './components/layout/GuestRoute';
import HeroSection from './pages/HeroSection';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerListingForm from './pages/OwnerListingForm';
import SeekerDashboard from './pages/SeekerDashboard';
import PropertyDetails from './pages/PropertyDetails';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Guest-only routes — logged-in users are redirected to their role home */}
          <Route element={<GuestRoute />}>
            <Route path="/" element={<HeroSection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Owner-only pages */}
          <Route element={<ProtectedRoute requiredRole="owner" />}>
            <Route path="/owner/create-listing" element={<OwnerListingForm />} />
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          </Route>

          {/* Seeker-only pages */}
          <Route element={<ProtectedRoute requiredRole="seeker" />}>
            <Route path="/seeker/dashboard" element={<SeekerDashboard />} />
          </Route>

          {/* Shared authenticated pages — any logged-in role */}
          <Route element={<ProtectedRoute />}>
            <Route path="/listings/:id" element={<PropertyDetails />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
