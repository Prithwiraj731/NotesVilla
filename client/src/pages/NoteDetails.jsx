import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Calendar, BookOpen, FileText } from 'lucide-react';
import API from '../services/api';
import { downloadFile, downloadMultipleFiles } from '../utils/downloadUtils';

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
                color: 'var(--accent-amber)',
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
          {/* Multiple Files Preview List */}
          {note.files && note.files.length > 1 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 480 ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.2rem',
              marginBottom: '2rem'
            }}>
              {note.files.map((file, index) => (
                <div 
                  key={index}
                  className="cyber-panel"
                  style={{
                    background: 'rgba(0, 15, 8, 0.4)',
                    border: '1px solid rgba(251, 54, 64, 0.12)',
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
                    e.currentTarget.style.borderColor = 'var(--accent-orange)';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(251, 54, 64, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(251, 54, 64, 0.12)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <FileText size={32} style={{ color: 'var(--accent-orange)', margin: '0 auto 0.75rem' }} />
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
              ))}
            </div>
          ) : (
            /* Single File Card/Preview Indicator */
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
              {/* Note Preview trigger box */}
              <div
                onClick={() => setShowPreview(true)}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.04)';
                  e.currentTarget.style.borderColor = 'var(--accent-orange)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(251, 54, 64, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = 'rgba(251, 54, 64, 0.25)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {note.fileUrl && (note.fileUrl.toLowerCase().includes('.jpg') ||
                  note.fileUrl.toLowerCase().includes('.jpeg') ||
                  note.fileUrl.toLowerCase().includes('.png')) ? (
                  <img
                    src={note.fileUrl}
                    alt={note.filename || 'Preview'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--accent-orange)' }}>
                    <FileText size={32} style={{ marginBottom: '0.4rem' }} />
                    <span style={{ fontFamily: 'var(--font-tech)', fontSize: '0.8rem', fontWeight: '700' }}>
                      {note.fileUrl ? note.fileUrl.split('.').pop().toUpperCase() : 'FILE'}
                    </span>
                  </div>
                )}
                
                {/* Fallback Icon */}
                <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', color: 'var(--accent-orange)' }}>
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
            {/* Close Cross Trigger */}
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
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-orange)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(251, 54, 64, 0.3)'}
            >
              ×
            </button>

            {/* Preview Frame */}
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
                    alt="Preview"
                    style={{ width: '100%', height: '100%', maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fb = e.target.nextSibling;
                      if (fb) fb.style.display = 'flex';
                    }}
                  />
                );
              } else if (isPDF) {
                return (
                  <iframe
                    src={note.fileUrl}
                    title="PDF Preview"
                    style={{ width: '80vw', height: '80vh', border: 'none' }}
                    onLoad={(e) => {
                      try {
                        if (e.target.contentDocument?.body?.innerHTML === '') throw new Error('Empty');
                      } catch (_) {
                        e.target.style.display = 'none';
                        const fb = e.target.nextSibling;
                        if (fb) fb.style.display = 'flex';
                      }
                    }}
                  />
                );
              }
              return null;
            })()}

            {/* Modal Fallback Frame */}
            <div style={{
              display: (() => {
                const isImg = note.fileUrl && (note.fileUrl.toLowerCase().includes('.jpg') || note.fileUrl.toLowerCase().includes('.jpeg') || note.fileUrl.toLowerCase().includes('.png'));
                const isPDF = note.fileUrl && note.fileUrl.toLowerCase().includes('.pdf');
                return (isImg || isPDF) ? 'none' : 'flex';
              })(),
              width: '75vw',
              height: '60vh',
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
                This file extension is not previewable in-browser. Please run file download to view.
              </p>
              
              <button
                onClick={async () => {
                  const storedFilename = note.fileUrl ? note.fileUrl.split('/').pop() : note.filename;
                  const originalName = note.originalName || note.filename || storedFilename;
                  const ok = await downloadFile(note.fileUrl, originalName);
                  if (!ok) alert('Download failed. Please try again.');
                }}
                className="cyber-btn-orange"
              >
                <Download size={14} />
                Download File System
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styled JSX embedded animations */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}