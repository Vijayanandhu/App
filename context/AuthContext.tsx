//
// ========== PASTE THIS ENTIRE BLOCK INTO (frontend)/src/context/AuthContext.tsx ==========
//
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { apiLogin, apiCreateUser, apiLogout, apiFetchUserById } from '../services/api'; 
import type { ParsedLoginCredentials, ParsedRegisterData } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: ParsedLoginCredentials) => Promise<void>;
  register: (userData: ParsedRegisterData) => Promise<void>; 
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAndSetUser = useCallback(async (jwtToken: string) => {
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      if (payload.userId) {
        const fetchedUser = await apiFetchUserById(payload.userId); 
        setUser(fetchedUser);
      } else {
         throw new Error("Token does not contain userId");
      }
    } catch (error) {
      console.error('Failed to fetch user from token:', error);
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchAndSetUser(token);
    } else {
      setLoading(false);
    }
  }, [token, fetchAndSetUser]);

  const login = async (credentials: ParsedLoginCredentials) => {
    const { user, token: newToken } = await apiLogin(credentials);
    setUser(user);
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
    navigate('/app');
  };

  const register = async (userData: ParsedRegisterData) => {
    await apiCreateUser(userData);
    console.log("User created successfully by admin.");
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setToken(null);
    navigate('/welcome');
  };

  const value = { user, token, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider> // CORRECTED: The closing tag typo is fixed here.
  );
};