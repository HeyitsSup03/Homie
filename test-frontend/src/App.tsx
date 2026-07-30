import React from 'react';
import Button from './ui/button';

export const App: React.FC = () => {
  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      margin: 0,
      padding: '40px',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '20px'
    }}>
      {/* Default Button */}
      <Button text="Hover Me" />

      {/* Primary Action Button */}
      <Button
        text="Get Started"
        bgColor="#a855f7"
        textColor="#ffffff"
        hoverBgColor="#9333ea"
        width="100px"
      />

      {/* Secondary Glass / Light Button */}
      <Button
        text="Learn More"
        bgColor="#f1f5f9"
        textColor="#0f172a"
        hoverBgColor="#e2e8f0"
        hoverTextColor="#0f172a"
        width="160px"
      />

      {/* Success / Accent Button */}
      <Button
        text="Confirm Action"
        bgColor="#10b981"
        textColor="#ffffff"
        hoverBgColor="#059669"
        width="200px"
      />
    </div>
  );
};

export default App;
