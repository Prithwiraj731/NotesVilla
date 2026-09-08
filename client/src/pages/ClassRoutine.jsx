import React, { useState } from 'react';
import { 
  Calendar, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw
} from 'lucide-react';

export default function ClassRoutine() {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const routineImagePath = '/ClassRoutine.jpeg';

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = routineImagePath;
    link.download = 'NotesVilla-ClassRoutine.jpeg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="routine-page-container">
      {/* Header Section */}
      <div className="routine-header-wrapper">
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(251, 54, 64, 0.08)',
          border: '1px solid rgba(251, 54, 64, 0.25)',
          borderRadius: '4px',
          padding: '0.35rem 1rem',
          marginBottom: '0.8rem'
        }}>
          <Calendar size={15} style={{ color: 'var(--accent-orange)' }} />
          <span style={{
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-tech)',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontSize: '0.82rem'
          }}>
            Academic Timetable & Schedule
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 3.4rem)',
          fontWeight: '900',
          fontFamily: 'var(--font-cyber)',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          background: 'linear-gradient(135deg, #ffffff 30%, var(--accent-orange) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 0.8rem',
          lineHeight: '1.2'
        }}>
          CLASS ROUTINE
        </h1>
      </div>

      {/* Routine Interactive Viewer Panel */}
      <div 
        className="cyber-panel routine-viewer-panel"
      >
        {/* Toolbar Header */}
        <div className="routine-toolbar">
          <div className="routine-status-badge">
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 8px #10B981',
              flexShrink: 0
            }} />
            <span className="routine-status-text">
              Official Class Routine Schedule
            </span>
          </div>

          {/* Action Control Buttons */}
          <div className="routine-controls-row">
            {/* Zoom Group */}
            <div className="routine-zoom-group">
              <button
                onClick={handleZoomIn}
                className="cyber-btn-wire routine-ctrl-btn"
                title="Zoom In"
              >
                <ZoomIn size={14} />
                <span>Zoom In</span>
              </button>

              <button
                onClick={handleZoomOut}
                className="cyber-btn-wire routine-ctrl-btn"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
                <span>Zoom Out</span>
              </button>

              <button
                onClick={handleResetZoom}
                className="cyber-btn-wire routine-ctrl-btn"
                title="Reset Zoom"
              >
                <RotateCcw size={14} />
                <span>{Math.round(zoomLevel * 100)}%</span>
              </button>
            </div>

            {/* Actions Group */}
            <div className="routine-actions-group">
              <button
                onClick={() => setIsFullScreen(true)}
                className="cyber-btn-wire routine-action-btn"
                title="Full Screen Preview"
              >
                <Maximize2 size={14} />
                <span>Expand</span>
              </button>

              <button
                onClick={handleDownload}
                className="cyber-btn-orange routine-download-btn"
              >
                <Download size={14} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>

        {/* Image Display Area with Overflow Pan */}
        <div className="routine-image-stage touch-scroll">
          <img 
            src={routineImagePath}
            alt="Official Class Routine"
            style={{
              maxWidth: zoomLevel === 1 ? '100%' : 'none',
              width: `${zoomLevel * 100}%`,
              height: 'auto',
              borderRadius: '6px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
              transition: 'width 0.25s ease-out',
              display: 'block'
            }}
          />
        </div>
      </div>

      {/* Fullscreen Modal View */}
      {isFullScreen && (
        <div 
          className="routine-fullscreen-overlay"
          onClick={() => setIsFullScreen(false)}
        >
          {/* Modal Header */}
          <div className="routine-fullscreen-header">
            <h3 style={{ fontFamily: 'var(--font-cyber)', color: '#ffffff', fontSize: '1.1rem', margin: 0 }}>
              Full Screen Routine View
            </h3>
            <button
              onClick={() => setIsFullScreen(false)}
              className="cyber-btn-wire"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}
            >
              Close [ESC]
            </button>
          </div>

          <div 
            style={{
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={routineImagePath} 
              alt="Class Routine Fullscreen"
              style={{
                maxWidth: '95vw',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 0 40px rgba(0, 0, 0, 0.9)'
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        .routine-page-container {
          min-height: 100vh;
          background: radial-gradient(circle at 50% 20%, rgba(251, 54, 64, 0.09) 0%, #000F08 75%);
          padding: 2rem 1.5rem;
          padding-top: 6.5rem;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .routine-page-container {
            padding: 1.2rem 1.1rem;
            padding-top: 5.2rem;
          }
        }

        .routine-header-wrapper {
          max-width: 1200px;
          margin: 0 auto 2.5rem;
          text-align: center;
        }

        @media (max-width: 768px) {
          .routine-header-wrapper {
            margin-bottom: 1.8rem;
          }
        }

        .routine-viewer-panel {
          max-width: 1200px;
          margin: 0 auto 4rem;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(251, 54, 64, 0.25);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
        }

        @media (max-width: 768px) {
          .routine-viewer-panel {
            border-radius: 10px;
            margin-bottom: 2.5rem;
          }
        }

        .routine-toolbar {
          background: rgba(0, 15, 8, 0.85);
          padding: 1rem 1.4rem;
          border-bottom: 1px solid rgba(251, 54, 64, 0.15);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.9rem;
        }

        @media (max-width: 768px) {
          .routine-toolbar {
            padding: 0.85rem 1rem;
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
        }

        .routine-status-badge {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .routine-status-text {
          color: #ffffff;
          font-family: var(--font-tech);
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        @media (max-width: 480px) {
          .routine-status-text {
            font-size: 0.85rem;
          }
        }

        .routine-controls-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .routine-controls-row {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            width: 100%;
          }
        }

        .routine-zoom-group {
          display: flex;
          gap: 0.4rem;
        }

        @media (max-width: 768px) {
          .routine-zoom-group {
            width: 100%;
          }
          .routine-zoom-group .routine-ctrl-btn {
            flex: 1;
            justify-content: center;
          }
        }

        .routine-actions-group {
          display: flex;
          gap: 0.4rem;
        }

        @media (max-width: 768px) {
          .routine-actions-group {
            width: 100%;
          }
          .routine-actions-group .routine-action-btn,
          .routine-actions-group .routine-download-btn {
            flex: 1;
            justify-content: center;
          }
        }

        .routine-ctrl-btn {
          padding: 0.45rem 0.75rem;
          font-size: 0.82rem;
          white-space: nowrap;
        }

        .routine-action-btn {
          padding: 0.45rem 0.85rem;
          font-size: 0.82rem;
          white-space: nowrap;
        }

        .routine-download-btn {
          padding: 0.45rem 1.1rem;
          font-size: 0.82rem;
          clip-path: none;
          border-radius: 4px;
          white-space: nowrap;
        }

        .routine-image-stage {
          position: relative;
          background: rgba(0, 5, 2, 0.9);
          padding: 1.5rem;
          min-height: 480px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: auto;
        }

        @media (max-width: 768px) {
          .routine-image-stage {
            padding: 0.85rem;
            min-height: 280px;
          }
        }

        .routine-fullscreen-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 15, 8, 0.97);
          z-index: 3000;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
        }

        @media (max-width: 640px) {
          .routine-fullscreen-overlay {
            padding: 0.8rem;
          }
        }

        .routine-fullscreen-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}
