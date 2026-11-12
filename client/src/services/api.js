import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_BASE 
  || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : 'https://notesvilla-sige.onrender.com/api');

const resolvedBaseURL = rawBaseURL.replace(/https?:\/\/notesvilla\.onrender\.com/g, 'https://notesvilla-sige.onrender.com');

const API = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 30000, // 30 second timeout (reduced from 60s for faster failure detection)
  headers: {
    'Content-Type': 'application/json'
  }
});

export const setAuthToken = (token) => {
  if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete API.defaults.headers.common['Authorization'];
};

// Add response interceptor for error handling
API.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });

    // Add network error handling
    if (!error.response) {
      console.error('🔌 Network error - could not reach server');
    }

    return Promise.reject(error);
  }
);

export default API;
