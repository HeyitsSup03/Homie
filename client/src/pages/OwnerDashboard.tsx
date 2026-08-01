import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OwnerDashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Owner Dashboard</h1>
      <p>Welcome! This page is under construction. Create listing functionality coming soon.</p>
      <button
        onClick={handleLogout}
        style={{
          marginTop: '24px',
          padding: '8px 20px',
          background: '#4A7546',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        Log Out
      </button>
    </div>
  );
};

export default OwnerDashboard;
