import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import Notes from './pages/Notes';
import NoteDetails from './pages/NoteDetails';
import AdminUpload from './pages/AdminUpload';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { setAuthToken } from './services/api';

export default function App(){
  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthToken(token);
  }, []);

  return (
    <div className="app-root">
      <Header />
      <main style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Public routes - no authentication required */}
          <Route path="/notes" element={<Notes />} />
          <Route path="/note/:id" element={<NoteDetails />} />
          {/* Admin routes */}
          <Route path="/admin/upload" element={
            <ProtectedRoute><AdminUpload /></ProtectedRoute>
          } />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
