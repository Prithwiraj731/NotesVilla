import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import Notes from './pages/Notes';
import NoteDetails from './pages/NoteDetails';
import AdminUpload from './pages/AdminUpload';
import ClassRoutine from './pages/ClassRoutine';
import Syllabus from './pages/Syllabus';
import PracticeQuestions from './pages/PracticeQuestions';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { setAuthToken } from './services/api';

export default function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setAuthToken(token);
  }, []);

  return (
    <div className="app-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public Academic Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/note/:id" element={<NoteDetails />} />
          <Route path="/routine" element={<ClassRoutine />} />
          <Route path="/syllabus" element={<Syllabus />} />
          <Route path="/practice" element={<PracticeQuestions />} />

          {/* Admin routes (hidden from public UI, directly accessed via URL) */}
          <Route 
            path="/admin" 
            element={
              localStorage.getItem('token') 
                ? <Navigate to="/admin/upload" replace /> 
                : <Navigate to="/admin/login" replace />
            } 
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/upload" 
            element={
              <ProtectedRoute>
                <AdminUpload />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      {/* Vercel Speed Insights */}
      <SpeedInsights />
    </div>
  );
}
