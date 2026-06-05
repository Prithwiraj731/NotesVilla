import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Layers, Database, Code } from "lucide-react";

export default function Home() {
  const nav = useNavigate();
  
  // Dynamic subjects list replacing the "products" from the reference image
  const subjectsData = [
    {
      id: "dsa",
      label: "DSA",
      name: "Data Structures & Algorithms",
      shortDesc: "Master algorithms, complexity, trees, graphs, and dynamic programming.",
      icon: Layers,
      color: "#FB3640", // Imperial Red
      dbQuery: "Data Structures & Algorithms"
    },
    {
      id: "fullstack",
      label: "WEB",
      name: "Full Stack Development",
      shortDesc: "Build robust modern web applications with MERN stack, Next.js, and APIs.",
      icon: Code,
      color: "#FB3640", // Imperial Red
      dbQuery: "Full Stack Development"
    },
    {
      id: "database",
      label: "DBMS",
      name: "Database Systems",
      shortDesc: "Design scalable schemas, indexing mechanisms, and optimized queries.",
      icon: Database,
      color: "#FB3640", // Imperial Red
      dbQuery: "Database Systems"
    }
  ];

  const [activeSubject, setActiveSubject] = useState(subjectsData[0]);
  const [embers, setEmbers] = useState([]);

  // Generate background floating embers on mount
  useEffect(() => {
    const list = [];
    for (let i = 0; i < 5; i++) {
      list.push({
        id: i,
        left: Math.random() * 100 + "%",
        delay: Math.random() * 6 + "s",
        duration: Math.random() * 4 + 4 + "s",
        size: Math.random() * 2 + 1 + "px"
      });
    }
    setEmbers(list);
  }, []);

  const handleCTA = () => {
    nav("/notes");
  };

  const handleSubjectLink = (subjectQuery) => {
    // Jump straight to the notes library filtered by this subject name
    nav(`/notes?subject=${encodeURIComponent(subjectQuery)}`);
  };

  return (
    <div className="home-page-container">
      {/* Glow Effects */}
      <div style={{
        position: "absolute",
        top: "20%",
        right: "10%",
        width: "35vw",
        height: "35vw",
        background: "radial-gradient(circle, rgba(251, 54, 64, 0.08) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
        animation: "glow-shift 6s ease-in-out infinite alternate",
        pointerEvents: "none"
      }} />

      {/* Floating Ember Particles */}
      {embers.map(e => (
        <div
          key={e.id}
          className="ember"
          style={{
            left: e.left,
            animationDelay: e.delay,
            animationDuration: e.duration,
            width: e.size,
            height: e.size,
            backgroundColor: activeSubject.color,
            boxShadow: `0 0 6px ${activeSubject.color}`,
            opacity: 0.3
          }}
        />
      ))}

      {/* Main Responsive Grid Layout */}
      <div className="hero-grid">
        
        {/* Left Side: Copy/Text Hero Block */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          textAlign: "left"
        }}>
          {/* Accent text */}
          <div style={{
            fontFamily: "var(--font-body)",
            fontWeight: "600",
            color: "var(--accent-orange)",
            fontSize: "0.85rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase"
          }}>
            Curated Knowledge Repository
          </div>

          {/* Title styled professionally */}
          <h1 style={{
            fontSize: "clamp(2.5rem, 5vw, 4.2rem)",
            fontWeight: "850",
            lineHeight: "1.1",
            fontFamily: "var(--font-body)",
            color: "#ffffff",
            letterSpacing: "-0.03em"
          }}>
            Your portal to<br />
            <span style={{
              background: "linear-gradient(135deg, #ffffff 30%, #FB3640 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              academic excellence.
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            color: "var(--text-secondary)",
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            lineHeight: "1.65",
            maxWidth: "540px",
            fontFamily: "var(--font-body)"
          }}>
            Access a high-fidelity repository of notes and study resources, engineered to empower your learning and accelerate comprehension.
          </p>

          {/* Custom Sleek Professional Button */}
          <div style={{ marginTop: "1rem" }}>
            <button 
              onClick={handleCTA}
              style={{
                background: "var(--accent-orange)",
                color: "#ffffff",
                fontFamily: "var(--font-body)",
                fontWeight: "600",
                letterSpacing: "0.02em",
                padding: "0.85rem 1.75rem",
                fontSize: "1rem",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                transition: "all 0.2s ease-in-out",
                boxShadow: "0 4px 14px rgba(251, 54, 64, 0.25)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(251, 54, 64, 0.4)";
                e.currentTarget.style.background = "rgba(251, 54, 64, 0.9)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(251, 54, 64, 0.25)";
                e.currentTarget.style.background = "var(--accent-orange)";
              }}
            >
              <span>Explore Library</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Modern Minimalist Segmented Tabs */}
          <div style={{
            display: "flex",
            background: "rgba(251, 54, 64, 0.03)",
            border: "1px solid rgba(251, 54, 64, 0.15)",
            borderRadius: "8px",
            padding: "0.3rem",
            gap: "0.5rem",
            width: "fit-content",
            marginTop: "2.5rem",
            zIndex: 10
          }}>
            {subjectsData.map((subj) => {
              const isSelected = activeSubject.id === subj.id;
              return (
                <button
                  key={subj.id}
                  onClick={() => setActiveSubject(subj)}
                  style={{
                    background: isSelected ? "var(--accent-orange)" : "transparent",
                    color: isSelected ? "#000F08" : "var(--text-secondary)",
                    fontFamily: "var(--font-body)",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    padding: "0.55rem 1.25rem",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase"
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  {subj.label}
                </button>
              );
            })}
          </div>

          {/* Active Subject Description block */}
          <div key={activeSubject.id} style={{
            marginTop: "1.25rem",
            maxWidth: "480px",
            animation: "slideIn 0.3s ease-out",
            zIndex: 10
          }}>
            <h4 style={{
              fontFamily: "var(--font-body)",
              fontSize: "1.1rem",
              fontWeight: "700",
              color: "#ffffff",
              marginBottom: "0.4rem"
            }}>
              {activeSubject.name}
            </h4>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              lineHeight: "1.55",
              color: "var(--text-secondary)",
              marginBottom: "0.85rem"
            }}>
              {activeSubject.shortDesc}
            </p>
            <span 
              onClick={() => handleSubjectLink(activeSubject.dbQuery)}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                color: "var(--accent-orange)",
                cursor: "pointer",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
            >
              Explore Subject Library <ArrowRight size={14} />
            </span>
          </div>

        </div>

        {/* Right Side: Clean Portrait Image without square background */}
        <div style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: "400px"
        }}>
          {/* Subtle background glow behind the character */}
          <div style={{
            position: "absolute",
            width: "320px",
            height: "320px",
            background: "radial-gradient(circle, rgba(251, 54, 64, 0.18) 0%, transparent 70%)",
            filter: "blur(45px)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 1
          }} />

          {/* Atomic Tech HUD Background */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 2,
            opacity: 0.8,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <svg width="100%" height="100%" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: "480px" }}>
              {/* Inner Orbit */}
              <circle cx="250" cy="250" r="70" stroke="rgba(251, 54, 64, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="190" cy="214" r="3" fill="#FB3640" opacity="0.6" />
              
              {/* Middle Orbit */}
              <circle cx="250" cy="250" r="120" stroke="rgba(251, 54, 64, 0.15)" strokeWidth="1" />
              <circle cx="340" cy="170" r="3.5" fill="#FB3640" opacity="0.5" />
              
              {/* Outer Orbit (Elongated Ellipse 1) */}
              <g transform="rotate(-30 250 250)">
                <ellipse cx="250" cy="250" rx="190" ry="85" stroke="rgba(251, 54, 64, 0.12)" strokeWidth="1" strokeDasharray="10 5" />
              </g>
              <circle cx="110" cy="180" r="3.5" fill="#FB3640" opacity="0.6" />
              
              {/* Outer Orbit (Elongated Ellipse 2) */}
              <g transform="rotate(30 250 250)">
                <ellipse cx="250" cy="250" rx="190" ry="85" stroke="rgba(251, 54, 64, 0.12)" strokeWidth="1" strokeDasharray="15 5" />
              </g>
              <circle cx="390" cy="180" r="3.5" fill="#FB3640" opacity="0.6" />
              
              {/* Crosshair grids */}
              <line x1="250" y1="30" x2="250" y2="470" stroke="rgba(251, 54, 64, 0.08)" strokeWidth="1" strokeDasharray="2 8" />
              <line x1="30" y1="250" x2="470" y2="250" stroke="rgba(251, 54, 64, 0.08)" strokeWidth="1" strokeDasharray="2 8" />
              
              {/* Tech ring ticks */}
              <circle cx="250" cy="250" r="170" stroke="rgba(251, 54, 64, 0.2)" strokeWidth="1.5" strokeDasharray="30 150" />
              <circle cx="250" cy="250" r="176" stroke="rgba(251, 54, 64, 0.1)" strokeWidth="0.75" strokeDasharray="2 8" />
            </svg>
          </div>

          {/* Portrait Image shifted and faded beautifully at the bottom without breathing animation */}
          <img 
            src="/photo1.png" 
            alt="Futuristic Notes Portal Student" 
            style={{
              width: "100%",
              maxWidth: "460px",
              height: "auto",
              objectFit: "contain",
              zIndex: 5,
              filter: "drop-shadow(0 15px 30px rgba(251, 54, 64, 0.2)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.6))",
              display: "block",
              marginTop: "-15px",
              maskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 0) 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 0) 100%)"
            }}
          />
        </div>

      </div>

      {/* Styled JSX embedded animations and responsive layout */}
      <style jsx>{`
        .home-page-container {
          position: relative;
          min-height: 100vh;
          background: radial-gradient(circle at 60% 30%, rgba(251, 54, 64, 0.08) 0%, #000F08 70%);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5.5rem 1.5rem 2rem;
          box-sizing: border-box;
          width: 100%;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          align-items: center;
          width: 100%;
          max-width: 1200px;
          z-index: 5;
        }
        @media (min-width: 992px) {
          .home-page-container {
            padding: 6.5rem 2rem 2rem;
          }
          .hero-grid {
            grid-template-columns: 1.2fr 1fr;
            align-items: flex-start;
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-15px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

    </div>
  );
}