import React from 'react';
import { Navigate } from 'react-router-dom';

// This component now only protects admin routes
// Regular routes (dashboard, notes) are public
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  // Check if it's an admin token by decoding it
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  
  try {
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    if (!tokenPayload.isAdmin) {
      return <Navigate to="/admin/login" replace />;
    }
  } catch (error) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
}
