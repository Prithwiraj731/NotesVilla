import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  ShieldAlert,
  ChevronRight
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
  const [embers, setEmbers] = useState([]);

  useEffect(() => {
    const list = [];
    for (let i = 0; i < 6; i++) {
      list.push({
        id: i,
        left: Math.random() * 100 + "%",
        delay: Math.random() * 5 + "s",
        duration: Math.random() * 4 + 4 + "s",
        size: Math.random() * 3 + 2 + "px"
      });
    }
    setEmbers(list);
  }, []);

  return (
    <div className="home-page-container">
      {/* Background Radial Glow */}
      <div style={{
        position: "absolute",
        top: "15%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "70vw",
        height: "500px",
        background: "radial-gradient(ellipse at center, rgba(251, 54, 64, 0.12) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 1,
        filter: "blur(60px)"
      }} />

      {/* Floating Embers */}
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
            backgroundColor: "#FB3640",
            boxShadow: "0 0 8px #FB3640",
            opacity: 0.4
          }}
        />
      ))}

      {/* Hero Section Container */}
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        width: "100%",
        position: "relative",
        zIndex: 5,
        paddingTop: "2.5rem",
        paddingBottom: "4rem"
      }}>
        {/* Top Tagline Badge */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            background: "rgba(251, 54, 64, 0.08)",
            border: "1px solid rgba(251, 54, 64, 0.3)",
            borderRadius: "30px",
            padding: "0.45rem 1.4rem",
            boxShadow: "0 0 20px rgba(251, 54, 64, 0.15)"
          }}>
            <Sparkles size={16} style={{ color: "var(--accent-orange)" }} />
            <span style={{
              fontFamily: "var(--font-tech)",
              fontWeight: "700",
              color: "#ffffff",
              fontSize: "0.95rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase"
            }}>
              Curated Academic Repository
            </span>
          </div>
        </div>

        {/* Hero Title */}
        <div style={{ textAlign: "center", maxWidth: "960px", margin: "0 auto 1.8rem" }}>
          <h1 style={{
            fontSize: "clamp(2.8rem, 6.5vw, 5rem)",
            fontWeight: "900",
            lineHeight: "1.08",
            fontFamily: "var(--font-cyber)",
            letterSpacing: "-0.02em",
            color: "#ffffff",
            textTransform: "uppercase"
          }}>
            ELEVATE YOUR <br />
            <span style={{
              background: "linear-gradient(135deg, #ffffff 20%, #FB3640 85%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 30px rgba(251, 54, 64, 0.3)"
            }}>
              ACADEMIC MASTERY
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p style={{
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
          lineHeight: "1.65",
          maxWidth: "720px",
          margin: "0 auto 2.5rem",
          fontFamily: "var(--font-body)"
        }}>
          High-fidelity lecture notes in continuity, verified daily class timetable, university course syllabi, and model practice question sets—all in one futuristic portal.
        </p>

        {/* Hero Action Buttons */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1.2rem",
          flexWrap: "wrap",
          marginBottom: "4rem"
        }}>
          <button
            onClick={() => nav("/notes")}
            className="cyber-btn-orange"
            style={{
              padding: "0.95rem 2.2rem",
              fontSize: "1.05rem",
              clipPath: "none",
              borderRadius: "6px",
              boxShadow: "0 0 25px rgba(251, 54, 64, 0.4)"
            }}
          >
            <BookOpen size={18} />
            <span>Explore Notes Archive</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => nav("/routine")}
            className="cyber-btn-wire"
            style={{
              padding: "0.95rem 2rem",
              fontSize: "1.05rem",
              borderRadius: "6px"
            }}
          >
            <Calendar size={18} />
            <span>View Class Routine</span>
          </button>
        </div>

        {/* Quick Highlights Feature Bento Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          marginBottom: "5rem"
        }}>
          {/* Card 1: Notes Library */}
          <div 
            onClick={() => nav("/notes")}
            className="cyber-panel"
            style={{
              borderRadius: "10px",
              padding: "2rem",
              border: "1px solid rgba(251, 54, 64, 0.2)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.borderColor = "var(--accent-orange)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(251, 54, 64, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(251, 54, 64, 0.2)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "8px",
              background: "rgba(251, 54, 64, 0.1)",
              border: "1px solid rgba(251, 54, 64, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.2rem",
              color: "var(--accent-orange)"
            }}>
              <BookOpen size={24} />
            </div>
            <h3 style={{ fontFamily: "var(--font-cyber)", fontSize: "1.25rem", color: "#ffffff", marginBottom: "0.6rem" }}>
              Date-wise Notes
            </h3>
            <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "1rem" }}>
              Lecture notes organized in chronological continuity with in-browser previews and direct downloads.
            </p>
            <span style={{ color: "var(--accent-orange)", fontFamily: "var(--font-tech)", fontSize: "0.95rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              Access Library <ChevronRight size={16} />
            </span>
          </div>

          {/* Card 2: Class Routine */}
          <div 
            onClick={() => nav("/routine")}
            className="cyber-panel"
            style={{
              borderRadius: "10px",
              padding: "2rem",
              border: "1px solid rgba(251, 54, 64, 0.2)",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.borderColor = "var(--accent-orange)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(251, 54, 64, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(251, 54, 64, 0.2)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "8px",
              background: "rgba(251, 54, 64, 0.1)",
              border: "1px solid rgba(251, 54, 64, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.2rem",
              color: "var(--accent-orange)"
            }}>
              <Calendar size={24} />
            </div>
            <h3 style={{ fontFamily: "var(--font-cyber)", fontSize: "1.25rem", color: "#ffffff", marginBottom: "0.6rem" }}>
              Class Routine
            </h3>
            <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "1rem" }}>
              Verified timetable with high-res zoom controls, lab timings, and instant offline schedule download.
            </p>
            <span style={{ color: "var(--accent-orange)", fontFamily: "var(--font-tech)", fontSize: "0.95rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              View Routine <ChevronRight size={16} />
            </span>
          </div>

          {/* Card 3: Course Syllabus */}
          <div 
            onClick={() => nav("/syllabus")}
            className="cyber-panel"
            style={{
              borderRadius: "10px",
              padding: "2rem",
              border: "1px solid rgba(251, 54, 64, 0.2)",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.borderColor = "var(--accent-orange)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(251, 54, 64, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(251, 54, 64, 0.2)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "8px",
              background: "rgba(251, 54, 64, 0.1)",
              border: "1px solid rgba(251, 54, 64, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.2rem",
              color: "var(--accent-orange)"
            }}>
              <Layers size={24} />
            </div>
            <h3 style={{ fontFamily: "var(--font-cyber)", fontSize: "1.25rem", color: "#ffffff", marginBottom: "0.6rem" }}>
              Course Syllabus
            </h3>
            <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "1rem" }}>
              Modular unit-by-unit curriculum guide, learning outcomes, and recommended standard reference textbooks.
            </p>
            <span style={{ color: "var(--accent-orange)", fontFamily: "var(--font-tech)", fontSize: "0.95rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              Explore Syllabus <ChevronRight size={16} />
            </span>
          </div>

          {/* Card 4: Practice Questions */}
          <div 
            onClick={() => nav("/practice")}
            className="cyber-panel"
            style={{
              borderRadius: "10px",
              padding: "2rem",
              border: "1px solid rgba(251, 54, 64, 0.2)",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.borderColor = "var(--accent-orange)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(251, 54, 64, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(251, 54, 64, 0.2)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "8px",
              background: "rgba(251, 54, 64, 0.1)",
              border: "1px solid rgba(251, 54, 64, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.2rem",
              color: "var(--accent-orange)"
            }}>
              <HelpCircle size={24} />
            </div>
            <h3 style={{ fontFamily: "var(--font-cyber)", fontSize: "1.25rem", color: "#ffffff", marginBottom: "0.6rem" }}>
              Practice Sets & PYQs
            </h3>
            <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "1rem" }}>
              University previous year questions and topic-wise model problem sheets for exam readiness.
            </p>
            <span style={{ color: "var(--accent-orange)", fontFamily: "var(--font-tech)", fontSize: "0.95rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              Solve Questions <ChevronRight size={16} />
            </span>
          </div>
        </div>

        {/* Interactive Subject Explorer Section */}
        <div 
          className="cyber-panel"
          style={{
            borderRadius: "12px",
            padding: "2.5rem 2rem",
            border: "1px solid rgba(251, 54, 64, 0.2)",
            background: "rgba(0, 15, 8, 0.8)"
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "var(--font-cyber)", fontSize: "1.8rem", color: "#ffffff", marginBottom: "0.5rem", textTransform: "uppercase" }}>
              CORE ACADEMIC DISCIPLINES
            </h2>
            <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto" }}>
              Select a discipline to jump straight into its lecture notes archive and curriculum guides.
            </p>
          </div>

          {/* Subject Pills Switcher */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.8rem",
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
                    padding: "0.6rem 1.4rem",
                    fontFamily: "var(--font-tech)",
                    fontWeight: isSelected ? "700" : "600",
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    transition: "all 0.2s ease",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase"
                  }}
                >
                  <Icon size={16} />
                  <span>{subj.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Subject Showcase */}
          <div style={{
            background: "rgba(0, 5, 2, 0.7)",
            border: "1px solid rgba(251, 54, 64, 0.15)",
            borderRadius: "8px",
            padding: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.5rem"
          }}>
            <div>
              <h3 style={{
                fontFamily: "var(--font-cyber)",
                fontSize: "1.4rem",
                color: "#ffffff",
                marginBottom: "0.5rem"
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
                style={{ padding: "0.6rem 1.4rem", fontSize: "0.9rem", clipPath: "none", borderRadius: "4px" }}
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

      {/* Styled JSX embedded animations */}
      <style jsx>{`
        .home-page-container {
          position: relative;
          min-height: 100vh;
          background: radial-gradient(circle at 50% 20%, rgba(251, 54, 64, 0.08) 0%, #000F08 75%);
          overflow: hidden;
          padding: 5rem 1.5rem 2rem;
          box-sizing: border-box;
          width: 100%;
        }
      `}</style>
    </div>
  );
}