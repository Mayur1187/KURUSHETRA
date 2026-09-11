import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check saved session in localStorage
    const savedSession = localStorage.getItem('jalsangam_auth');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch (err) {
        localStorage.removeItem('jalsangam_auth');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = async (email, password) => {
    setError(null);
    try {
      const res = await api.login(email, password);
      if (res.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('jalsangam_auth', JSON.stringify(res.data));
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed. Please check credentials.";
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleRegister = async (data) => {
    setError(null);
    try {
      const res = await api.register(data);
      if (res.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('jalsangam_auth', JSON.stringify(res.data));
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Registration failed.";
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleQuickLogin = async (preset) => {
    setError(null);
    try {
      const res = await api.quickLogin(preset);
      if (res.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('jalsangam_auth', JSON.stringify(res.data));
        return res.data;
      }
    } catch (err) {
      console.error("Quick login error:", err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jalsangam_auth');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      loading,
      error,
      login: handleLogin,
      register: handleRegister,
      quickLogin: handleQuickLogin,
      logout: handleLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
