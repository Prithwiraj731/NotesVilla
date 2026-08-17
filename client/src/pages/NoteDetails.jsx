import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Calendar, BookOpen, FileText, Image as ImageIcon } from 'lucide-react';
import API from '../services/api';
import { downloadFile, downloadMultipleFiles } from '../utils/downloadUtils';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'svg'];

function isImageFile(filename) {
  if (!filename) return false;
  const ext = filename.split('.').pop().toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

function isImageUrl(url) {
  if (!url) return false;
  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i.test(url)) return true;
  if (/res\.cloudinary\.com.*\/image\/upload/i.test(url)) return true;
  return false;
}

export default function NoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState(null);

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

  const handleDownload = async () => {
    try {
      if (note?.files && note.files.length > 1) {
        const files = note.files.map(f => ({
          fileUrl: f.fileUrl,
          filename: f.originalName || f.filename || 'download'
        }));
        const result = await downloadMultipleFiles(files, {
          staggerDelay: 600,
          retryAttempts: 2,
          timeout: 45000,
          enableLogging: true
        });
        if (result.failed > 0) {
          alert(`Some files failed to download (${result.failed}/${result.total}).`);
        }
        return;
      }

      if (note?.fileUrl) {
        const fileUrl = note.fileUrl;
        const filename = note.originalName || note.filename || 'download';
        const ok = await downloadFile(fileUrl, filename, {
          enableLogging: true,
          retryAttempts: 2,
          timeout: 45000
        });
        if (!ok) {
          alert('Download failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ Download error:', error);
      alert('Download failed due to an unexpected error.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
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
        background: 'radial-gradient(circle at 50% 30%, rgba(251, 54, 64, 0.08) 0%, #000F08 70%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div className="cyber-panel" style={{ borderRadius: '8px', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(251, 54, 64, 0.2)',
            borderTop: '3px solid var(--accent-orange)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem'
          }} />
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-tech)', fontSize: '1.2rem', letterSpacing: '0.05em' }}>BOOTING CORE RECORD...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 30%, rgba(251, 54, 64, 0.08) 0%, #000F08 70%)',
        padding: '2rem',
        paddingTop: '7rem',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div className="cyber-panel" style={{ borderRadius: '8px', padding: '3rem' }}>
            <FileText size={48} style={{ color: 'var(--accent-orange)', margin: '0 auto 1.5rem' }} />
            <h2 style={{ color: 'var(--accent-orange)', fontFamily: 'var(--font-cyber)', fontSize: '1.5rem', margin: '0 0 1rem' }}>
              RECORD SYSTEM FAILURE
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', marginBottom: '2rem' }}>
              {error || 'The note record you are searching for does not exist in our systems.'}
            </p>
            <button
              onClick={() => navigate('/notes')}
              className="cyber-btn-orange"
            >
              <ArrowLeft size={18} />
              Return to Notes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isNoteImage = note.fileType === 'image' || isImageFile(note.filename) || isImageUrl(note.fileUrl);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 30%, rgba(251, 54, 64, 0.08) 0%, #000F08 70%)',
      padding: '2rem 1.5rem',
      paddingTop: '7rem',
      boxSizing: 'border-box'
    }}>
      {/* Back Button */}
      <div style={{ maxWidth: '1000px', margin: '0 auto 2rem' }}>
        <button
          onClick={() => navigate('/notes')}
          className="cyber-btn-wire"
        >
          <ArrowLeft size={16} />
          Return to Notes
        </button>
      </div>

      {/* Note Details Content */}
      <div 
        className="cyber-panel"
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        {/* Header Block */}
        <div style={{
          padding: '2rem',
          borderBottom: '1px solid rgba(251, 54, 64, 0.15)',
          background: 'rgba(0, 15, 8, 0.3)'
        }}>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: '900',
            fontFamily: 'var(--font-cyber)',
            lineHeight: '1.25',
            color: '#ffffff',
            marginBottom: '1rem'
          }}>
            {note.title}
          </h1>

          {note.description && (
            <p style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: '1.05rem',
              lineHeight: '1.6',
              margin: '0 0 1.5rem',
              maxWidth: '800px'
            }}>
              {note.description}
            </p>
          )}

          {/* Meta Tags */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(251, 54, 64, 0.08)',
              border: '1px solid rgba(251, 54, 64, 0.25)',
              borderRadius: '4px',
              padding: '0.4rem 0.8rem',
              color: 'var(--accent-orange)',
              fontFamily: 'var(--font-tech)',
              fontSize: '0.9rem',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              <BookOpen size={16} />
              {note.subjectName}
            </div>

            {isNoteImage && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '4px',
                padding: '0.4rem 0.8rem',
                color: '#10B981',
                fontFamily: 'var(--font-tech)',
                fontSize: '0.9rem',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                <ImageIcon size={16} />
                Image Note
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-tech)',
              fontSize: '0.95rem'
            }}>
              <Calendar size={16} />
              {formatDate(note.date)}
            </div>

            {note.files && note.files.length > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(251, 54, 64, 0.08)',
                border: '1px solid rgba(251, 54, 64, 0.25)',
                borderRadius: '4px',
                padding: '0.4rem 0.8rem',
                color: 'var(--accent-amber, #f59e0b)',
                fontFamily: 'var(--font-tech)',
                fontSize: '0.9rem',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                <FileText size={16} />
                {note.files.length} Files
              </div>
            )}
          </div>
        </div>

        {/* Content & Previews Block */}
        <div style={{ padding: '2rem' }}>
          {/* If it's an image note, display inline high-resolution preview */}
          {isNoteImage && note.fileUrl && (
            <div style={{
              marginBottom: '2rem',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'rgba(0, 5, 2, 0.7)',
              textAlign: 'center',
              padding: '1rem'
            }}>
              <img
                src={note.fileUrl}
                alt={note.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '600px',
                  borderRadius: '6px',
                  objectFit: 'contain',
                  cursor: 'pointer',
                  display: 'block',
                  margin: '0 auto'
                }}
                onClick={() => {
                  setSelectedPreviewUrl(note.fileUrl);
                  setShowPreview(true);
                }}
              />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.75rem', fontFamily: 'var(--font-body)' }}>
                Click image to view full-screen
              </p>
            </div>
          )}

          {/* Multiple Files Preview List */}
          {note.files && note.files.length > 1 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 480 ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.2rem',
              marginBottom: '2rem'
            }}>
              {note.files.map((file, index) => {
                const fileIsImg = isImageFile(file.originalName || file.filename) || file.fileType === 'image' || isImageUrl(file.fileUrl);
                return (
                  <div 
                    key={index}
                    className="cyber-panel"
                    style={{
                      background: 'rgba(0, 15, 8, 0.4)',
                      border: `1px solid ${fileIsImg ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 54, 64, 0.12)'}`,
                      borderRadius: '6px',
                      padding: '1.25rem',
                      textAlign: 'center',
                      minHeight: '160px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = fileIsImg ? '#10B981' : 'var(--accent-orange)';
                      e.currentTarget.style.boxShadow = `0 0 12px ${fileIsImg ? 'rgba(16, 185, 129, 0.15)' : 'rgba(251, 54, 64, 0.15)'}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = fileIsImg ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 54, 64, 0.12)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {fileIsImg ? (
                      <div 
                        style={{ height: '80px', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem', cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedPreviewUrl(file.fileUrl);
                          setShowPreview(true);
                        }}
                      >
                        <img src={file.fileUrl} alt={file.originalName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <FileText size={32} style={{ color: 'var(--accent-orange)', margin: '0 auto 0.75rem' }} />
                    )}

                    <h4 style={{
                      color: '#ffffff',
                      fontFamily: 'var(--font-tech)',
                      fontSize: '1rem',
                      fontWeight: '600',
                      margin: '0 0 0.75rem',
                      wordBreak: 'break-all',
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
                      onClick={async () => {
                        const ok = await downloadFile(
                          file.fileUrl,
                          file.originalName || file.filename || 'download',
                          { enableLogging: true, retryAttempts: 2, timeout: 45000 }
                        );
                        if (!ok) alert('Download failed. Please try again.');
                      }}
                      className="cyber-btn-wire"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: '100%', justifyContent: 'center' }}
                    >
                      <Download size={12} />
                      Download File
                    </button>
                  </div>
                );
              })}
            </div>
          ) : !isNoteImage && (
            /* Single Document Card/Preview Indicator */
            <div 
              className="cyber-panel"
              style={{
                background: 'rgba(0, 15, 8, 0.3)',
                borderRadius: '8px',
                padding: '2.5rem 2rem',
                textAlign: 'center',
                marginBottom: '2rem'
              }}
            >
              <div
                onClick={() => {
                  setSelectedPreviewUrl(note.fileUrl);
                  setShowPreview(true);
                }}
                style={{
                  width: '180px',
                  height: '140px',
                  margin: '0 auto 1.5rem',
                  background: 'rgba(251, 54, 64, 0.05)',
                  border: '1px solid rgba(251, 54, 64, 0.25)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--accent-orange)' }}>
                  <FileText size={32} style={{ marginBottom: '0.4rem' }} />
                  <span style={{ fontFamily: 'var(--font-tech)', fontSize: '0.8rem', fontWeight: '700' }}>
                    {note.fileUrl ? note.fileUrl.split('.').pop().toUpperCase() : 'FILE'}
                  </span>
                </div>
              </div>

              <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-tech)', fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                {note.filename || 'Note Code File'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', marginBottom: '0' }}>
                Click the preview screen to open full file view, or download to save.
              </p>
            </div>
          )}

          {/* Action Buttons Section */}
          <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownload}
              className="cyber-btn-orange"
              style={{
                padding: '0.85rem 2rem',
                fontSize: '1rem',
                boxShadow: '0 0 20px rgba(251, 54, 64, 0.25)'
              }}
            >
              <Download size={18} />
              {note.files && note.files.length > 1 ? `Download all (${note.files.length} files)` : 'Download Note'}
            </button>

            <button
              onClick={handleShare}
              className="cyber-btn-wire"
              style={{ padding: '0.85rem 2.2rem', fontSize: '1rem' }}
            >
              <Share2 size={18} />
              Share Link
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen File Preview Overlay */}
      {showPreview && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 15, 8, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1.5rem'
          }}
          onClick={() => setShowPreview(false)}
        >
          <div
            className="cyber-panel"
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#000F08',
              border: '1px solid rgba(251, 54, 64, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPreview(false)}
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                background: 'rgba(0, 15, 8, 0.8)',
                border: '1px solid rgba(251, 54, 64, 0.3)',
                borderRadius: '4px',
                width: '36px',
                height: '36px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                zIndex: 2005,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>

            {/* Preview Frame */}
            {(() => {
              const targetUrl = selectedPreviewUrl || note.fileUrl;
              const isImg = isImageUrl(targetUrl) || isImageFile(targetUrl);
              const isPDF = targetUrl && targetUrl.toLowerCase().includes('.pdf');

              if (isImg) {
                return (
                  <img
                    src={targetUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain' }}
                  />
                );
              } else if (isPDF) {
                return (
                  <iframe
                    src={targetUrl}
                    title="PDF Preview"
                    style={{ width: '80vw', height: '80vh', border: 'none' }}
                  />
                );
              }

              return (
                <div style={{
                  width: '75vw',
                  height: '60vh',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  textAlign: 'center'
                }}>
                  <FileText size={54} style={{ color: 'var(--accent-orange)', marginBottom: '1.25rem' }} />
                  <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                    {note.filename || 'Document File'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.95rem', marginBottom: '2rem', maxWidth: '400px' }}>
                    This file extension is not previewable directly in-browser. Please run file download to view.
                  </p>
                  
                  <button
                    onClick={handleDownload}
                    className="cyber-btn-orange"
                  >
                    <Download size={14} />
                    Download File
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}