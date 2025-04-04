import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      setLoading(true);
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setCurrentUser(null);
          setLoading(false);
          return;
        }
        
        // Set auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch current user
        const response = await api.get('/auth/me');
        setCurrentUser(response.data);
      } catch (err) {
        console.error('Auth check error:', err);
        // Clear invalid token
        localStorage.removeItem('token');
        setCurrentUser(null);
        setError('Session expired. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', userData);
      
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      
      // Set auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Set user
      setCurrentUser(response.data);
      
      // Redirect based on role
      if (response.data.role === 'candidate') {
        navigate('/candidate/dashboard');
      } else if (response.data.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      }
      
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      
      // Set auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Set user
      setCurrentUser(response.data);
      
      // Redirect based on role
      if (response.data.role === 'candidate') {
        navigate('/candidate/dashboard');
      } else if (response.data.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      }
      
      return response.data;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear token and user regardless of API response
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      navigate('/login');
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;