import axios from 'axios';

// Function to determine the API base URL
const getBaseURL = () => {
  // First, check for the environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If not found, try to construct from current window location
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If we're on localhost, use local development server
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5005/api';
    }
    
    // If we're on Netlify
    if (hostname.includes('netlify.app')) {
      // For Netlify, construct the API URL
      const siteName = hostname.split('.')[0];
      if (siteName) {
        // We can use Netlify Functions as API endpoints
        return `https://${siteName}.netlify.app/.netlify/functions`;
      }
    }
  }
  
  // Fallback to a default API URL (for Netlify)
  return '/.netlify/functions';
};

// Create axios instance with dynamic config
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't override Content-Type if it's multipart/form-data
    // This is needed for file uploads as axios sets the boundary automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;