import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import UbuntuLabSetup from "../components/UbuntuLabSetup";
import { getCachedData, setCachedData } from "../utils/cacheUtils";
import { 
  BookOpen, 
  Layers, 
  Calendar, 
  Play, 
  ChevronRight, 
  Sparkles,
  FileText,
  Clock,
  ArrowRight,
  Terminal
} from "lucide-react";

export default function Home() {
  const nav = useNavigate();
  const [dynamicSubjects, setDynamicSubjects] = useState(() => {
    const cached = getCachedData('subjects_list');
    return Array.isArray(cached) ? cached.map(s => s.name || s) : [];
  });
  const [loading, setLoading] = useState(() => !getCachedData('subjects_list'));

  useEffect(() => {
    loadDynamicSubjects();
  }, []);

  const loadDynamicSubjects = async () => {
    try {
      if (!getCachedData('subjects_list')) {
        setLoading(true);
      }
      const res = await API.get('/notes/subjects');
      if (Array.isArray(res.data) && res.data.length > 0) {
        const subjects = res.data.map(s => s.name || s);
        setDynamicSubjects(subjects);
        setCachedData('subjects_list', res.data);
      }
    } catch (err) {
      console.error("Error loading subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page-container">
      
      {/* =========================================================================
          MINIMALIST CINEMATIC HERO SECTION
          ========================================================================= */}
      <section className="cinematic-hero">
        
        {/* Subtle, soft ambient atmospheric glows */}
        <div style={{
          position: "absolute",
          top: "5%",
          left: "0%",
          width: "50vw",
          height: "50vw",
          background: "radial-gradient(circle, rgba(251, 54, 64, 0.04) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(120px)",
          pointerEvents: "none",
          zIndex: 1
        }} />

        <div style={{
          position: "absolute",
          top: "10%",
          right: "5%",
          width: "40vw",
          height: "40vw",
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(100px)",
          pointerEvents: "none",
          zIndex: 1
        }} />

        {/* Hero Container */}
        <div className="hero-content-wrapper">
          
          {/* Main 2-Column Hero Stage */}
          <div className="hero-main-stage">
            
            {/* Left Column: Title Graphic & Action Buttons */}
            <div className="hero-left-col">
              
              {/* KNOWLEDGE DOCK Title Graphic Image */}
              <div className="hero-title-container">
                <img 
                  src="/hero_text_main.png" 
                  alt="KNOWLEDGE DOCK" 
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

                <button
                  onClick={() => {
                    const el = document.getElementById('lab-setup');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      nav('/lab-setup');
                    }
                  }}
                  className="hero-secondary-btn"
                  title="Configure Linux Lab environment with setup.sh"
                >
                  <Terminal size={16} style={{ color: 'var(--accent-orange)' }} />
                  <span>LAB SETUP</span>
                </button>
              </div>
            </div>

            {/* Right Column: Character Graphic Showcase */}
            <div className="hero-character-col">
              {/* Subtle Ambient Light Under Character */}
              <div className="char-glow-underlay" />
              
              {/* White Sci-Fi Student Character */}
              <img 
                src="/photo1.png" 
                alt="Knowledge Dock Academic Character" 
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
      <div className="home-repo-container">
        <div 
          className="cyber-panel home-repo-panel"
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "var(--font-cyber)", fontSize: "clamp(1.25rem, 3.5vw, 1.6rem)", color: "#ffffff", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              ACADEMIC REPOSITORY
            </h2>
            <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.92rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.55" }}>
              Browse lecture notes, continuous study materials, and subject resources uploaded for your current academic session.
            </p>
          </div>

          {/* Dynamic Subject Cards or Clean Empty State */}
          {dynamicSubjects.length > 0 ? (
            <div className="home-subjects-grid">
              {dynamicSubjects.map((subjName, idx) => (
                <div
                  key={idx}
                  onClick={() => nav(`/notes?subject=${encodeURIComponent(subjName)}`)}
                  className="cyber-panel home-subject-card"
                >
                  <div>
                    <div style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "8px",
                      background: "rgba(251, 54, 64, 0.08)",
                      border: "1px solid rgba(251, 54, 64, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-orange)",
                      marginBottom: "1rem"
                    }}>
                      <BookOpen size={18} />
                    </div>
                    <h3 style={{ fontFamily: "var(--font-cyber)", fontSize: "1.05rem", color: "#ffffff", marginBottom: "0.4rem", lineHeight: "1.3" }}>
                      {subjName}
                    </h3>
                    <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.85rem", margin: "0 0 1rem 0", lineHeight: "1.5" }}>
                      View date-wise lecture notes archive, preview documents, and download PDFs.
                    </p>
                  </div>
                  <span style={{ color: "var(--accent-orange)", fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    Open Notes <ChevronRight size={14} />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: "center",
              padding: "2.5rem 1.25rem",
              background: "rgba(15, 20, 28, 0.5)",
              border: "1px dashed rgba(255, 255, 255, 0.12)",
              borderRadius: "10px"
            }}>
              <BookOpen size={36} style={{ color: "var(--text-muted)", margin: "0 auto 0.8rem", opacity: 0.8 }} />
              <h3 style={{ fontFamily: "var(--font-cyber)", fontSize: "1.15rem", color: "#ffffff", marginBottom: "0.4rem" }}>
                NO SUBJECT NOTES UPLOADED YET
              </h3>
              <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.88rem", maxWidth: "500px", margin: "0 auto 1.5rem", lineHeight: "1.55" }}>
                Subjects and notes uploaded from the admin portal will automatically appear here in real-time.
              </p>
              <button
                onClick={() => nav("/notes")}
                className="cyber-btn-wire"
                style={{ padding: "0.6rem 1.4rem", fontSize: "0.88rem" }}
              >
                <span>Browse All Notes</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          LINUX LAB ENVIRONMENT & UBUNTU SETUP SECTION
          ========================================================================= */}
      <UbuntuLabSetup />

      {/* Scoped CSS styling for Minimalist Hero Section */}
      <style jsx>{`
        .home-page-container {
          position: relative;
          min-height: 100vh;
          background: var(--bg-primary);
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

        @media (max-width: 992px) {
          .cinematic-hero {
            padding: 5.5rem 1.5rem 2.5rem;
          }
        }

        @media (max-width: 640px) {
          .cinematic-hero {
            padding: 4.8rem 1rem 1.8rem;
          }
        }

        .hero-content-wrapper {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 5;
        }

        .hero-main-stage {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          align-items: center;
          gap: 2.5rem;
          min-height: 480px;
        }

        @media (max-width: 992px) {
          .hero-main-stage {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 2.2rem;
            min-height: auto;
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
            gap: 1.5rem;
          }
        }

        .hero-title-container {
          width: 100%;
          max-width: 640px;
        }

        @media (max-width: 1200px) {
          .hero-title-container {
            max-width: 560px;
          }
        }

        @media (max-width: 992px) {
          .hero-title-container {
            margin: 0 auto;
            max-width: 480px;
          }
        }

        @media (max-width: 640px) {
          .hero-title-container {
            max-width: 410px;
          }
        }

        @media (max-width: 480px) {
          .hero-title-container {
            max-width: 350px;
          }
        }

        .hero-title-img {
          width: 100%;
          max-height: 330px;
          height: auto;
          object-fit: contain;
          object-position: left center;
          display: block;
          filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.6));
          user-select: none;
        }

        @media (max-width: 992px) {
          .hero-title-img {
            object-position: center;
            max-height: 270px;
          }
        }

        @media (max-width: 640px) {
          .hero-title-img {
            max-height: 230px;
          }
        }

        @media (max-width: 480px) {
          .hero-title-img {
            max-height: 195px;
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
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          .hero-actions {
            width: 100%;
            flex-direction: column;
            gap: 0.75rem;
            max-width: 300px;
            margin: 0 auto;
          }
        }

        .hero-play-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--accent-orange);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 0.8rem 1.8rem 0.8rem 0.8rem;
          font-family: var(--font-cyber);
          font-size: 0.92rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
          box-shadow: 0 4px 14px rgba(251, 54, 64, 0.3);
        }

        @media (max-width: 480px) {
          .hero-play-btn {
            width: 100%;
            justify-content: center;
            padding: 0.7rem 1.4rem 0.7rem 0.7rem;
            font-size: 0.85rem;
          }
        }

        .hero-play-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 22px rgba(251, 54, 64, 0.45);
          background: var(--accent-hover);
        }

        .play-icon-circle {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .play-icon-circle {
            width: 28px;
            height: 28px;
          }
        }

        .hero-secondary-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          background: rgba(255, 255, 255, 0.04);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 8px;
          padding: 0.8rem 1.6rem;
          font-family: var(--font-cyber);
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @media (max-width: 480px) {
          .hero-secondary-btn {
            width: 100%;
            justify-content: center;
            padding: 0.75rem 1.4rem;
            font-size: 0.85rem;
          }
        }

        .hero-secondary-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.25);
          color: #ffffff;
          transform: translateY(-2px);
        }

        /* Right Column: Character */
        .hero-character-col {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 460px;
        }

        @media (max-width: 992px) {
          .hero-character-col {
            min-height: 340px;
          }
        }

        @media (max-width: 640px) {
          .hero-character-col {
            min-height: 260px;
          }
        }

        /* Ambient Subtle Light Under Character */
        .char-glow-underlay {
          position: absolute;
          width: 130%;
          height: 120%;
          max-width: 550px;
          max-height: 500px;
          background: radial-gradient(ellipse at 52% 48%, rgba(251, 54, 64, 0.08) 0%, transparent 70%);
          filter: blur(60px);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 1;
        }

        .hero-character-img {
          width: 100%;
          max-width: 440px;
          max-height: 480px;
          height: auto;
          object-fit: contain;
          z-index: 4;
          display: block;
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.8));
          mask-image: radial-gradient(ellipse 74% 75% at 48% 50%, #000000 40%, rgba(0, 0, 0, 0.92) 56%, rgba(0, 0, 0, 0.35) 70%, transparent 82%);
          -webkit-mask-image: radial-gradient(ellipse 74% 75% at 48% 50%, #000000 40%, rgba(0, 0, 0, 0.92) 56%, rgba(0, 0, 0, 0.35) 70%, transparent 82%);
        }

        @media (max-width: 992px) {
          .hero-character-img {
            max-width: 350px;
            max-height: 370px;
          }
        }

        @media (max-width: 640px) {
          .hero-character-img {
            max-width: 260px;
            max-height: 280px;
          }
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
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.2s ease;
        }

        .vertical-pagination .dot.active {
          height: 18px;
          border-radius: 4px;
          background: var(--accent-orange);
          box-shadow: 0 0 8px rgba(251, 54, 64, 0.5);
        }

        /* Academic Repository Section Styles */
        .home-repo-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 4rem;
          position: relative;
          z-index: 5;
        }

        @media (max-width: 768px) {
          .home-repo-container {
            padding: 0.8rem 1.1rem 3rem;
          }
        }

        .home-repo-panel {
          border-radius: 12px;
          padding: 2.5rem 2rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(15, 20, 28, 0.72);
          margin-bottom: 2.5rem;
        }

        @media (max-width: 768px) {
          .home-repo-panel {
            padding: 1.6rem 1.1rem;
            margin-bottom: 2rem;
            border-radius: 10px;
          }
        }

        .home-subjects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
          gap: 1.2rem;
        }

        @media (max-width: 640px) {
          .home-subjects-grid {
            gap: 0.9rem;
          }
        }

        .home-subject-card {
          border-radius: 10px;
          padding: 1.4rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(18, 24, 33, 0.6);
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .home-subject-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(22, 29, 40, 0.75);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }

        @media (max-width: 640px) {
          .home-subject-card {
            padding: 1.15rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}