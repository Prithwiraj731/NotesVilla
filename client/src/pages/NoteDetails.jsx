import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Calendar, BookOpen, Tag, FileText, Eye } from 'lucide-react';
import API from '../services/api';

export default function NoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  // Ultra-robust download function that works in all scenarios
  const downloadViaFetch = async (url, suggestedName) => {
    try {
      console.log('🔄 Starting download:', suggestedName, url);
      
      // Method 1: Try fetch + blob (best for CORS-enabled servers)
      try {
        const res = await fetch(url, { 
          method: 'GET',
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (res.ok) {
          const blob = await res.blob();
          const objectUrl = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = objectUrl;
          a.download = suggestedName || 'download';
          a.style.display = 'none';
          
          document.body.appendChild(a);
          a.click();
          
          setTimeout(() => {
            URL.revokeObjectURL(objectUrl);
            if (document.body.contains(a)) {
              document.body.removeChild(a);
            }
          }, 100);
          
          console.log('✅ Download completed via fetch+blob:', suggestedName);
          return;
        }
      } catch (fetchError) {
        console.log('⚠️ Fetch method failed, trying alternatives:', fetchError.message);
      }
      
      // Method 2: Try iframe download (works for many CORS scenarios)
      try {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 3000);
        
        console.log('✅ Download initiated via iframe:', suggestedName);
        return;
      } catch (iframeError) {
        console.log('⚠️ Iframe method failed:', iframeError.message);
      }
      
      // Method 3: Direct anchor link (last resort)
      const link = document.createElement('a');
      link.href = url;
      link.download = suggestedName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      
      // Trigger click with user interaction simulation
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      
      link.dispatchEvent(clickEvent);
      
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 1000);
      
      console.log('✅ Download initiated via direct link:', suggestedName);
      
    } catch (error) {
      console.error('❌ All download methods failed:', error);
      
      // Final fallback: show user the URL
      const userChoice = confirm(
        `Download failed. Would you like to open the file in a new tab?\n\nFile: ${suggestedName}`
      );
      
      if (userChoice) {
        window.open(url, '_blank');
      }
    }
  };

  const handleDownload = () => {
    if (note?.files && note.files.length > 1) {
      // For multiple files
      note.files.forEach((file, index) => {
        setTimeout(() => {
          const filename = file.fileUrl.split('/').pop(); // Extract filename from URL
          const originalName = file.originalName || filename;

          // Create download URL with proper backend endpoint
          const baseUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:5000'
            : 'https://notesvilla.onrender.com'; // Point to backend server
          const downloadUrl = `${baseUrl}/api/notes/download/${filename}?name=${encodeURIComponent(originalName)}`;

          downloadViaFetch(downloadUrl, originalName);
        }, index * 500); // Stagger the downloads by 500ms
      });
    } else if (note?.fileUrl) {
      // For single file
      const filename = note.fileUrl.split('/').pop(); // Extract filename from URL
      const originalName = note.filename || filename;

      // Create download URL with proper backend endpoint
      const baseUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://notesvilla.onrender.com'; // Point to backend server
      const downloadUrl = `${baseUrl}/api/notes/download/${filename}?name=${encodeURIComponent(originalName)}`;

      downloadViaFetch(downloadUrl, originalName);
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
                      const filename = file.fileUrl.split('/').pop(); // Extract filename from URL
                      const originalName = file.originalName || filename;

                      // Create download URL with proper backend endpoint
                      const baseUrl = window.location.hostname === 'localhost'
                        ? 'http://localhost:5000'
                        : 'https://notesvilla.onrender.com'; // Point to backend server
                      const downloadUrl = `${baseUrl}/api/notes/download/${filename}?name=${encodeURIComponent(originalName)}`;

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
              <Eye size={48} style={{
                color: '#a855f7',
                margin: '0 auto 1rem'
              }} />
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
                Click download to view the complete note
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