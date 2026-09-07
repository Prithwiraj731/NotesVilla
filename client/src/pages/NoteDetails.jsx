import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Calendar, BookOpen, FileText, Image as ImageIcon, Check } from 'lucide-react';
import API from '../services/api';
import { downloadFile, downloadMultipleFiles } from '../utils/downloadUtils';
import DocViewer, { getFileCategory } from '../components/DocViewer';

export default function NoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error('Failed to copy link');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
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

  const attachedFiles = (note.files && note.files.length > 0)
    ? note.files
    : [{
        fileUrl: note.fileUrl,
        filename: note.filename,
        originalName: note.originalName || note.filename || note.title,
        fileType: note.fileType
      }];

  const primaryCategory = getFileCategory(note.filename || '', note.fileUrl || '');

  return (
    <div className="note-details-page">
      {/* Top Navigation & Action Row */}
      <div className="note-details-top-bar">
        <button
          onClick={() => navigate('/notes')}
          className="cyber-btn-wire"
        >
          <ArrowLeft size={16} />
          <span>Return to Notes</span>
        </button>

        <div className="note-details-actions">
          <button
            onClick={handleShare}
            className="cyber-btn-wire"
          >
            {copied ? <Check size={16} style={{ color: '#10B981' }} /> : <Share2 size={16} />}
            <span>{copied ? 'Link Copied!' : 'Share Note'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="cyber-btn-orange"
          >
            <Download size={16} />
            <span>Download All ({attachedFiles.length})</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="cyber-panel note-details-card">
        {/* Header Block */}
        <div className="note-details-header">
          {/* Metadata Badges */}
          <div className="note-details-badges">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(251, 54, 64, 0.1)',
              border: '1px solid rgba(251, 54, 64, 0.3)',
              borderRadius: '4px',
              padding: '0.25rem 0.7rem',
              color: 'var(--accent-orange)',
              fontFamily: 'var(--font-tech)',
              fontSize: '0.8rem',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              <BookOpen size={13} />
              {note.subjectName}
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-tech)',
              fontSize: '0.82rem'
            }}>
              <Calendar size={13} />
              {formatDate(note.date)}
            </div>

            {attachedFiles.length > 1 && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(251, 54, 64, 0.08)',
                border: '1px solid rgba(251, 54, 64, 0.25)',
                borderRadius: '4px',
                padding: '0.25rem 0.7rem',
                color: 'var(--accent-amber, #f59e0b)',
                fontFamily: 'var(--font-tech)',
                fontSize: '0.8rem',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                <FileText size={13} />
                {attachedFiles.length} Attached Files
              </div>
            )}
          </div>

          <h1 className="note-details-title">
            {note.title}
          </h1>
        </div>

        {/* Embedded Interactive Viewer */}
        <div className="note-details-viewer-stage">
          <DocViewer
            files={attachedFiles}
            title={note.title}
          />
        </div>
      </div>

      <style>{`
        .note-details-page {
          min-height: 100vh;
          background: radial-gradient(circle at 50% 30%, rgba(251, 54, 64, 0.08) 0%, #000F08 70%);
          padding: 2rem 1.5rem;
          padding-top: 6.5rem;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .note-details-page {
            padding: 1.2rem 1.1rem;
            padding-top: 5.2rem;
          }
        }

        .note-details-top-bar {
          max-width: 1200px;
          margin: 0 auto 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.9rem;
        }

        @media (max-width: 640px) {
          .note-details-top-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 0.8rem;
          }
          .note-details-top-bar > button {
            width: 100%;
            justify-content: center;
          }
        }

        .note-details-actions {
          display: flex;
          gap: 0.8rem;
          flex-wrap: wrap;
        }

        @media (max-width: 640px) {
          .note-details-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.6rem;
          }
          .note-details-actions button {
            width: 100%;
            justify-content: center;
            padding: 0.55rem 0.7rem !important;
            font-size: 0.8rem !important;
          }
        }

        @media (max-width: 380px) {
          .note-details-actions {
            grid-template-columns: 1fr;
          }
        }

        .note-details-card {
          max-width: 1200px;
          margin: 0 auto;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(251, 54, 64, 0.25);
          background: rgba(0, 15, 8, 0.95);
        }

        .note-details-header {
          padding: 1.6rem 2rem;
          border-bottom: 1px solid rgba(251, 54, 64, 0.2);
          background: rgba(0, 15, 8, 0.6);
        }

        @media (max-width: 768px) {
          .note-details-header {
            padding: 1.2rem 1.1rem;
          }
        }

        .note-details-badges {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 0.8rem;
        }

        .note-details-title {
          font-size: clamp(1.35rem, 4vw, 2.4rem);
          font-weight: 900;
          font-family: var(--font-cyber);
          line-height: 1.25;
          color: #ffffff;
          margin: 0;
          word-break: break-word;
        }

        .note-details-viewer-stage {
          height: 75vh;
          min-height: 520px;
          width: 100%;
          position: relative;
        }

        @media (max-width: 768px) {
          .note-details-viewer-stage {
            height: 65vh;
            min-height: 380px;
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}