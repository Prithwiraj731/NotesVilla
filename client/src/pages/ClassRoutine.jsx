import React, { useState } from 'react';
import { 
  Calendar, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ChevronRight
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

  const scheduleHighlights = [
    { day: "Monday", slots: "09:30 AM - 04:30 PM", focus: "Data Structures, Discrete Math & Web Tech Lab" },
    { day: "Tuesday", slots: "09:30 AM - 03:30 PM", focus: "Database Management Systems, Computer Organization" },
    { day: "Wednesday", slots: "09:30 AM - 04:30 PM", focus: "Algorithms Analysis, Operating Systems Lab" },
    { day: "Thursday", slots: "09:30 AM - 03:30 PM", focus: "Object-Oriented Programming, Theory of Computation" },
    { day: "Friday", slots: "09:30 AM - 02:30 PM", focus: "Software Engineering & Project Work" },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 20%, rgba(251, 54, 64, 0.09) 0%, #000F08 75%)',
      padding: '2rem 1.5rem',
      paddingTop: '6.5rem',
      boxSizing: 'border-box'
    }}>
      {/* Header Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 2.5rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(251, 54, 64, 0.08)',
          border: '1px solid rgba(251, 54, 64, 0.25)',
          borderRadius: '4px',
          padding: '0.4rem 1.2rem',
          marginBottom: '1rem'
        }}>
          <Calendar size={16} style={{ color: 'var(--accent-orange)' }} />
          <span style={{
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-tech)',
            fontWeight: '700',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontSize: '0.9rem'
          }}>
            Academic Timetable & Schedule
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
          fontWeight: '900',
          fontFamily: 'var(--font-cyber)',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          background: 'linear-gradient(135deg, #ffffff 30%, var(--accent-orange) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 1rem'
        }}>
          CLASS ROUTINE
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
          fontSize: '1.05rem',
          maxWidth: '650px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Access the verified class schedule, lecture timings, lab allocations, and faculty slots.
        </p>
      </div>

      {/* Routine Interactive Viewer Panel */}
      <div 
        className="cyber-panel"
        style={{
          maxWidth: '1200px',
          margin: '0 auto 3rem',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(251, 54, 64, 0.25)',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Toolbar Header */}
        <div style={{
          background: 'rgba(0, 15, 8, 0.85)',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(251, 54, 64, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 8px #10B981'
            }} />
            <span style={{
              color: '#ffffff',
              fontFamily: 'var(--font-tech)',
              fontSize: '1.1rem',
              fontWeight: '700',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              Official Class Routine Schedule
            </span>
          </div>

          {/* Action Control Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleZoomIn}
              className="cyber-btn-wire"
              title="Zoom In"
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
            >
              <ZoomIn size={15} />
              <span>Zoom In</span>
            </button>

            <button
              onClick={handleZoomOut}
              className="cyber-btn-wire"
              title="Zoom Out"
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
            >
              <ZoomOut size={15} />
              <span>Zoom Out</span>
            </button>

            <button
              onClick={handleResetZoom}
              className="cyber-btn-wire"
              title="Reset Zoom"
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
            >
              <RotateCcw size={15} />
              <span>{Math.round(zoomLevel * 100)}%</span>
            </button>

            <button
              onClick={() => setIsFullScreen(true)}
              className="cyber-btn-wire"
              title="Full Screen Preview"
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
            >
              <Maximize2 size={15} />
              <span>Expand</span>
            </button>

            <button
              onClick={handleDownload}
              className="cyber-btn-orange"
              style={{ padding: '0.45rem 1.2rem', fontSize: '0.85rem', clipPath: 'none', borderRadius: '4px' }}
            >
              <Download size={15} />
              <span>Download Image</span>
            </button>
          </div>
        </div>

        {/* Image Display Area with Overflow Pan */}
        <div style={{
          position: 'relative',
          background: 'rgba(0, 5, 2, 0.9)',
          padding: '1.5rem',
          minHeight: '480px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'auto'
        }}>
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

      {/* Weekly Schedule Overview Cards */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 4rem' }}>
        <h3 style={{
          fontFamily: 'var(--font-cyber)',
          fontSize: '1.4rem',
          color: '#ffffff',
          letterSpacing: '0.05em',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <Clock size={20} style={{ color: 'var(--accent-orange)' }} />
          Weekly Schedule Breakdown
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.2rem'
        }}>
          {scheduleHighlights.map((item, idx) => (
            <div
              key={idx}
              className="cyber-panel"
              style={{
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(251, 54, 64, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'var(--accent-orange)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(251, 54, 64, 0.15)';
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.8rem'
                }}>
                  <h4 style={{
                    fontFamily: 'var(--font-cyber)',
                    fontSize: '1.15rem',
                    color: 'var(--accent-orange)',
                    margin: 0
                  }}>
                    {item.day}
                  </h4>
                  <span style={{
                    background: 'rgba(251, 54, 64, 0.08)',
                    border: '1px solid rgba(251, 54, 64, 0.2)',
                    borderRadius: '4px',
                    padding: '0.2rem 0.5rem',
                    fontFamily: 'var(--font-tech)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {item.slots}
                  </span>
                </div>

                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {item.focus}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Modal View */}
      {isFullScreen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 15, 8, 0.97)',
            zIndex: 3000,
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem'
          }}
          onClick={() => setIsFullScreen(false)}
        >
          {/* Modal Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontFamily: 'var(--font-cyber)', color: '#ffffff', fontSize: '1.2rem', margin: 0 }}>
              Full Screen Routine View
            </h3>
            <button
              onClick={() => setIsFullScreen(false)}
              className="cyber-btn-wire"
              style={{ padding: '0.4rem 1rem' }}
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
    </div>
  );
}
