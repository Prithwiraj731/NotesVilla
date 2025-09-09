import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Calendar, BookOpen, Tag, FileText } from 'lucide-react';
import API from '../services/api';


export default function NoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadNote();
  }, [id]);

  const loadNote = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/notes/note/${id}`);
      setNote(response.data);
    } catch (err) {
      console.error('Error loading note:', err);
      setError('Failed to load note details');
    } finally {
      setLoading(false);
    }
  };

  // Fixed download function - extract stored filename from fileUrl
  const handleDownload = async () => {
    if (note?.files && note.files.length > 1) {
      // For multiple files, download each one
      for (const file of note.files) {
        const storedFilename = file.fileUrl ? file.fileUrl.split('/').pop() : file.filename;
        const originalName = file.originalName || file.filename || storedFilename;
        
        const baseUrl = window.location.hostname === 'localhost'
          ? 'http://localhost:5000'
          : 'https://notesvilla.onrender.com';
        
        const downloadUrl = `${baseUrl}/api/notes/download/${storedFilename}?name=${encodeURIComponent(originalName)}`;
        
        // Stagger downloads to avoid overwhelming the browser
        setTimeout(() => {
          downloadViaFetch(downloadUrl, originalName);
        }, note.files.indexOf(file) * 500);
      }
    } else if (note?.fileUrl) {
      // For single file
      const storedFilename = note.fileUrl.split('/').pop();
      const originalName = note.originalName || note.filename || storedFilename;
      
      const baseUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://notesvilla.onrender.com';
      
      const downloadUrl = `${baseUrl}/api/notes/download/${storedFilename}?name=${encodeURIComponent(originalName)}`;
      
      downloadViaFetch(downloadUrl, originalName);
    }
  };

  // Simple download helper function
  const downloadViaFetch = async (url, suggestedName) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', suggestedName || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      console.log('🔽 Download initiated via fetch (blob)');
    } catch (err) {
      console.error('❌ Download failed:', err);
      window.open(url, '_blank'); // fallback
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: note.description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(168, 85, 247, 0.3)',
            borderTop: '3px solid #a855f7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#e2e8f0', fontSize: '1.125rem' }}>Loading note...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        padding: '2rem',
        paddingTop: '6rem'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '1rem',
            padding: '2rem'
          }}>
            <FileText size={48} style={{ color: '#f87171', margin: '0 auto 1rem' }} />
            <h2 style={{ color: '#f87171', fontSize: '1.5rem', margin: '0 0 1rem' }}>
              Note Not Found
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
              {error || 'The note you are looking for does not exist.'}
            </p>
            <button
              onClick={() => navigate('/notes')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <ArrowLeft size={20} />
              Back to Notes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      padding: 'clamp(1rem, 4vw, 2rem) clamp(0.5rem, 2vw, 1rem)',
      paddingTop: 'clamp(4rem, 10vh, 6rem)'
    }}>
      {/* Back Button */}
      <div style={{ maxWidth: '1000px', margin: '0 auto 2rem' }}>
        <button
          onClick={() => navigate('/notes')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(148, 163, 184, 0.1)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '0.5rem',
            color: '#94a3b8',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(168, 85, 247, 0.1)';
            e.target.style.borderColor = 'rgba(168, 85, 247, 0.3)';
            e.target.style.color = '#a855f7';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(148, 163, 184, 0.1)';
            e.target.style.borderColor = 'rgba(148, 163, 184, 0.3)';
            e.target.style.color = '#94a3b8';
          }}
        >
          <ArrowLeft size={16} />
          Back to Notes
        </button>
      </div>

      {/* Note Details */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        animation: 'slideInUp 0.6s ease'
      }}>
        {/* Header */}
        <div style={{
          padding: 'clamp(1.5rem, 4vw, 2rem)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
        }}>
          <h1 style={{
            fontSize: 'clamp(1.875rem, 4vw, 3rem)',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 50%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 1rem',
            lineHeight: '1.2'
          }}>
            {note.title}
          </h1>

          {note.description && (
            <p style={{
              color: '#94a3b8',
              fontSize: '1.125rem',
              lineHeight: '1.6',
              margin: '0 0 1.5rem'
            }}>
              {note.description}
            </p>
          )}

          {/* Metadata */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '1rem',
              padding: '0.5rem 1rem',
              color: '#a855f7',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              <BookOpen size={16} />
              {note.subjectName}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '1rem',
              padding: '0.5rem 1rem',
              color: '#6366f1',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              <Tag size={16} />
              {note.topicName}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#94a3b8',
              fontSize: '0.875rem'
            }}>
              <Calendar size={16} />
              {formatDate(note.date)}
            </div>

            {/* File count indicator */}
            {note.files && note.files.length > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '1rem',
                padding: '0.5rem 1rem',
                color: '#22c55e',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                <FileText size={16} />
                {note.files.length} files
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {/* Multiple Files Preview */}
          {note.files && note.files.length > 1 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 480 ? '1fr' : window.innerWidth < 768 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {note.files.map((file, index) => (
                <div key={index} style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '1rem',
                  padding: 'clamp(1rem, 3vw, 1.5rem)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  minHeight: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <FileText size={32} style={{
                    color: '#a855f7',
                    margin: '0 auto 1rem'
                  }} />
                  <h4 style={{
                    color: '#e2e8f0',
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                    fontWeight: '600',
                    margin: '0 0 0.5rem',
                    wordBreak: 'break-word',
                    lineHeight: '1.3',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {file.originalName || `File ${index + 1}`}
                  </h4>
                  <button
                    onClick={() => {
                      const storedFilename = file.fileUrl ? file.fileUrl.split('/').pop() : file.filename;
                      const originalName = file.originalName || file.filename || storedFilename;
                      
                      const baseUrl = window.location.hostname === 'localhost'
                        ? 'http://localhost:5000'
                        : 'https://notesvilla.onrender.com';
                      
                      const downloadUrl = `${baseUrl}/api/notes/download/${storedFilename}?name=${encodeURIComponent(originalName)}`;
                      
                      downloadViaFetch(downloadUrl, originalName);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      minHeight: '44px' // Touch-friendly
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    <Download size={14} />
                    Download
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Single File Preview */
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '1rem',
              padding: '2rem',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              {/* Note Preview - Clickable */}
              <div
                onClick={() => setShowPreview(true)}
                style={{
                  width: '200px',
                  height: '150px',
                  margin: '0 auto 1rem',
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '2px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                }}
              >
                {note.fileUrl && (note.fileUrl.toLowerCase().includes('.jpg') ||
                  note.fileUrl.toLowerCase().includes('.jpeg') ||
                  note.fileUrl.toLowerCase().includes('.png')) ? (
                  // Image preview
                  <img
                    src={note.fileUrl}
                    alt={note.filename || 'Note preview'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '0.5rem'
                    }}
                    onError={(e) => {
                      // Fallback to document icon if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  // Document preview for PDFs and other files
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#a855f7',
                    textAlign: 'center'
                  }}>
                    <FileText size={32} style={{ marginBottom: '0.5rem' }} />
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {note.fileUrl ? note.fileUrl.split('.').pop().toUpperCase() : 'FILE'}
                    </span>
                  </div>
                )}

                {/* Fallback document icon (hidden by default, shown if image fails) */}
                <div style={{
                  display: 'none',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a855f7',
                  textAlign: 'center'
                }}>
                  <FileText size={32} style={{ marginBottom: '0.5rem' }} />
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {note.fileUrl ? note.fileUrl.split('.').pop().toUpperCase() : 'FILE'}
                  </span>
                </div>
              </div>
              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '700',
                margin: '0 0 0.5rem'
              }}>
                {note.filename || 'Note File'}
              </h3>
              <p style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                margin: '0 0 1.5rem'
              }}>
                Click preview to view the complete note, or download to save it
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleDownload}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #d946ef 100%)',
                border: 'none',
                borderRadius: '1rem',
                color: 'white',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.05)';
                e.target.style.boxShadow = '0 20px 40px rgba(168, 85, 247, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 10px 30px rgba(168, 85, 247, 0.3)';
              }}
            >
              <Download size={20} />
              {note.files && note.files.length > 1 ? `Download All ${note.files.length} Files` : 'Download Note'}
            </button>

            <button
              onClick={handleShare}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 2rem',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '1rem',
                color: '#e2e8f0',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(20px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                e.target.style.background = 'rgba(99, 102, 241, 0.1)';
                e.target.style.color = '#6366f1';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                e.target.style.background = 'rgba(15, 23, 42, 0.6)';
                e.target.style.color = '#e2e8f0';
              }}
            >
              <Share2 size={20} />
              Share Note
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Preview Modal */}
      {showPreview && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => setShowPreview(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: 'white',
              borderRadius: '1rem',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPreview(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0, 0, 0, 0.7)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                zIndex: 1001,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>

            {/* Preview Content */}
            {(() => {
              const isImage = note.fileUrl && (
                note.fileUrl.toLowerCase().includes('.jpg') ||
                note.fileUrl.toLowerCase().includes('.jpeg') ||
                note.fileUrl.toLowerCase().includes('.png')
              );

              const isPDF = note.fileUrl && note.fileUrl.toLowerCase().includes('.pdf');

              if (isImage) {
                return (
                  <img
                    src={note.fileUrl}
                    alt={note.filename || 'Note preview'}
                    style={{
                      width: '100%',
                      height: '100%',
                      maxWidth: '90vw',
                      maxHeight: '90vh',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      // If image fails to load, show fallback
                      e.target.style.display = 'none';
                      const fallback = e.target.nextSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                );
              } else if (isPDF) {
                return (
                  <iframe
                    src={note.fileUrl}
                    title={note.filename || 'Note preview'}
                    style={{
                      width: '80vw',
                      height: '80vh',
                      border: 'none',
                      borderRadius: '0.5rem'
                    }}
                    onLoad={(e) => {
                      // Check if iframe loaded successfully
                      try {
                        if (e.target.contentDocument?.body?.innerHTML === '') {
                          throw new Error('Empty content');
                        }
                      } catch (err) {
                        // If PDF fails to load, show fallback
                        e.target.style.display = 'none';
                        const fallback = e.target.nextSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }
                    }}
                  />
                );
              } else {
                // For other file types, show download option
                return null; // Will show fallback below
              }
            })()}

            {/* Fallback for failed previews or unsupported files */}
            <div style={{
              display: (() => {
                const isImage = note.fileUrl && (
                  note.fileUrl.toLowerCase().includes('.jpg') ||
                  note.fileUrl.toLowerCase().includes('.jpeg') ||
                  note.fileUrl.toLowerCase().includes('.png')
                );
                const isPDF = note.fileUrl && note.fileUrl.toLowerCase().includes('.pdf');
                return (isImage || isPDF) ? 'none' : 'flex';
              })(),
              width: '80vw',
              height: '80vh',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              textAlign: 'center',
              background: '#f9fafb',
              borderRadius: '0.5rem'
            }}>
              <FileText size={64} style={{ color: '#a855f7', marginBottom: '1rem' }} />
              <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>
                {note.filename || 'Document'}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                This file type cannot be previewed in the browser. Click download to view it.
              </p>
              <button
                onClick={() => {
                  const storedFilename = note.fileUrl ? note.fileUrl.split('/').pop() : note.filename;
                  const originalName = note.originalName || note.filename || storedFilename;

                  const baseUrl = window.location.hostname === 'localhost'
                    ? 'http://localhost:5000'
                    : 'https://notesvilla.onrender.com';

                  const downloadUrl = `${baseUrl}/api/notes/download/${storedFilename}?name=${encodeURIComponent(originalName)}`;

                  downloadViaFetch(downloadUrl, originalName);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}