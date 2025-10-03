import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import Notes from './pages/Notes';
import NoteDetails from './pages/NoteDetails';
import AdminUpload from './pages/AdminUpload';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import { setAuthToken } from './services/api';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthToken(token);

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-root">
      <LoadingScreen isLoading={isLoading} />
      {!isLoading && (
        <>
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
        </>
      )}
    </div>
  );
}
