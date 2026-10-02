import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_BASE 
  || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : 'https://notesvilla-sige.onrender.com/api');

const resolvedBaseURL = rawBaseURL.replace(/https?:\/\/notesvilla\.onrender\.com/g, 'https://notesvilla-sige.onrender.com');

const API = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 60000, // 60 second timeout for all requests
  headers: {
    'Content-Type': 'application/json'
  }
});

export const setAuthToken = (token) => {
  if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete API.defaults.headers.common['Authorization'];
};

// Add response interceptor for debugging
API.interceptors.response.use(
  response => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });

    // Add additional validation for non-200 responses
    if (response.status >= 400) {
      console.warn(`⚠️ API request failed with status ${response.status}:`, {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }

    return response;
  },
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
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
