import React, { useState, useEffect } from "react";
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
  Download, 
  Clock, 
  CheckCircle2, 
  Cpu, 
  ChevronRight,
  Search,
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
      {/* Background Radial Glow */}
      <div style={{
        position: "absolute",
        top: "8%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "60vw",
        height: "60vw",
        background: "radial-gradient(circle, rgba(251, 54, 64, 0.12) 0%, transparent 65%)",
        borderRadius: "50%",
        filter: "blur(90px)",
        pointerEvents: "none",
        zIndex: 1
      }} />

      {/* Main Container */}
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        width: "100%",
        position: "relative",
        zIndex: 5
      }}>
        {/* =========================================================================
            CENTERED HERO SECTION (Top Copy -> Centered Character -> CTA Actions)
            ========================================================================= */}
        <div style={{
          textAlign: "center",
          paddingTop: "2rem",
          paddingBottom: "3.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          
          {/* Tagline Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(251, 54, 64, 0.08)",
            border: "1px solid rgba(251, 54, 64, 0.3)",
            borderRadius: "30px",
            padding: "0.4rem 1.3rem",
            marginBottom: "1.5rem",
            boxShadow: "0 0 20px rgba(251, 54, 64, 0.15)"
          }}>
            <Sparkles size={15} style={{ color: "var(--accent-orange)" }} />
            <span style={{
              fontFamily: "var(--font-body)",
              fontWeight: "700",
              color: "#ffffff",
              fontSize: "0.85rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase"
            }}>
              Curated Academic Knowledge Repository
            </span>
          </div>

          {/* Main Centered Title */}
          <h1 style={{
            fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)",
            fontWeight: "900",
            lineHeight: "1.12",
            fontFamily: "var(--font-cyber)",
            color: "#ffffff",
            letterSpacing: "-0.01em",
            margin: "0 0 1.2rem 0",
            maxWidth: "900px"
          }}>
            YOUR PORTAL TO <br />
            <span style={{
              background: "linear-gradient(135deg, #ffffff 20%, #FB3640 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 35px rgba(251, 54, 64, 0.35)"
            }}>
              ACADEMIC EXCELLENCE.
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            color: "var(--text-secondary)",
            fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
            lineHeight: "1.7",
            maxWidth: "680px",
            fontFamily: "var(--font-body)",
            margin: "0 auto 2rem"
          }}>
            Access verified lecture notes in chronological continuity, daily class timetables, university course syllabi, and model practice question sets.
          </p>

          {/* Action Buttons */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "3rem"
          }}>
            <button
              onClick={() => nav("/notes")}
              className="cyber-btn-orange"
              style={{
                padding: "0.85rem 2rem",
                fontSize: "1rem"
              }}
            >
              <BookOpen size={17} />
              <span>Explore Notes</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => nav("/routine")}
              className="cyber-btn-wire"
              style={{
                padding: "0.85rem 1.8rem",
                fontSize: "1rem"
              }}
            >
              <Calendar size={17} />
              <span>Class Routine</span>
            </button>

            <button
              onClick={() => nav("/syllabus")}
              className="cyber-btn-wire"
              style={{
                padding: "0.85rem 1.8rem",
                fontSize: "1rem"
              }}
            >
              <Layers size={17} />
              <span>Course Syllabus</span>
            </button>
          </div>

          {/* =========================================================
              CENTERED WHITE ROBOT SHOWCASE WITH HUD BACKGROUND
              ========================================================= */}
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: "620px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto 4rem",
            minHeight: "420px"
          }}>
            {/* Radial Glow Underlay */}
            <div style={{
              position: "absolute",
              width: "360px",
              height: "360px",
              background: "radial-gradient(circle, rgba(251, 54, 64, 0.25) 0%, transparent 70%)",
              filter: "blur(55px)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 1
            }} />

            {/* Atomic HUD Tech Circles */}
            <div style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 2,
              opacity: 0.85,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <svg width="100%" height="100%" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: "480px" }}>
                <circle cx="250" cy="250" r="80" stroke="rgba(251, 54, 64, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="190" cy="214" r="3.5" fill="#FB3640" opacity="0.8" />
                
                <circle cx="250" cy="250" r="140" stroke="rgba(251, 54, 64, 0.18)" strokeWidth="1" />
                <circle cx="340" cy="170" r="4" fill="#FB3640" opacity="0.7" />
                
                <g transform="rotate(-30 250 250)">
                  <ellipse cx="250" cy="250" rx="200" ry="90" stroke="rgba(251, 54, 64, 0.15)" strokeWidth="1" strokeDasharray="10 5" />
                </g>
                <circle cx="110" cy="180" r="4" fill="#FB3640" opacity="0.8" />
                
                <g transform="rotate(30 250 250)">
                  <ellipse cx="250" cy="250" rx="200" ry="90" stroke="rgba(251, 54, 64, 0.15)" strokeWidth="1" strokeDasharray="15 5" />
                </g>
                <circle cx="390" cy="180" r="4" fill="#FB3640" opacity="0.8" />
                
                <circle cx="250" cy="250" r="180" stroke="rgba(251, 54, 64, 0.25)" strokeWidth="1.5" strokeDasharray="30 150" />
                <circle cx="250" cy="250" r="188" stroke="rgba(251, 54, 64, 0.12)" strokeWidth="0.75" strokeDasharray="2 8" />
              </svg>
            </div>

            {/* White Futuristic Sci-Fi Robot Student Character */}
            <img 
              src="/photo1.png" 
              alt="NotesVilla Student" 
              style={{
                width: "100%",
                maxWidth: "480px",
                height: "auto",
                objectFit: "contain",
                zIndex: 5,
                filter: "drop-shadow(0 20px 40px rgba(251, 54, 64, 0.25)) drop-shadow(0 10px 30px rgba(0, 0, 0, 0.8))",
                display: "block",
                maskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)"
              }}
            />
          </div>

          {/* Centered Key Metric Counters */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
            padding: "1.5rem",
            background: "rgba(0, 15, 8, 0.7)",
            border: "1px solid rgba(251, 54, 64, 0.15)",
            borderRadius: "10px",
            backdropFilter: "blur(10px)"
          }}>
            <div>
              <div style={{ fontFamily: "var(--font-cyber)", fontSize: "1.6rem", fontWeight: "900", color: "#ffffff" }}>
                100%
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-body)", marginTop: "0.2rem" }}>
                Free Open Access
              </div>
            </div>

            <div>
              <div style={{ fontFamily: "var(--font-cyber)", fontSize: "1.6rem", fontWeight: "900", color: "var(--accent-orange)" }}>
                Daily
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-body)", marginTop: "0.2rem" }}>
                Continuity Notes
              </div>
            </div>

            <div>
              <div style={{ fontFamily: "var(--font-cyber)", fontSize: "1.6rem", fontWeight: "900", color: "#ffffff" }}>
                Instant
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-body)", marginTop: "0.2rem" }}>
                PDF Downloads
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            FEATURE BENTO CARDS SECTION
            ========================================================================= */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.5rem",
          marginBottom: "5rem"
        }}>
          {/* Card 1: Notes Library */}
          <div 
            onClick={() => nav("/notes")}
            className="cyber-panel"
            style={{
              borderRadius: "10px",
              padding: "1.8rem",
              border: "1px solid rgba(251, 54, 64, 0.18)",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = "var(--accent-orange)";
              e.currentTarget.style.boxShadow = "0 10px 25px rgba(251, 54, 64, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(251, 54, 64, 0.18)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              background: "rgba(251, 54, 64, 0.1)",
              border: "1px solid rgba(251, 54, 64, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.2rem",
              color: "var(--accent-orange)"
            }}>
              <BookOpen size={22} />
            </div>
            <h3 style={{ fontFamily: "var(--font-cyber)", fontSize: "1.15rem", color: "#ffffff", marginBottom: "0.5rem" }}>
              Date-wise Notes
            </h3>
            <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "1rem" }}>
              Lecture notes in chronological order with instant modal preview and direct downloads.
            </p>
            <span style={{ color: "var(--accent-orange)", fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              Access Archive <ChevronRight size={15} />
            </span>
          </div>

          {/* Card 2: Class Routine */}
          <div 
            onClick={() => nav("/routine")}
            className="cyber-panel"
            style={{
              borderRadius: "10px",
              padding: "1.8rem",
              border: "1px solid rgba(251, 54, 64, 0.18)",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = "var(--accent-orange)";
              e.currentTarget.style.boxShadow = "0 10px 25px rgba(251, 54, 64, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(251, 54, 64, 0.18)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              background: "rgba(251, 54, 64, 0.1)",
              border: "1px solid rgba(251, 54, 64, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.2rem",
              color: "var(--accent-orange)"
            }}>
              <Calendar size={22} />
            </div>
            <h3 style={{ fontFamily: "var(--font-cyber)", fontSize: "1.15rem", color: "#ffffff", marginBottom: "0.5rem" }}>
              Class Routine
            </h3>
            <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "1rem" }}>
              Verified schedule with interactive zoom, lab timings, and offline image download.
            </p>
            <span style={{ color: "var(--accent-orange)", fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              View Routine <ChevronRight size={15} />
            </span>
          </div>

          {/* Card 3: Course Syllabus */}
          <div 
            onClick={() => nav("/syllabus")}
            className="cyber-panel"
            style={{
              borderRadius: "10px",
              padding: "1.8rem",
              border: "1px solid rgba(251, 54, 64, 0.18)",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = "var(--accent-orange)";
              e.currentTarget.style.boxShadow = "0 10px 25px rgba(251, 54, 64, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(251, 54, 64, 0.18)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              background: "rgba(251, 54, 64, 0.1)",
              border: "1px solid rgba(251, 54, 64, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.2rem",
              color: "var(--accent-orange)"
            }}>
              <Layers size={22} />
            </div>
            <h3 style={{ fontFamily: "var(--font-cyber)", fontSize: "1.15rem", color: "#ffffff", marginBottom: "0.5rem" }}>
              Course Syllabus
            </h3>
            <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "1rem" }}>
              Modular unit curriculum breakdowns, objectives, and recommended standard reference textbooks.
            </p>
            <span style={{ color: "var(--accent-orange)", fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              Explore Syllabus <ChevronRight size={15} />
            </span>
          </div>

          {/* Card 4: Practice Questions */}
          <div 
            onClick={() => nav("/practice")}
            className="cyber-panel"
            style={{
              borderRadius: "10px",
              padding: "1.8rem",
              border: "1px solid rgba(251, 54, 64, 0.18)",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = "var(--accent-orange)";
              e.currentTarget.style.boxShadow = "0 10px 25px rgba(251, 54, 64, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(251, 54, 64, 0.18)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              background: "rgba(251, 54, 64, 0.1)",
              border: "1px solid rgba(251, 54, 64, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.2rem",
              color: "var(--accent-orange)"
            }}>
              <HelpCircle size={22} />
            </div>
            <h3 style={{ fontFamily: "var(--font-cyber)", fontSize: "1.15rem", color: "#ffffff", marginBottom: "0.5rem" }}>
              Practice Sets & PYQs
            </h3>
            <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "1rem" }}>
              University previous year questions and topic model problem sets for exam readiness.
            </p>
            <span style={{ color: "var(--accent-orange)", fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              Solve Problems <ChevronRight size={15} />
            </span>
          </div>
        </div>

        {/* =========================================================================
            INTERACTIVE SUBJECT SHOWCASE
            ========================================================================= */}
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

      {/* Embedded Animations */}
      <style jsx>{`
        .home-page-container {
          position: relative;
          min-height: 100vh;
          background: radial-gradient(circle at 50% 15%, rgba(251, 54, 64, 0.08) 0%, #000F08 75%);
          overflow: hidden;
          padding: 5.5rem 1.5rem 2rem;
          box-sizing: border-box;
          width: 100%;
        }
      `}</style>
    </div>
  );
}