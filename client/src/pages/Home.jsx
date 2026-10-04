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
                  id="hero-explore-btn"
                  aria-label="Explore Course Notes"
                >
                  <div className="play-icon-circle">
                    <Play size={11} style={{ fill: "#ffffff", color: "#ffffff", marginLeft: "1.5px" }} />
                  </div>
                  <span>EXPLORE NOTES</span>
                  <ArrowRight size={14} className="hero-btn-arrow" />
                </button>

                <button
                  onClick={() => nav("/routine")}
                  className="hero-secondary-btn"
                  id="hero-routine-btn"
                  aria-label="View Class Routine"
                >
                  <Calendar size={15} className="hero-secondary-icon" />
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
                  id="hero-lab-btn"
                  title="Configure Linux Lab environment with setup.sh"
                  aria-label="Open Ubuntu Lab Setup"
                >
                  <Terminal size={15} className="hero-secondary-icon terminal-accent" />
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
          gap: 1rem;
          flex-wrap: wrap;
        }

        @media (max-width: 992px) {
          .hero-actions {
            justify-content: center;
            gap: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .hero-actions {
            width: 100%;
            flex-direction: column;
            gap: 0.75rem;
            max-width: 320px;
            margin: 0 auto;
          }
        }

        /* Primary CTA Button: Luminous Modern Crimson */
        .hero-play-btn {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          height: 46px;
          padding: 0 1.35rem 0 0.8rem;
          background: linear-gradient(180deg, #ff3b47 0%, #e0212f 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 10px;
          font-family: var(--font-body);
          font-size: 0.86rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
          box-shadow: 
            inset 0 1px 0 0 rgba(255, 255, 255, 0.35),
            inset 0 -1px 0 0 rgba(0, 0, 0, 0.25),
            0 1px 2px rgba(0, 0, 0, 0.4),
            0 6px 20px -2px rgba(251, 54, 64, 0.35);
        }

        /* Subtle sheen light sweep reflection */
        .hero-play-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -120%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.22), transparent);
          transform: skewX(-22deg);
          transition: left 0.65s cubic-bezier(0.2, 0.8, 0.2, 1);
          pointer-events: none;
        }

        .hero-play-btn:hover::after {
          left: 180%;
        }

        .hero-play-btn:hover {
          transform: translateY(-2px);
          background: linear-gradient(180deg, #ff4c57 0%, #e82634 100%);
          border-color: rgba(255, 255, 255, 0.32);
          box-shadow: 
            inset 0 1px 0 0 rgba(255, 255, 255, 0.45),
            inset 0 -1px 0 0 rgba(0, 0, 0, 0.2),
            0 8px 24px -2px rgba(251, 54, 64, 0.5);
        }

        .hero-play-btn:active {
          transform: translateY(0);
          box-shadow: 
            inset 0 1px 2px rgba(0, 0, 0, 0.35),
            0 2px 8px rgba(251, 54, 64, 0.3);
        }

        .play-icon-circle {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: rgba(0, 0, 0, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .hero-play-btn:hover .play-icon-circle {
          transform: scale(1.05);
          background: rgba(0, 0, 0, 0.24);
        }

        .hero-btn-arrow {
          color: rgba(255, 255, 255, 0.8);
          transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.2s ease;
          flex-shrink: 0;
        }

        .hero-play-btn:hover .hero-btn-arrow {
          transform: translateX(3px);
          color: #ffffff;
        }

        /* Secondary Modern Glass Buttons */
        .hero-secondary-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          height: 46px;
          padding: 0 1.25rem;
          background: rgba(18, 24, 33, 0.65);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 10px;
          font-family: var(--font-body);
          font-size: 0.84rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
          box-shadow: 
            inset 0 1px 0 0 rgba(255, 255, 255, 0.06),
            0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .hero-secondary-btn:hover {
          background: rgba(26, 34, 46, 0.85);
          border-color: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 
            inset 0 1px 0 0 rgba(255, 255, 255, 0.12),
            0 6px 18px rgba(0, 0, 0, 0.45);
        }

        .hero-secondary-btn:active {
          transform: translateY(0);
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .hero-secondary-icon {
          color: #94a3b8;
          transition: color 0.2s ease, transform 0.2s ease;
          flex-shrink: 0;
        }

        .hero-secondary-icon.terminal-accent {
          color: #ff5765;
        }

        .hero-secondary-btn:hover .hero-secondary-icon {
          color: #ffffff;
          transform: scale(1.08);
        }

        .hero-secondary-btn:hover .hero-secondary-icon.terminal-accent {
          color: #ff6b77;
        }

        @media (max-width: 480px) {
          .hero-play-btn,
          .hero-secondary-btn {
            width: 100%;
            justify-content: center;
            height: 44px;
            font-size: 0.82rem;
          }
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