import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import GuestRoute from './components/layout/GuestRoute';
import HeroSection from './pages/HeroSection';
import Login from './pages/Login';
import Register from './pages/Register';

// Placeholder pages — design these yourself
const OwnerCreateListing: React.FC = () => <div>Owner: Create Listing — coming soon</div>;

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<HeroSection />} />

          {/* Auth pages — redirect away if already logged in */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Owner-only pages */}
          <Route element={<ProtectedRoute requiredRole="owner" />}>
            <Route path="/owner/create-listing" element={<OwnerCreateListing />} />
          </Route>

          {/* Seeker dashboard — reuses HeroSection (landing) component */}
          <Route element={<ProtectedRoute requiredRole="seeker" />}>
            <Route path="/seeker/dashboard" element={<HeroSection />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
