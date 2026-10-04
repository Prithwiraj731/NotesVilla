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
        
        {/* Ambient atmospheric glows */}
        <div style={{
          position: "absolute",
          top: "5%",
          left: "0%",
          width: "45vw",
          height: "45vw",
          background: "radial-gradient(circle, rgba(251, 54, 64, 0.04) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(120px)",
          pointerEvents: "none",
          zIndex: 1
        }} />

        {/* Hero Container */}
        <div className="hero-content-wrapper">
          
          {/* Main 2-Column Hero Stage */}
          <div className="hero-main-stage">
            
            {/* Left Column: Eyebrow, Title Graphic, Tagline & Action Buttons */}
            <div className="hero-left-col">
              
              {/* Eyebrow: Red bar + LEARN • PRACTICE • GROW */}
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-bar" />
                <span className="hero-eyebrow-text">LEARN &nbsp;•&nbsp; PRACTICE &nbsp;•&nbsp; GROW</span>
              </div>

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
                {/* Primary CTA: EXPLORE NOTES */}
                <button
                  onClick={() => nav("/notes")}
                  className="hero-play-btn"
                  id="hero-explore-btn"
                  aria-label="Explore Course Notes"
                >
                  <div className="play-icon-box">
                    <Play size={12} style={{ fill: "#ffffff", color: "#ffffff", marginLeft: "1.5px" }} />
                  </div>
                  <span className="hero-play-text">EXPLORE NOTES</span>
                  <ArrowRight size={16} className="hero-btn-arrow" />
                </button>

                {/* Secondary Button Row: CLASS ROUTINE & LAB SETUP */}
                <div className="hero-secondary-group">
                  <button
                    onClick={() => nav("/routine")}
                    className="hero-secondary-btn"
                    id="hero-routine-btn"
                    aria-label="View Class Routine"
                  >
                    <Calendar size={14} className="hero-secondary-icon" />
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
                    <Terminal size={14} className="hero-secondary-icon terminal-accent" />
                    <span>LAB SETUP</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Character Graphic Showcase */}
            <div className="hero-character-col">
              {/* Red Atmospheric Backlight Under/Behind Character */}
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
            gap: 2rem;
          }
        }

        /* Left Column */
        .hero-left-col {
          display: flex;
          flex-direction: column;
          gap: 1.6rem;
          text-align: left;
          z-index: 6;
          justify-content: center;
        }

        /* Eyebrow Tag: Red Pill + Uppercase Tracked Slogan */
        .hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: -0.35rem;
        }

        .hero-eyebrow-bar {
          width: 32px;
          height: 3px;
          background: linear-gradient(90deg, #ff2338 0%, #ff5263 100%);
          border-radius: 2px;
          box-shadow: 0 0 10px rgba(255, 35, 56, 0.7);
          flex-shrink: 0;
        }

        .hero-eyebrow-text {
          font-family: var(--font-body, system-ui, sans-serif);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: #94a3b8;
          text-transform: uppercase;
          user-select: none;
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
            max-width: 480px;
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
            max-height: 270px;
          }
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .hero-secondary-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        /* Primary CTA Button: Luminous Modern Crimson Pill */
        .hero-play-btn {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          height: 48px;
          padding: 0 1.35rem 0 0.85rem;
          background: linear-gradient(135deg, #ff2338 0%, #ee1628 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 12px;
          font-family: var(--font-body);
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
          box-shadow: 
            inset 0 1px 0 0 rgba(255, 255, 255, 0.35),
            inset 0 -1px 0 0 rgba(0, 0, 0, 0.2),
            0 8px 24px -2px rgba(245, 34, 52, 0.52);
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
          background: linear-gradient(135deg, #ff3649 0%, #f62031 100%);
          border-color: rgba(255, 255, 255, 0.35);
          box-shadow: 
            inset 0 1px 0 0 rgba(255, 255, 255, 0.45),
            0 12px 30px -2px rgba(245, 34, 52, 0.65);
        }

        .hero-play-btn:active {
          transform: translateY(0);
          box-shadow: 
            inset 0 1px 2px rgba(0, 0, 0, 0.35),
            0 4px 12px rgba(251, 54, 64, 0.4);
        }

        .play-icon-box {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: rgba(0, 0, 0, 0.22);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .hero-play-btn:hover .play-icon-box {
          transform: scale(1.06);
          background: rgba(0, 0, 0, 0.28);
        }

        .hero-btn-arrow {
          color: rgba(255, 255, 255, 0.9);
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
          height: 48px;
          padding: 0 1.25rem;
          background: rgba(18, 24, 33, 0.65);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 11px;
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

        /* Right Column: Character */
        .hero-character-col {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 480px;
        }

        @media (max-width: 992px) {
          .hero-character-col {
            min-height: 380px;
          }
        }

        /* Ambient Subtle Light Under/Behind Character */
        .char-glow-underlay {
          position: absolute;
          width: 130%;
          height: 120%;
          max-width: 550px;
          max-height: 500px;
          background: radial-gradient(ellipse at 52% 48%, rgba(251, 54, 64, 0.18) 0%, rgba(251, 54, 64, 0.05) 45%, transparent 70%);
          filter: blur(60px);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 1;
        }

        .hero-character-img {
          width: 100%;
          max-width: 450px;
          max-height: 520px;
          height: auto;
          object-fit: contain;
          z-index: 4;
          display: block;
          filter: drop-shadow(0 0 25px rgba(255, 30, 45, 0.2)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.85));
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

        /* =========================================================================
           MOBILE MATCH MEDIA (< 768px): Modern Centered & Balanced Layout
           ========================================================================= */
        @media (max-width: 768px) {
          .cinematic-hero {
            min-height: auto;
            padding: 4.8rem 1.25rem 2rem;
            position: relative;
            overflow: hidden;
            background: 
              radial-gradient(ellipse at 50% 10%, rgba(251, 54, 64, 0.12) 0%, rgba(251, 54, 64, 0.02) 50%, transparent 70%),
              #070a0f;
          }

          .hero-content-wrapper {
            width: 100%;
            max-width: 480px;
            margin: 0 auto;
          }

          .hero-main-stage {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 1.5rem;
            min-height: auto;
            position: relative;
            width: 100%;
          }

          /* Left Column (Content & CTAs) - Centered & Balanced */
          .hero-left-col {
            position: relative;
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            width: 100%;
            max-width: 360px;
            margin: 0 auto;
            gap: 1.2rem;
          }

          /* Eyebrow: Centered Glowing Pill Tag */
          .hero-eyebrow {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            margin: 0 auto;
            padding: 0.35rem 0.95rem;
            background: rgba(251, 54, 64, 0.07);
            border: 1px solid rgba(251, 54, 64, 0.22);
            border-radius: 999px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }

          .hero-eyebrow-bar {
            width: 14px;
            height: 2.5px;
            background: #ff283d;
            border-radius: 2px;
            box-shadow: 0 0 8px #ff283d;
          }

          .hero-eyebrow-text {
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.15em;
            color: #cbd5e1;
            white-space: nowrap;
          }

          /* Title Graphic Image: Centered & Properly Sized */
          .hero-title-container {
            width: 100%;
            max-width: 320px;
            margin: 0 auto;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .hero-title-img {
            width: 100%;
            max-height: 145px;
            height: auto;
            object-fit: contain;
            object-position: center;
            display: block;
            margin: 0 auto;
            filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.75));
          }

          /* Action Buttons: Centered, Equal Width Grid, Proper Touch Ergonomics */
          .hero-actions {
            width: 100%;
            max-width: 340px;
            margin: 0.25rem auto 0;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          /* Primary CTA: Full width, vibrant crimson glow, balanced play icon, bold text & arrow */
          .hero-play-btn {
            width: 100%;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 1.25rem 0 0.85rem;
            border-radius: 13px;
            background: linear-gradient(135deg, #ff2338 0%, #dc1427 100%);
            border: 1px solid rgba(255, 255, 255, 0.25);
            box-shadow: 
              inset 0 1px 0 0 rgba(255, 255, 255, 0.38),
              0 8px 25px -2px rgba(245, 34, 52, 0.58);
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .hero-play-btn:active {
            transform: scale(0.985);
            box-shadow: 0 4px 14px rgba(245, 34, 52, 0.45);
          }

          .play-icon-box {
            width: 30px;
            height: 30px;
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.18);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .hero-play-text {
            flex: 1;
            text-align: center;
            font-size: 0.88rem;
            font-weight: 700;
            letter-spacing: 0.05em;
            color: #ffffff;
            margin: 0 0.5rem;
          }

          .hero-btn-arrow {
            color: rgba(255, 255, 255, 0.95);
            flex-shrink: 0;
          }

          /* Secondary Button Group: Exact 50/50 2-column grid, beautifully aligned */
          .hero-secondary-group {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }

          .hero-secondary-btn {
            width: 100%;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0 0.7rem;
            font-size: 0.76rem;
            font-weight: 600;
            letter-spacing: 0.04em;
            white-space: nowrap;
            border-radius: 11px;
            background: rgba(18, 24, 34, 0.78);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #e2e8f0;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 
              inset 0 1px 0 0 rgba(255, 255, 255, 0.08),
              0 4px 14px rgba(0, 0, 0, 0.35);
            transition: all 0.2s ease;
          }

          .hero-secondary-btn:active {
            transform: scale(0.98);
            background: rgba(26, 35, 48, 0.95);
            border-color: rgba(255, 255, 255, 0.2);
          }

          .hero-secondary-icon {
            width: 15px;
            height: 15px;
            flex-shrink: 0;
          }

          /* Right Column (Character) - Centered & Featured */
          .hero-character-col {
            position: relative;
            width: 100%;
            max-width: 290px;
            margin: 0.5rem auto 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: auto;
            z-index: 2;
            pointer-events: none;
            right: auto;
            bottom: auto;
            left: auto;
            transform: none;
          }

          .hero-character-img {
            width: 100%;
            max-width: 270px;
            height: auto;
            object-fit: contain;
            object-position: center;
            display: block;
            margin: 0 auto;
            -webkit-mask-image: linear-gradient(to bottom, #000 72%, transparent 98%);
            mask-image: linear-gradient(to bottom, #000 72%, transparent 98%);
            filter: 
              drop-shadow(0 0 35px rgba(255, 30, 45, 0.35)) 
              drop-shadow(0 20px 40px rgba(0, 0, 0, 0.95));
            animation: heroFloatMobile 6s ease-in-out infinite alternate;
          }

          .char-glow-underlay {
            position: absolute;
            width: 130%;
            height: 130%;
            top: 50%;
            left: 50%;
            right: auto;
            bottom: auto;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle, rgba(255, 35, 55, 0.3) 0%, rgba(255, 20, 35, 0.08) 45%, transparent 70%);
            filter: blur(45px);
            pointer-events: none;
            z-index: 1;
          }

          .vertical-pagination {
            display: none;
          }

          @keyframes heroFloatMobile {
            0% {
              transform: translateX(6px) translateY(0);
            }
            100% {
              transform: translateX(6px) translateY(-8px);
            }
          }

          @media (max-width: 360px) {
            .hero-actions {
              max-width: 100%;
            }
            .hero-secondary-btn {
              font-size: 0.69rem;
              padding: 0 0.35rem;
              gap: 0.35rem;
            }
            .hero-secondary-icon {
              width: 13px;
              height: 13px;
            }
            .hero-character-col {
              max-width: 240px;
            }
            .hero-character-img {
              max-width: 230px;
            }
          }
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