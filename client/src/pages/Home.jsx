import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  BookOpen, 
  Layers, 
  Calendar, 
  Play, 
  ChevronRight, 
  Sparkles,
  FileText,
  Clock,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const nav = useNavigate();
  const [dynamicSubjects, setDynamicSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDynamicSubjects();
  }, []);

  const loadDynamicSubjects = async () => {
    try {
      setLoading(true);
      const res = await API.get('/notes/subjects');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setDynamicSubjects(res.data.map(s => s.name || s));
      } else {
        setDynamicSubjects([]);
      }
    } catch (err) {
      console.error("Error loading subjects:", err);
      setDynamicSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page-container">
      
      {/* =========================================================================
          MINIMALIST CINEMATIC HERO SECTION (Title Graphic, Character & Action Buttons)
          ========================================================================= */}
      <section className="cinematic-hero">
        
        {/* Background Ambient Radial Glow */}
        <div style={{
          position: "absolute",
          top: "5%",
          left: "0%",
          width: "55vw",
          height: "55vw",
          background: "radial-gradient(circle, rgba(251, 54, 64, 0.16) 0%, transparent 65%)",
          borderRadius: "50%",
          filter: "blur(90px)",
          pointerEvents: "none",
          zIndex: 1
        }} />

        <div style={{
          position: "absolute",
          top: "10%",
          right: "5%",
          width: "45vw",
          height: "45vw",
          background: "radial-gradient(circle, rgba(251, 54, 64, 0.1) 0%, transparent 65%)",
          borderRadius: "50%",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 1
        }} />

        {/* Hero Container */}
        <div className="hero-content-wrapper">
          
          {/* Main 2-Column Hero Stage */}
          <div className="hero-main-stage">
            
            {/* Left Column: Title Graphic & Action Buttons */}
            <div className="hero-left-col">
              
              {/* NOTES VILLA Title Graphic Image */}
              <div className="hero-title-container">
                <img 
                  src="/hero_text.png" 
                  alt="NOTES VILLA" 
                  className="hero-title-img"
                />
              </div>

              {/* Action Buttons */}
              <div className="hero-actions">
                <button
                  onClick={() => nav("/notes")}
                  className="hero-play-btn"
                >
                  <div className="play-icon-circle">
                    <Play size={13} style={{ fill: "#ffffff", color: "#ffffff", marginLeft: "2px" }} />
                  </div>
                  <span>EXPLORE NOTES</span>
                </button>

                <button
                  onClick={() => nav("/routine")}
                  className="hero-secondary-btn"
                >
                  <Calendar size={16} />
                  <span>CLASS ROUTINE</span>
                </button>
              </div>
            </div>

            {/* Right Column: Character Graphic Showcase */}
            <div className="hero-character-col">
              {/* Radial Light Under Character */}
              <div className="char-glow-underlay" />
              
              {/* White Sci-Fi Student Character */}
              <img 
                src="/photo1.png" 
                alt="NotesVilla Student Character" 
                className="hero-character-img"
              />

              {/* Vertical Edge Pagination Dots */}
              <div className="vertical-pagination">
                <span className="dot active" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          DYNAMIC ACADEMIC DISCIPLINES SECTION (Reflects DB Uploads)
          ========================================================================= */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem 1.5rem 4rem", position: "relative", zIndex: 5 }}>
        <div 
          className="cyber-panel"
          style={{
            borderRadius: "12px",
            padding: "2.5rem 2rem",
            border: "1px solid rgba(251, 54, 64, 0.2)",
            background: "rgba(0, 15, 8, 0.85)",
            marginBottom: "3rem"
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "var(--font-cyber)", fontSize: "1.6rem", color: "#ffffff", marginBottom: "0.4rem", textTransform: "uppercase" }}>
              ACADEMIC REPOSITORY
            </h2>
            <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto" }}>
              Browse lecture notes, continuous study materials, and subject resources uploaded for your current academic session.
            </p>
          </div>

          {/* Dynamic Subject Cards or Clean Empty State */}
          {dynamicSubjects.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.2rem"
            }}>
              {dynamicSubjects.map((subjName, idx) => (
                <div
                  key={idx}
                  onClick={() => nav(`/notes?subject=${encodeURIComponent(subjName)}`)}
                  className="cyber-panel"
                  style={{
                    borderRadius: "8px",
                    padding: "1.5rem",
                    border: "1px solid rgba(251, 54, 64, 0.18)",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.borderColor = "var(--accent-orange)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(251, 54, 64, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "rgba(251, 54, 64, 0.18)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <div style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "6px",
                      background: "rgba(251, 54, 64, 0.1)",
                      border: "1px solid rgba(251, 54, 64, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-orange)",
                      marginBottom: "1rem"
                    }}>
                      <BookOpen size={18} />
                    </div>
                    <h3 style={{ fontFamily: "var(--font-cyber)", fontSize: "1.1rem", color: "#ffffff", marginBottom: "0.4rem" }}>
                      {subjName}
                    </h3>
                    <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.85rem", margin: "0 0 1rem 0" }}>
                      View date-wise lecture notes archive, preview documents, and download PDFs.
                    </p>
                  </div>
                  <span style={{ color: "var(--accent-orange)", fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    Open Notes <ChevronRight size={14} />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: "center",
              padding: "2.5rem 1.5rem",
              background: "rgba(0, 5, 2, 0.6)",
              border: "1px dashed rgba(251, 54, 64, 0.25)",
              borderRadius: "8px"
            }}>
              <BookOpen size={36} style={{ color: "var(--accent-orange)", margin: "0 auto 0.8rem", opacity: 0.8 }} />
              <h3 style={{ fontFamily: "var(--font-cyber)", fontSize: "1.2rem", color: "#ffffff", marginBottom: "0.4rem" }}>
                NO SUBJECT NOTES UPLOADED YET
              </h3>
              <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.9rem", maxWidth: "500px", margin: "0 auto 1.5rem" }}>
                Subjects and notes uploaded from the admin portal will automatically appear here in real-time.
              </p>
              <button
                onClick={() => nav("/notes")}
                className="cyber-btn-wire"
                style={{ padding: "0.6rem 1.5rem", fontSize: "0.9rem" }}
              >
                <span>Browse All Notes</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scoped CSS styling for Minimalist Hero Section */}
      <style jsx>{`
        .home-page-container {
          position: relative;
          min-height: 100vh;
          background: #000F08;
          overflow-x: hidden;
          width: 100%;
          box-sizing: border-box;
        }

        .cinematic-hero {
          position: relative;
          width: 100%;
          padding: 6.5rem 1.5rem 3.5rem;
          box-sizing: border-box;
          overflow: hidden;
        }

        .hero-content-wrapper {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 5;
        }

        .hero-main-stage {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          align-items: center;
          gap: 3rem;
          min-height: 480px;
        }

        @media (max-width: 992px) {
          .hero-main-stage {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }

        /* Left Column */
        .hero-left-col {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          text-align: left;
          z-index: 6;
          justify-content: center;
        }

        @media (max-width: 992px) {
          .hero-left-col {
            text-align: center;
            align-items: center;
          }
        }

        .hero-title-container {
          width: 100%;
          max-width: 480px;
        }

        @media (max-width: 992px) {
          .hero-title-container {
            margin: 0 auto;
          }
        }

        .hero-title-img {
          width: 100%;
          max-height: 220px;
          height: auto;
          object-fit: contain;
          object-position: left center;
          display: block;
          filter: drop-shadow(0 0 30px rgba(251, 54, 64, 0.45));
          user-select: none;
        }

        @media (max-width: 992px) {
          .hero-title-img {
            object-position: center;
          }
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        @media (max-width: 992px) {
          .hero-actions {
            justify-content: center;
          }
        }

        .hero-play-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--accent-orange);
          color: #000000;
          border: none;
          border-radius: 30px;
          padding: 0.8rem 1.8rem 0.8rem 0.8rem;
          font-family: var(--font-cyber);
          font-size: 0.95rem;
          font-weight: 900;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 4px 25px rgba(251, 54, 64, 0.5), 0 0 10px rgba(251, 54, 64, 0.3);
        }

        .hero-play-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 35px rgba(251, 54, 64, 0.7), 0 0 15px rgba(251, 54, 64, 0.5);
          background: #ffffff;
        }

        .play-icon-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.2);
        }

        .hero-secondary-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          background: rgba(251, 54, 64, 0.08);
          color: #ffffff;
          border: 1px solid rgba(251, 54, 64, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 30px;
          padding: 0.85rem 1.8rem;
          font-family: var(--font-cyber);
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .hero-secondary-btn:hover {
          background: rgba(251, 54, 64, 0.2);
          border-color: var(--accent-orange);
          color: var(--accent-orange);
          transform: translateY(-3px);
          box-shadow: 0 6px 25px rgba(251, 54, 64, 0.25);
        }

        /* Right Column: Character */
        .hero-character-col {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 440px;
        }

        .char-glow-underlay {
          position: absolute;
          width: 360px;
          height: 360px;
          background: radial-gradient(circle, rgba(251, 54, 64, 0.3) 0%, transparent 70%);
          filter: blur(60px);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          zIndex: 1;
        }

        .hero-character-img {
          width: 100%;
          max-width: 440px;
          max-height: 480px;
          height: auto;
          object-fit: contain;
          z-index: 4;
          display: block;
          filter: drop-shadow(0 20px 40px rgba(251, 54, 64, 0.3)) drop-shadow(0 10px 30px rgba(0, 0, 0, 0.8));
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 85%, rgba(0, 0, 0, 0) 100%);
          -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 85%, rgba(0, 0, 0, 0) 100%);
        }

        .vertical-pagination {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          z-index: 5;
        }

        @media (max-width: 992px) {
          .vertical-pagination {
            display: none;
          }
        }

        .vertical-pagination .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.25);
          transition: all 0.2s ease;
        }

        .vertical-pagination .dot.active {
          height: 18px;
          border-radius: 4px;
          background: var(--accent-orange);
          box-shadow: 0 0 8px var(--accent-orange);
        }
      `}</style>
    </div>
  );
}