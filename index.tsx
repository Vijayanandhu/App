//
// ========== (frontend)/src/index.tsx ==========
//
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // Make sure this path is correct for your project
import './global.css'; // Make sure you have this file for global styles

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>  {/* <-- 1. The Router must wrap everything */}
      <AuthProvider> {/* <-- 2. The AuthProvider goes inside the Router */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);