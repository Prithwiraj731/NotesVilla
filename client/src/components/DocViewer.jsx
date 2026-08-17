import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  AlertCircle,
  Eye,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { downloadFile } from '../utils/downloadUtils';

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'svg'];
const PDF_EXTS = ['pdf'];
const OFFICE_EXTS = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
const MEDIA_EXTS = ['mp4', 'webm', 'mp3', 'wav', 'ogg'];
const TEXT_EXTS = ['txt', 'md', 'json', 'js', 'py', 'java', 'c', 'cpp', 'html', 'css'];

export function getFileCategory(filename, url) {
  const target = (filename || url || '').toLowerCase();
  const ext = target.split('?')[0].split('.').pop();

  if (IMAGE_EXTS.includes(ext) || /res\.cloudinary\.com.*\/image\/upload/i.test(url || '')) return 'image';
  if (PDF_EXTS.includes(ext) || /application\/pdf/i.test(target)) return 'pdf';
  if (OFFICE_EXTS.includes(ext)) return 'office';
  if (MEDIA_EXTS.includes(ext)) return 'media';
  if (TEXT_EXTS.includes(ext)) return 'text';
  return 'unknown';
}

export default function DocViewer({ 
  files = [], 
  title = 'Document Preview', 
  onClose,
  initialFileIndex = 0,
  isFullscreenMode = false 
}) {
  const normalizedFiles = files.length > 0 ? files : [{ fileUrl: '', filename: 'Document' }];
  const [activeIdx, setActiveIdx] = useState(initialFileIndex);
  const [viewerEngine, setViewerEngine] = useState('direct'); // 'direct' | 'google' | 'office'
  const [isFullscreen, setIsFullscreen] = useState(isFullscreenMode);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);

  const activeFile = normalizedFiles[activeIdx] || normalizedFiles[0];
  const fileUrl = activeFile.fileUrl || activeFile.url || '';
  const fileName = activeFile.originalName || activeFile.filename || activeFile.name || 'document';
  const category = getFileCategory(fileName, fileUrl);

  // Reset zoom, rotation and loading state on file change
  useEffect(() => {
    setImageZoom(1);
    setImageRotation(0);
    setLoading(true);
    setIframeError(false);
    // For Office docs, default to google engine
    if (category === 'office') {
      setViewerEngine('google');
    } else {
      setViewerEngine('direct');
    }
  }, [activeIdx, fileUrl, category]);

  const handleDownloadActive = async () => {
    if (!fileUrl) return;
    await downloadFile(fileUrl, fileName);
  };

  const getViewerUrl = () => {
    if (!fileUrl) return '';
    if (viewerEngine === 'google') {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    }
    if (viewerEngine === 'office') {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
    }
    return fileUrl;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      background: '#000A05',
      color: '#ffffff',
      fontFamily: 'var(--font-tech, sans-serif)',
      overflow: 'hidden',
      borderRadius: isFullscreen ? '0' : '10px',
      border: isFullscreen ? 'none' : '1px solid rgba(251, 54, 64, 0.3)'
    }}>
      {/* ─── TOP TOOLBAR ─────────────────────────────────────── */}
      <div style={{
        padding: '0.8rem 1.2rem',
        background: 'rgba(0, 15, 8, 0.95)',
        borderBottom: '1px solid rgba(251, 54, 64, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.8rem',
        zIndex: 10
      }}>
        {/* Left: Title & File Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', minWidth: '200px', flex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: category === 'image' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(251, 54, 64, 0.15)',
            border: `1px solid ${category === 'image' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(251, 54, 64, 0.35)'}`,
            color: category === 'image' ? '#10B981' : 'var(--accent-orange, #fb3640)',
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase'
          }}>
            {category === 'image' ? <ImageIcon size={13} /> : <FileText size={13} />}
            <span>{category.toUpperCase()}</span>
          </div>

          <div style={{
            color: '#ffffff',
            fontWeight: '700',
            fontSize: '0.95rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '350px'
          }} title={fileName}>
            {fileName}
          </div>
        </div>

        {/* Center: Multi-File Tabs (if > 1 file attached) */}
        {normalizedFiles.length > 1 && (
          <div style={{
            display: 'flex',
            gap: '0.4rem',
            background: 'rgba(251, 54, 64, 0.05)',
            padding: '0.2rem',
            borderRadius: '6px',
            border: '1px solid rgba(251, 54, 64, 0.15)',
            overflowX: 'auto',
            maxWidth: '100%'
          }}>
            {normalizedFiles.map((file, idx) => {
              const isSelected = idx === activeIdx;
              const fName = file.originalName || file.filename || `File ${idx + 1}`;
              const fCat = getFileCategory(fName, file.fileUrl);

              return (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  style={{
                    background: isSelected ? 'var(--accent-orange, #fb3640)' : 'transparent',
                    color: isSelected ? '#000000' : 'var(--text-secondary, #9ca3af)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {fCat === 'image' ? <ImageIcon size={12} /> : <FileText size={12} />}
                  <span>{fName.length > 18 ? fName.substring(0, 15) + '...' : fName}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right: Controls & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Zoom controls for images */}
          {category === 'image' && (
            <div style={{ display: 'flex', gap: '0.25rem', marginRight: '0.3rem' }}>
              <button
                onClick={() => setImageZoom(prev => Math.min(prev + 0.25, 3))}
                className="cyber-btn-wire"
                style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={() => setImageZoom(prev => Math.max(prev - 0.25, 0.5))}
                className="cyber-btn-wire"
                style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <button
                onClick={() => setImageRotation(prev => (prev + 90) % 360)}
                className="cyber-btn-wire"
                style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                title="Rotate 90°"
              >
                <RotateCw size={14} />
              </button>
            </div>
          )}

          {/* Viewer Engine Switcher for PDFs & Docs */}
          {(category === 'pdf' || category === 'office') && (
            <div style={{
              display: 'inline-flex',
              background: 'rgba(0, 5, 2, 0.8)',
              border: '1px solid rgba(251, 54, 64, 0.2)',
              borderRadius: '4px',
              padding: '0.15rem',
              marginRight: '0.3rem'
            }}>
              {category === 'pdf' && (
                <button
                  onClick={() => { setViewerEngine('direct'); setLoading(true); }}
                  style={{
                    background: viewerEngine === 'direct' ? 'rgba(251, 54, 64, 0.25)' : 'transparent',
                    color: viewerEngine === 'direct' ? '#ffffff' : 'var(--text-muted, #6b7280)',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  title="Use Browser Native Viewer"
                >
                  Native
                </button>
              )}
              <button
                onClick={() => { setViewerEngine('google'); setLoading(true); }}
                style={{
                  background: viewerEngine === 'google' ? 'rgba(251, 54, 64, 0.25)' : 'transparent',
                  color: viewerEngine === 'google' ? '#ffffff' : 'var(--text-muted, #6b7280)',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                title="Use Google Docs Viewer Engine"
              >
                Google Docs
              </button>
            </div>
          )}

          {/* Open in New Window */}
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cyber-btn-wire"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', textDecoration: 'none' }}
            title="Open original file in new browser tab"
          >
            <ExternalLink size={14} />
            <span style={{ display: 'none', '@media (min-width: 600px)': { display: 'inline' } }}>Open Tab</span>
          </a>

          {/* Download Button */}
          <button
            onClick={handleDownloadActive}
            className="cyber-btn-orange"
            style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem', clipPath: 'none', borderRadius: '4px' }}
            title="Download file"
          >
            <Download size={14} />
            <span>Download</span>
          </button>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="cyber-btn-wire"
              style={{
                padding: '0.3rem 0.5rem',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
                marginLeft: '0.4rem'
              }}
              title="Close Preview"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ─── MAIN PREVIEW BODY ───────────────────────────────── */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: category === 'image' ? '#000804' : '#0a0a0a',
        overflow: category === 'image' ? 'auto' : 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        {/* Loading Spinner Indicator */}
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 15, 8, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
            pointerEvents: 'none'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid rgba(251, 54, 64, 0.2)',
              borderTop: '3px solid var(--accent-orange, #fb3640)',
              borderRadius: '50%',
              animation: 'docspin 1s linear infinite',
              marginBottom: '1rem'
            }} />
            <div style={{ color: 'var(--accent-orange, #fb3640)', fontFamily: 'var(--font-tech)', fontSize: '0.95rem', fontWeight: '700' }}>
              RENDERING NOTE PREVIEW...
            </div>
            <div style={{ color: 'var(--text-muted, #9ca3af)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
              {fileName}
            </div>
          </div>
        )}

        {/* 1. IMAGE VIEWER */}
        {category === 'image' && (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            boxSizing: 'border-box',
            overflow: 'auto'
          }}>
            <img
              src={fileUrl}
              alt={fileName}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setIframeError(true);
              }}
              style={{
                maxWidth: imageZoom === 1 ? '100%' : 'none',
                maxHeight: imageZoom === 1 ? '100%' : 'none',
                transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 0.25s ease',
                objectFit: 'contain',
                borderRadius: '6px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            />
          </div>
        )}

        {/* 2. PDF & OFFICE DOCUMENT VIEWER (Interactive iFrame) */}
        {(category === 'pdf' || category === 'office') && (
          <iframe
            key={`${fileUrl}-${viewerEngine}`}
            src={getViewerUrl()}
            title={fileName}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setIframeError(true);
            }}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#ffffff',
              display: iframeError ? 'none' : 'block'
            }}
          />
        )}

        {/* 3. MEDIA VIEWER (Audio / Video) */}
        {category === 'media' && (
          <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '700px', width: '100%' }}>
            <video
              controls
              autoPlay
              src={fileUrl}
              onLoadedData={() => setLoading(false)}
              style={{ width: '100%', maxHeight: '70vh', borderRadius: '8px', border: '1px solid rgba(251, 54, 64, 0.3)' }}
            >
              Your browser does not support video playback.
            </video>
          </div>
        )}

        {/* 4. TEXT VIEWER */}
        {category === 'text' && (
          <iframe
            src={fileUrl}
            title={fileName}
            onLoad={() => setLoading(false)}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#000F08',
              color: '#ffffff',
              padding: '1.5rem',
              boxSizing: 'border-box'
            }}
          />
        )}

        {/* 5. FALLBACK / ERROR SCREEN */}
        {(category === 'unknown' || iframeError) && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            maxWidth: '500px'
          }}>
            <FileText size={56} style={{ color: 'var(--accent-orange, #fb3640)', margin: '0 auto 1.2rem', opacity: 0.8 }} />
            <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: '700' }}>
              {fileName}
            </h3>
            <p style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.8rem' }}>
              This file format can be viewed directly in a new browser tab or downloaded to your device.
            </p>
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cyber-btn-wire"
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', textDecoration: 'none' }}
              >
                <ExternalLink size={16} /> Open in Tab
              </a>
              <button
                onClick={handleDownloadActive}
                className="cyber-btn-orange"
                style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem', clipPath: 'none', borderRadius: '4px' }}
              >
                <Download size={16} /> Download File
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes docspin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
