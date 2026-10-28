import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuthContext } from './authContextDef';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('stockflow_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('stockflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [organization, setOrganization] = useState(() => {
    const saved = localStorage.getItem('stockflow_org');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync state changes with localStorage
  const saveAuthSession = (authToken, authUser, authOrg) => {
    setToken(authToken);
    setUser(authUser);
    setOrganization(authOrg);
    if (authToken) {
      localStorage.setItem('stockflow_token', authToken);
      localStorage.setItem('stockflow_user', JSON.stringify(authUser));
      localStorage.setItem('stockflow_org', JSON.stringify(authOrg));
    } else {
      localStorage.removeItem('stockflow_token');
      localStorage.removeItem('stockflow_user');
      localStorage.removeItem('stockflow_org');
    }
  };

  // Verify token on app mount
  useEffect(() => {
    async function verifySession() {
      const storedToken = localStorage.getItem('stockflow_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.auth.getMe();
        if (response.success) {
          setUser(response.user);
          setOrganization(response.organization);
          localStorage.setItem('stockflow_user', JSON.stringify(response.user));
          localStorage.setItem('stockflow_org', JSON.stringify(response.organization));
        }
      } catch (err) {
        console.warn('Session verification failed, clearing auth cache:', err.message);
        saveAuthSession(null, null, null);
      } finally {
        setLoading(false);
      }
    }

    verifySession();

    // Listen to unauthorized events triggered by API interceptor
    const handleUnauthorized = () => {
      saveAuthSession(null, null, null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const response = await api.auth.login({ email, password });
    if (response.success) {
      saveAuthSession(response.token, response.user, response.organization);
      return response;
    }
    throw new Error(response.message || 'Login failed');
  };

  const signup = async (formData) => {
    const response = await api.auth.signup(formData);
    if (response.success) {
      saveAuthSession(response.token, response.user, response.organization);
      return response;
    }
    throw new Error(response.message || 'Signup failed');
  };

  const logout = () => {
    saveAuthSession(null, null, null);
  };

  const updateOrganizationState = (updatedOrg) => {
    setOrganization((prev) => {
      const next = { ...prev, ...updatedOrg };
      localStorage.setItem('stockflow_org', JSON.stringify(next));
      return next;
    });
  };

  const value = {
    token,
    user,
    organization,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    signup,
    logout,
    updateOrganizationState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
