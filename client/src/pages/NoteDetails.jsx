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
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 30%, rgba(251, 54, 64, 0.08) 0%, #000F08 70%)',
      padding: '2rem 1.5rem',
      paddingTop: '6.5rem',
      boxSizing: 'border-box'
    }}>
      {/* Top Navigation & Action Row */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <button
          onClick={() => navigate('/notes')}
          className="cyber-btn-wire"
        >
          <ArrowLeft size={16} />
          Return to Notes
        </button>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
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
      <div 
        className="cyber-panel"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid rgba(251, 54, 64, 0.25)',
          background: 'rgba(0, 15, 8, 0.95)'
        }}
      >
        {/* Header Block */}
        <div style={{
          padding: '1.8rem 2rem',
          borderBottom: '1px solid rgba(251, 54, 64, 0.2)',
          background: 'rgba(0, 15, 8, 0.6)'
        }}>
          {/* Metadata Badges */}
          <div style={{
            display: 'flex',
            gap: '0.8rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: '0.8rem'
          }}>
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
              fontSize: '0.85rem',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              <BookOpen size={14} />
              {note.subjectName}
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-tech)',
              fontSize: '0.9rem'
            }}>
              <Calendar size={14} />
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
                fontSize: '0.85rem',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                <FileText size={14} />
                {attachedFiles.length} Attached Files
              </div>
            )}
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
            fontWeight: '900',
            fontFamily: 'var(--font-cyber)',
            lineHeight: '1.25',
            color: '#ffffff',
            margin: 0
          }}>
            {note.title}
          </h1>
        </div>

        {/* Embedded Interactive Viewer */}
        <div style={{
          height: '75vh',
          minHeight: '520px',
          width: '100%',
          position: 'relative'
        }}>
          <DocViewer
            files={attachedFiles}
            title={note.title}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}