//
// ========== (frontend)/src/App.tsx ==========
//
import React from 'react';
// CORRECTED: Removed HashRouter and AuthProvider from imports
import { Routes, Route, Navigate } from 'react-router-dom'; 

import WelcomePage from './components/WelcomePage';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';

const App: React.FC = () => {
  return (
    // The <AuthProvider> and <HashRouter> have been REMOVED from this file.
    // They are correctly placed in your index.tsx now.
    <Routes>
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/login" element={<Login />} />
      
      <Route 
        path="/app/*" 
        element={
          <ProtectedRoute>
            <DashboardPageRoutes />
          </ProtectedRoute>
        } 
      />
      
      <Route path="/" element={<Navigate to="/welcome" replace />} />
      
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
};

// This helper component is fine, no changes needed here.
const DashboardPageRoutes: React.FC = () => {
  return <DashboardPage />;
}

export default App;