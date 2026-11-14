import React, { useState, useEffect } from 'react';
import { X, Check, Copy, Download, Share2, Image as ImageIcon, ExternalLink, Sparkles } from 'lucide-react';
import { createNoteCardBlob, getCleanNoteTitle } from '../utils/shareCardGenerator';
import { resolveNoteCategory } from '../utils/categoryUtils';

export default function ShareNoteModal({ note, folderName, onClose }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [generating, setGenerating] = useState(true);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const cleanTitle = getCleanNoteTitle(note);
  const category = resolveNoteCategory(note);
  const folder = folderName || note.folderName;
  const noteUrl = `${window.location.origin}/note/${note._id || note.id}`;

  const folderTag = folder ? ` • 📁 ${folder}` : '';
  const shareText = `📖 ${cleanTitle}\n📚 ${note.subjectName} (${category} Notes${folderTag})\n🔗 ${noteUrl}`;

  useEffect(() => {
    let active = true;
    let createdUrl = null;

    async function generate() {
      try {
        setGenerating(true);
        const blob = await createNoteCardBlob(note, folder);
        if (active) {
          setImageBlob(blob);
          createdUrl = URL.createObjectURL(blob);
          setImageUrl(createdUrl);
        }
      } catch (err) {
        console.error('Failed to generate note card:', err);
      } finally {
        if (active) setGenerating(false);
      }
    }

    generate();

    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [note, folder]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Copy PNG image to clipboard
  const handleCopyImage = async () => {
    if (!imageBlob) return;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        // Attempt to copy image (and text fallback) so both image-paste and text-paste work
        try {
          const item = new ClipboardItem({
            'image/png': imageBlob,
            'text/plain': new Blob([shareText], { type: 'text/plain' })
          });
          await navigator.clipboard.write([item]);
        } catch (multiErr) {
          const item = new ClipboardItem({ 'image/png': imageBlob });
          await navigator.clipboard.write([item]);
        }
        setCopiedImage(true);
        showToast('📸 Photo copied! Paste directly into WhatsApp (Ctrl+V)');
        setTimeout(() => setCopiedImage(false), 2500);
      } else {
        showToast('Clipboard image not supported on this browser. Use Download instead.');
      }
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
      // Fallback to text copy
      try {
        await navigator.clipboard.writeText(shareText);
        showToast('Copied text link (browser restricted image paste)');
      } catch (e) {}
    }
  };

  // Copy text + link
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedText(true);
      showToast('🔗 Copied note text & link!');
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Download image
  const handleDownloadImage = () => {
    if (!imageBlob) return;
    const url = URL.createObjectURL(imageBlob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (cleanTitle || 'note').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${safeName}_NoteCard.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('⬇️ Note card downloaded!');
  };

  // Native share (Mobile / WhatsApp file sharing)
  const handleNativeShare = async () => {
    if (!imageBlob) return;
    try {
      const file = new File([imageBlob], `${(cleanTitle || 'note').replace(/\s+/g, '_')}_card.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${cleanTitle} — ${note.subjectName}`,
          text: `📖 ${cleanTitle}\n📚 ${note.subjectName} (${category} Notes${folderTag})\n🔗 ${noteUrl}`,
          files: [file]
        });
        showToast('Shared successfully!');
      } else if (navigator.share) {
        await navigator.share({
          title: `${cleanTitle} — ${note.subjectName}`,
          text: shareText,
          url: noteUrl
        });
      } else {
        handleCopyImage();
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Share error:', err);
    }
  };

  return (
    <div className="share-modal-backdrop" onClick={onClose}>
      <div className="share-modal-dialog" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="share-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="share-modal-icon-badge">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="share-modal-title">Share Note Card</h3>
              <p className="share-modal-subtitle">{note.subjectName} {folder ? `• 📁 ${folder}` : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="share-modal-close-btn" title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Card Visual Preview */}
        <div className="share-modal-preview-wrapper">
          {generating ? (
            <div className="share-modal-loading">
              <div className="share-spin" />
              <span>Generating Visual Note Card...</span>
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt={cleanTitle} className="share-modal-preview-img" />
          ) : (
            <div className="share-modal-loading">
              <span>Card preview unavailable</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="share-modal-actions-grid">
          {/* 1. Copy Image (For WhatsApp Web / Discord / Slack) */}
          <button
            onClick={handleCopyImage}
            className="share-action-btn primary-btn"
            title="Copies the photo card to clipboard. Paste directly into WhatsApp Web (Ctrl+V)."
          >
            {copiedImage ? <Check size={16} style={{ color: '#10B981' }} /> : <ImageIcon size={16} />}
            <span>{copiedImage ? 'Photo Copied!' : 'Copy Photo (Paste in WhatsApp)'}</span>
          </button>

          {/* 2. Native Share on Mobile */}
          {typeof navigator !== 'undefined' && !!navigator.share && (
            <button
              onClick={handleNativeShare}
              className="share-action-btn secondary-btn"
              title="Share photo and link directly via mobile apps"
            >
              <Share2 size={16} />
              <span>Share to Apps</span>
            </button>
          )}

          {/* 3. Copy Text + Link */}
          <button
            onClick={handleCopyText}
            className="share-action-btn wire-btn"
            title="Copy clean text snippet with direct link"
          >
            {copiedText ? <Check size={16} style={{ color: '#10B981' }} /> : <Copy size={16} />}
            <span>{copiedText ? 'Text Copied!' : 'Copy Text & Link'}</span>
          </button>

          {/* 4. Download Image */}
          <button
            onClick={handleDownloadImage}
            className="share-action-btn wire-btn"
            title="Download the PNG note card to your device"
          >
            <Download size={16} />
            <span>Download Photo</span>
          </button>
        </div>

        {/* Toast notification inside modal */}
        {toastMsg && (
          <div className="share-modal-toast">
            <Check size={14} style={{ color: '#10B981' }} />
            <span>{toastMsg}</span>
          </div>
        )}

      </div>

      <style>{`
        .share-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.82);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 10000;
          animation: modalFadeIn 0.2s ease-out;
        }

        .share-modal-dialog {
          background: #0d121a;
          border: 1px solid rgba(251, 54, 64, 0.35);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(251, 54, 64, 0.15);
          border-radius: 16px;
          max-width: 620px;
          width: 100%;
          padding: 1.5rem;
          box-sizing: border-box;
          position: relative;
          color: #ffffff;
        }

        .share-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.2rem;
          padding-bottom: 0.8rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .share-modal-icon-badge {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: rgba(251, 54, 64, 0.15);
          border: 1px solid rgba(251, 54, 64, 0.35);
          color: #fb3640;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .share-modal-title {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
        }

        .share-modal-subtitle {
          margin: 0.15rem 0 0;
          font-size: 0.78rem;
          color: var(--text-muted, #94a3b8);
        }

        .share-modal-close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          border-radius: 8px;
          padding: 0.4rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .share-modal-close-btn:hover {
          background: rgba(251, 54, 64, 0.2);
          border-color: #fb3640;
          color: #ffffff;
        }

        .share-modal-preview-wrapper {
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          background: #070b10;
          border: 1px solid rgba(255, 255, 255, 0.08);
          aspect-ratio: 1200 / 630;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.2rem;
        }

        .share-modal-preview-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .share-modal-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8rem;
          color: #94a3b8;
          font-size: 0.85rem;
        }

        .share-spin {
          width: 28px;
          height: 28px;
          border: 2px solid rgba(251, 54, 64, 0.2);
          border-top-color: #fb3640;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .share-modal-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.7rem;
        }

        .share-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.65rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .share-action-btn.primary-btn {
          background: linear-gradient(135deg, #fb3640 0%, #e11d48 100%);
          border: 1px solid #fb3640;
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(251, 54, 64, 0.35);
          grid-column: span 2;
        }

        .share-action-btn.primary-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .share-action-btn.secondary-btn {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
        }

        .share-action-btn.secondary-btn:hover {
          background: rgba(16, 185, 129, 0.25);
          color: #ffffff;
        }

        .share-action-btn.wire-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #e2e8f0;
        }

        .share-action-btn.wire-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.3);
        }

        .share-modal-toast {
          margin-top: 1rem;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #34d399;
          padding: 0.55rem 0.9rem;
          border-radius: 8px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: modalFadeIn 0.2s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .share-modal-actions-grid {
            grid-template-columns: 1fr;
          }
          .share-action-btn.primary-btn {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
}
