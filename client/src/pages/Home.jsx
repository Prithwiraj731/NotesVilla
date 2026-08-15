import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  BookOpen, 
  Layers, 
  Database, 
  Code, 
  Calendar, 
  HelpCircle, 
  Sparkles, 
  Play, 
  ChevronRight, 
  Cpu,
  FileText
} from "lucide-react";

export default function Home() {
  const nav = useNavigate();

  const subjectsData = [
    {
      id: "dsa",
      label: "DSA",
      name: "Data Structures & Algorithms",
      shortDesc: "Master tree algorithms, dynamic programming, graph theory, and asymptotic complexity.",
      icon: Layers,
      color: "#FB3640",
      dbQuery: "Data Structures & Algorithms"
    },
    {
      id: "fullstack",
      label: "WEB",
      name: "Full Stack Development",
      shortDesc: "Build enterprise web architectures with React 19, Node.js, REST APIs, and MongoDB.",
      icon: Code,
      color: "#FB3640",
      dbQuery: "Full Stack Development"
    },
    {
      id: "database",
      label: "DBMS",
      name: "Database Systems",
      shortDesc: "Design robust relational schemas, normalization strategies, SQL queries, and transaction locking.",
      icon: Database,
      color: "#FB3640",
      dbQuery: "Database Systems"
    },
    {
      id: "os",
      label: "OS",
      name: "Operating Systems",
      shortDesc: "Understand kernel architectures, process scheduling, concurrency primitives, and virtual memory.",
      icon: Cpu,
      color: "#FB3640",
      dbQuery: "Operating Systems"
    }
  ];

  const [activeSubject, setActiveSubject] = useState(subjectsData[0]);

  return (
    <div className="home-page-container">
      
      {/* =========================================================================
          CINEMATIC HERO SECTION (Direct Reference Style: Title Graphic & Character)
          ========================================================================= */}
      <section className="cinematic-hero">
        
        {/* Background Ambient Radial Glow */}
        <div style={{
          position: "absolute",
          top: "10%",
          left: "5%",
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
          top: "20%",
          right: "10%",
          width: "40vw",
          height: "40vw",
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
            
            {/* Left Column: Title Image, Description & Action Buttons */}
            <div className="hero-left-col">
              
              {/* Category Pill */}
              <div className="hero-badge">
                <Sparkles size={14} style={{ color: "var(--accent-orange)" }} />
                <span>Curated Academic Knowledge Repository</span>
              </div>

              {/* NOTES VILLA Title Graphic Image */}
              <div className="hero-title-container">
                <img 
                  src="/hero_text.png" 
                  alt="NotesVilla" 
                  className="hero-title-img"
                />
              </div>

              {/* Narrative Subtitle */}
              <p className="hero-narrative">
                Hundreds of engineering & science scholars access lecture notes in chronological continuity, official class routine timetables, modular syllabi, and model practice question sets.
              </p>

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

          {/* Bottom Interactive Feature Tracks Strip (01, 02, 03) */}
          <div className="hero-bottom-tracks">
            <div 
              onClick={() => nav("/routine")}
              className="track-item"
            >
              <div className="track-index">01</div>
              <div className="track-info">
                <div className="track-title">CLASS ROUTINE</div>
                <div className="track-sub">Daily verified timetable & lab timings</div>
              </div>
            </div>

            <div 
              onClick={() => nav("/syllabus")}
              className="track-item"
            >
              <div className="track-index">02</div>
              <div className="track-info">
                <div className="track-title">COURSE SYLLABUS</div>
                <div className="track-sub">Modular unit guides & standard texts</div>
              </div>
            </div>

            <div 
              onClick={() => nav("/practice")}
              className="track-item"
            >
              <div className="track-index">03</div>
              <div className="track-info">
                <div className="track-title">PRACTICE SETS & PYQS</div>
                <div className="track-sub">Model exam papers & problem sets</div>
              </div>
            </div>

            <div 
              onClick={() => nav("/notes")}
              className="track-item"
            >
              <div className="track-index">04</div>
              <div className="track-info">
                <div className="track-title">LECTURE ARCHIVE</div>
                <div className="track-sub">100% Free instant PDF downloads</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE SUBJECT SHOWCASE
          ========================================================================= */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem 4rem", position: "relative", zIndex: 5 }}>
        <div 
          className="cyber-panel"
          style={{
            borderRadius: "12px",
            padding: "2.5rem 2rem",
            border: "1px solid rgba(251, 54, 64, 0.2)",
            background: "rgba(0, 15, 8, 0.85)",
            marginBottom: "4rem"
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "var(--font-cyber)", fontSize: "1.6rem", color: "#ffffff", marginBottom: "0.4rem", textTransform: "uppercase" }}>
              CORE ACADEMIC DISCIPLINES
            </h2>
            <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto" }}>
              Select a discipline to jump straight into its lecture notes archive and curriculum guides.
            </p>
          </div>

          {/* Subject Pills */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginBottom: "2rem"
          }}>
            {subjectsData.map((subj) => {
              const isSelected = activeSubject.id === subj.id;
              const Icon = subj.icon;
              return (
                <button
                  key={subj.id}
                  onClick={() => setActiveSubject(subj)}
                  style={{
                    background: isSelected ? "var(--accent-orange)" : "rgba(251, 54, 64, 0.05)",
                    color: isSelected ? "#000000" : "var(--text-secondary)",
                    border: isSelected ? "1px solid var(--accent-orange)" : "1px solid rgba(251, 54, 64, 0.2)",
                    borderRadius: "6px",
                    padding: "0.55rem 1.3rem",
                    fontFamily: "var(--font-body)",
                    fontWeight: isSelected ? "700" : "600",
                    fontSize: "0.92rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    transition: "all 0.2s ease"
                  }}
                >
                  <Icon size={16} />
                  <span>{subj.name}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Subject Box */}
          <div style={{
            background: "rgba(0, 5, 2, 0.7)",
            border: "1px solid rgba(251, 54, 64, 0.15)",
            borderRadius: "8px",
            padding: "1.8rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.5rem"
          }}>
            <div>
              <h3 style={{
                fontFamily: "var(--font-cyber)",
                fontSize: "1.35rem",
                color: "#ffffff",
                marginBottom: "0.4rem"
              }}>
                {activeSubject.name}
              </h3>
              <p style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-body)",
                fontSize: "0.95rem",
                maxWidth: "600px",
                lineHeight: "1.6",
                margin: 0
              }}>
                {activeSubject.shortDesc}
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <button
                onClick={() => nav(`/notes?subject=${encodeURIComponent(activeSubject.dbQuery)}`)}
                className="cyber-btn-orange"
                style={{ padding: "0.6rem 1.4rem", fontSize: "0.9rem" }}
              >
                <BookOpen size={16} />
                <span>Open Subject Notes</span>
              </button>

              <button
                onClick={() => nav("/syllabus")}
                className="cyber-btn-wire"
                style={{ padding: "0.6rem 1.4rem", fontSize: "0.9rem" }}
              >
                <Layers size={16} />
                <span>View Syllabus</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scoped CSS styling for Cinematic Hero Section */}
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
          padding: 6.5rem 1.5rem 3rem;
          box-sizing: border-box;
          overflow: hidden;
        }

        .hero-content-wrapper {
          max-width: 1320px;
          margin: 0 auto;
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .hero-main-stage {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          align-items: center;
          gap: 2rem;
          min-height: 520px;
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
          gap: 1.25rem;
          text-align: left;
          z-index: 6;
        }

        @media (max-width: 992px) {
          .hero-left-col {
            text-align: center;
            align-items: center;
          }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(251, 54, 64, 0.08);
          border: 1px solid rgba(251, 54, 64, 0.3);
          border-radius: 30px;
          padding: 0.35rem 1.1rem;
          box-shadow: 0 0 15px rgba(251, 54, 64, 0.15);
          width: fit-content;
          color: #ffffff;
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .hero-title-container {
          width: 100%;
          max-width: 520px;
        }

        .hero-title-img {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 0 25px rgba(251, 54, 64, 0.45));
          user-select: none;
        }

        .hero-narrative {
          color: var(--text-secondary);
          font-size: 1.05rem;
          line-height: 1.65;
          max-width: 520px;
          font-family: var(--font-body);
          margin: 0;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
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
          padding: 0.65rem 1.6rem 0.65rem 0.75rem;
          font-family: var(--font-cyber);
          font-size: 0.95rem;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 25px rgba(251, 54, 64, 0.45);
        }

        .hero-play-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 35px rgba(251, 54, 64, 0.65);
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
        }

        .hero-secondary-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(251, 54, 64, 0.08);
          color: #ffffff;
          border: 1px solid rgba(251, 54, 64, 0.35);
          border-radius: 30px;
          padding: 0.75rem 1.6rem;
          font-family: var(--font-cyber);
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hero-secondary-btn:hover {
          background: rgba(251, 54, 64, 0.18);
          border-color: var(--accent-orange);
          color: var(--accent-orange);
          transform: translateY(-2px);
        }

        /* Right Column: Character */
        .hero-character-col {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 480px;
        }

        .char-glow-underlay {
          position: absolute;
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, rgba(251, 54, 64, 0.3) 0%, transparent 70%);
          filter: blur(60px);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 1;
        }

        .hero-character-img {
          width: 100%;
          max-width: 480px;
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

        /* Bottom Feature Tracks */
        .hero-bottom-tracks {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(251, 54, 64, 0.15);
          position: relative;
          z-index: 5;
        }

        .track-item {
          display: flex;
          align-items: flex-start;
          gap: 0.9rem;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          background: rgba(0, 15, 8, 0.6);
          border: 1px solid rgba(251, 54, 64, 0.12);
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .track-item:hover {
          background: rgba(251, 54, 64, 0.08);
          border-color: var(--accent-orange);
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(251, 54, 64, 0.15);
        }

        .track-index {
          font-family: var(--font-cyber);
          font-size: 1.1rem;
          font-weight: 900;
          color: var(--accent-orange);
          opacity: 0.9;
        }

        .track-info {
          text-align: left;
        }

        .track-title {
          font-family: var(--font-cyber);
          font-size: 0.92rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.2rem;
          letter-spacing: 0.04em;
        }

        .track-sub {
          font-family: var(--font-body);
          font-size: 0.78rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}