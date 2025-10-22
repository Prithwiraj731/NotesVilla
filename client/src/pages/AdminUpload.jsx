import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { setAuthToken } from '../services/api';
import { Upload, FileText, BookOpen, Tag, Folder, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function AdminUpload() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    subjectName: '',
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    files: [] // Changed from file to files array
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [filePreview, setFilePreview] = useState([]);

  const forceRelogin = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    navigate('/admin/login');
  };



  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    setForm({ ...form, files: fileArray });
    if (fileArray.length > 0) {
      const previews = fileArray.map(file => ({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type
      }));
      setFilePreview(previews);
    }
  };

  const handleSingleFile = (file) => {
    handleFiles([file]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    console.log('🚀 SUBMIT FUNCTION CALLED!');
    console.log('🚀 Event:', e);
    setLoading(true);
    setError('');
    setSuccess('');

    // Debug form state before upload
    console.log('🔍 Form state before upload:', form);
    console.log('🔍 Required fields check:', {
      title: form.title,
      subjectName: form.subjectName,
      date: form.date,
      files: form.files.length
    });

    // Check if required fields are filled
    const missingFields = [];
    if (!form.title || form.title.trim() === '') missingFields.push('Title');
    if (!form.subjectName || form.subjectName.trim() === '') missingFields.push('Subject');
    if (!form.date || form.date.trim() === '') missingFields.push('Date');

    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    if (form.files.length === 0) {
      setError('Please select at least one file to upload');
      setLoading(false);
      return;
    }


    // Debug token information
    const token = localStorage.getItem('token');
    console.log('🔐 Upload attempt with token:', token ? token.substring(0, 20) + '...' : 'null');

    if (!token) {
      setError('No authentication token found. Please login as admin first.');
      setLoading(false);
      return;
    }



    // Decode token to check if it's an admin token
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      console.log('🎫 Token payload:', tokenPayload);

      if (!tokenPayload.isAdmin) {
        setError('Not an admin token. Please login via Admin Login.');
        setLoading(false);
        return;
      }
    } catch (decodeError) {
      console.log('❌ Token decode error:', decodeError);
      setError('Invalid token format. Please login again.');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('description', form.description);
      data.append('subjectName', form.subjectName);
      data.append('date', form.date);

      // Append all files
      form.files.forEach((file, index) => {
        data.append('files', file);
      });

      // Debug FormData contents
      console.log('📝 FormData contents:');
      console.log('📝 Form state:', form);
      console.log('📝 Form field values:', {
        title: form.title,
        subjectName: form.subjectName,
        date: form.date,
        description: form.description
      });
      for (let [key, value] of data.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }


      setAuthToken(token);
      console.log(`🚀 Sending upload request for ${form.files.length} files...`);

      // Use fetch instead of axios for FormData to ensure proper Content-Type handling
      const uploadUrl = form.files.length === 1
        ? `${import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'}/notes/upload-single`
        : `${import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'}/notes/upload`;

      // For single file, use 'file' field name instead of 'files'
      if (form.files.length === 1) {
        data.delete('files'); // Remove the 'files' field
        data.append('file', form.files[0]); // Add 'file' field for single upload
        console.log('📁 Single file upload - Added file:', form.files[0].name);
      }

      // Final FormData check
      console.log('📝 Final FormData before sending:');
      for (let [key, value] of data.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - let browser set it automatically for FormData
        },
        body: data
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        throw new Error(errorData.msg || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();

      console.log('✅ Upload successful:', responseData);
      const filesCount = responseData.filesUploaded || form.files.length;
      setSuccess(`${filesCount} note(s) uploaded successfully!`);
      setForm({
        title: '',
        description: '',
        subjectName: '',
        date: new Date().toISOString().split('T')[0],
        files: []
      });
      setFilePreview([]);
    } catch (err) {
      console.log('❌ Upload error:', err);

      let errorMessage = err.message;

      // Handle specific error messages
      if (errorMessage.includes('invalid signature')) {
        errorMessage = 'Token signature invalid. Please log out and log back in via Admin Login to get a fresh token.';
      } else if (errorMessage.includes('JsonWebTokenError')) {
        errorMessage = 'Authentication token is corrupted. Please log out and log back in via Admin Login.';
      }

      setError(errorMessage);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      padding: '2rem 1rem',
      paddingTop: '6rem'
    }}>
      {/* Header Section */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto 3rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '2rem',
          padding: '0.75rem 1.5rem',
          marginBottom: '2rem'
        }}>
          <Upload size={20} style={{ color: '#a855f7' }} />
          <span style={{ color: '#e2e8f0', fontWeight: '500', letterSpacing: '0.05em' }}>ADMIN PORTAL</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 50%, #6366f1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 1rem',
          letterSpacing: '-0.02em'
        }}>Upload Note</h1>

        <p style={{
          color: '#94a3b8',
          fontSize: '1.125rem',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>Share knowledge with students by uploading educational content to the platform</p>
      </div>

      {/* Admin Login Notice */}
      {(!localStorage.getItem('token') ||
        (localStorage.getItem('token') &&
          !JSON.parse(atob(localStorage.getItem('token').split('.')[1])).isAdmin)) && (
          <div style={{
            maxWidth: '800px',
            margin: '0 auto 2rem',
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            borderRadius: '1rem',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <AlertCircle size={20} style={{ color: '#f59e0b' }} />
              <span style={{ color: '#f59e0b', fontWeight: '600' }}>Admin Access Required</span>
            </div>
            <p style={{ color: '#fbbf24', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
              This page requires admin privileges. Please use
              <a href="/admin/login" style={{ color: '#fbbf24', textDecoration: 'underline' }}> Admin Login </a>
              to access the upload functionality.
            </p>
          </div>
        )}
      {/* Main Upload Form */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: '1.5rem',
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Title Input */}
          <div style={{ position: 'relative' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#e2e8f0',
              fontWeight: '600',
              marginBottom: '0.75rem',
              fontSize: '0.95rem'
            }}>
              <FileText size={18} style={{ color: '#a855f7' }} />
              Note Title
            </label>
            <input
              type="text"
              placeholder="Enter a descriptive title for your note"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              style={{
                width: '100%',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '2px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                color: '#e2e8f0',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          {/* Description Textarea */}
          <div style={{ position: 'relative' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#e2e8f0',
              fontWeight: '600',
              marginBottom: '0.75rem',
              fontSize: '0.95rem'
            }}>
              <FileText size={18} style={{ color: '#a855f7' }} />
              Description
            </label>
            <textarea
              placeholder="Provide a detailed description of the note content"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4}
              style={{
                width: '100%',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '2px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                color: '#e2e8f0',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                resize: 'vertical',
                minHeight: '100px',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          {/* Subject Input Field */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#e2e8f0',
              fontWeight: '600',
              marginBottom: '0.75rem',
              fontSize: '0.95rem'
            }}>
              <BookOpen size={18} style={{ color: '#a855f7' }} />
              Subject Name
            </label>
            <input
              type="text"
              placeholder="Enter subject name (e.g., Mathematics, Physics)"
              value={form.subjectName}
              onChange={e => setForm({ ...form, subjectName: e.target.value })}
              required
              style={{
                width: '100%',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '2px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                color: '#e2e8f0',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Date Input Field */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#e2e8f0',
              fontWeight: '600',
              marginBottom: '0.75rem',
              fontSize: '0.95rem'
            }}>
              <Tag size={18} style={{ color: '#a855f7' }} />
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              required
              style={{
                width: '100%',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '2px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                color: '#e2e8f0',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                colorScheme: 'dark'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          {/* File Upload Area */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#e2e8f0',
              fontWeight: '600',
              marginBottom: '0.75rem',
              fontSize: '0.95rem'
            }}>
              <Folder size={18} style={{ color: '#a855f7' }} />
              Upload Files (Multiple supported)
            </label>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragActive ? 'rgba(168, 85, 247, 0.6)' : 'rgba(148, 163, 184, 0.3)'}`,
                borderRadius: '1rem',
                padding: '2rem',
                textAlign: 'center',
                background: dragActive ? 'rgba(168, 85, 247, 0.05)' : 'rgba(30, 41, 59, 0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.svg,.mp4,.mp3,.wav,.avi,.mov"
                onChange={(e) => handleFiles(e.target.files)}
                required
                style={{ display: 'none' }}
              />

              {filePreview.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ color: '#a855f7', fontWeight: '600', fontSize: '1rem', marginBottom: '0.5rem' }}>
                    {filePreview.length} file(s) selected:
                  </div>
                  {filePreview.map((file, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(168, 85, 247, 0.1)',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(168, 85, 247, 0.3)'
                      }}>
                        <FileText size={20} style={{ color: '#a855f7' }} />
                      </div>
                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <div style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '0.95rem' }}>{file.name}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{file.size} • {file.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    background: 'rgba(168, 85, 247, 0.1)',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    border: '1px solid rgba(168, 85, 247, 0.3)'
                  }}>
                    <Upload size={24} style={{ color: '#a855f7' }} />
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Drag & drop your files here
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    or click to browse • Multiple files supported • PDF, DOC, DOCX, JPG, PNG
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading
                ? 'rgba(100, 116, 139, 0.5)'
                : 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #6366f1 100%)',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '1.25rem 2rem',
              color: 'white',
              fontSize: '1.125rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              boxShadow: loading ? 'none' : '0 10px 25px -5px rgba(139, 92, 246, 0.4)',
              transform: loading ? 'none' : 'translateY(0)',
              marginTop: '1rem'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 35px -5px rgba(139, 92, 246, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 25px -5px rgba(139, 92, 246, 0.4)';
              }
            }}
          >
            {loading ? (
              <><Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Uploading {form.files.length} file(s)...</>
            ) : (
              <><Upload size={20} /> Upload Note(s) ({form.files.length || 0} file(s))</>
            )}
          </button>
          {/* Modern Animated Success Popup */}
          {success && (
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e5e7eb',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              animation: 'slideInScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              backdropFilter: 'blur(10px)'
            }}>
              {/* Success Icon with Animation */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                animation: 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                border: '3px solid #4ade80'
              }}>
                <CheckCircle size={40} color="#4ade80" />
              </div>

              {/* Success Message */}
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 0.5rem 0',
                animation: 'fadeInUp 0.5s ease-out 0.2s both'
              }}>
                Upload Successful! 🎉
              </h3>

              <p style={{
                fontSize: '1rem',
                color: '#6b7280',
                margin: '0 0 1.5rem 0',
                animation: 'fadeInUp 0.5s ease-out 0.3s both'
              }}>
                {success}
              </p>

              {/* Close Button */}
              <button
                onClick={() => setSuccess('')}
                style={{
                  backgroundColor: '#4ade80',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  animation: 'fadeInUp 0.5s ease-out 0.4s both'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#22c55e';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#4ade80';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Awesome! ✨
              </button>
            </div>
          )}

          {/* Overlay */}
          {success && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              animation: 'fadeIn 0.3s ease-out'
            }} />
          )}

          {error && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.75rem',
                color: '#f87171',
                marginBottom: '1rem'
              }}>
                <AlertCircle size={20} />
                <span style={{ fontWeight: '500' }}>{error}</span>
              </div>

              {/* Show re-login button for authentication errors */}
              {(error.includes('signature') || error.includes('token') || error.includes('authentication')) && (
                <button
                  onClick={forceRelogin}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #dc2626 100%)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    color: 'white',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    margin: '0 auto'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 5px 15px -3px rgba(245, 158, 11, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  🔑 Go to Admin Login
                </button>
              )}
            </div>
          )}
        </form>
      </div>

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
