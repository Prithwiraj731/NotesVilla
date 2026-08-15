import React from 'react';
import { Navigate } from 'react-router-dom';
import { setAuthToken } from '../services/api';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const tokenPayload = JSON.parse(jsonPayload);
    
    // Check if user is admin
    if (!tokenPayload.isAdmin) {
      localStorage.removeItem('token');
      setAuthToken(null);
      return <Navigate to="/admin/login" replace />;
    }

    // Check if token has expired
    if (tokenPayload.exp && tokenPayload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      setAuthToken(null);
      return <Navigate to="/admin/login" replace />;
    }
  } catch (error) {
    localStorage.removeItem('token');
    setAuthToken(null);
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
}
