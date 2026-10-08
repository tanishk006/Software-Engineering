import { createContext, useContext, useState, useEffect } from 'react';
import {
  loginWithPassword as apiLoginPassword,
  loginWithGoogle as apiLoginGoogle,
  registerUser as apiRegisterUser,
  getCurrentUser as apiGetCurrentUser,
  logoutUser as apiLogoutUser
} from '../features/auth/services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load existing session on initial mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiGetCurrentUser();
        if (data && data.user) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await apiLoginPassword(email, password);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const loginGoogle = async (credential) => {
    setError(null);
    try {
      const data = await apiLoginGoogle(credential);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Google sign-in failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const setSession = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const register = async (payload) => {
    setError(null);
    try {
      const data = await apiRegisterUser(payload);
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await apiLogoutUser();
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      setError(null);
    }
  };

  const refreshUser = async () => {
    try {
      const data = await apiGetCurrentUser();
      if (data && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      // Ignore refresh error
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        setError,
        login,
        loginGoogle,
        register,
        logout,
        refreshUser,
        setSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
