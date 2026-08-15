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
  Zap,
  ShieldCheck,
  Flame,
  FileText,
  Activity
} from "lucide-react";

export default function Home() {
  const nav = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

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
    for (let i = 0; i < 8; i++) {
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

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      nav(`/notes?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      nav('/notes');
    }
  };

  return (
    <div className="home-page-container">
      {/* Background Ambient Glows */}
      <div style={{
        position: "absolute",
        top: "5%",
        right: "5%",
        width: "50vw",
        height: "50vw",
        background: "radial-gradient(circle, rgba(251, 54, 64, 0.12) 0%, transparent 65%)",
        borderRadius: "50%",
        filter: "blur(90px)",
        pointerEvents: "none",
        zIndex: 1
      }} />

      <div style={{
        position: "absolute",
        top: "35%",
        left: "-10%",
        width: "35vw",
        height: "35vw",
        background: "radial-gradient(circle, rgba(251, 54, 64, 0.08) 0%, transparent 65%)",
        borderRadius: "50%",
        filter: "blur(80px)",
        pointerEvents: "none",
        zIndex: 1
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

      {/* Main Content Area */}
      <div style={{
        maxWidth: "1320px",
        margin: "0 auto",
        width: "100%",
        position: "relative",
        zIndex: 5
      }}>
        {/* =========================================================================
            HERO COMMAND CENTER (Split Layout with Floating Hologram Cards)
            ========================================================================= */}
        <div className="hero-grid" style={{
          display: "grid",
          gridTemplateColumns: window.innerWidth < 992 ? "1fr" : "1.15fr 1fr",
          alignItems: "center",
          gap: "3rem",
          paddingTop: "1.5rem",
          paddingBottom: "4.5rem"
        }}>
          {/* Left Column: Headline, Value Props & Live Search */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem", textAlign: "left" }}>
            
            {/* Live Academic Status Pill */}
            <div>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                background: "rgba(0, 20, 10, 0.7)",
                border: "1px solid rgba(251, 54, 64, 0.35)",
                backdropFilter: "blur(10px)",
                borderRadius: "30px",
                padding: "0.45rem 1.1rem",
                boxShadow: "0 0 20px rgba(251, 54, 64, 0.15)"
              }}>
                <span style={{
                  position: "relative",
                  display: "flex",
                  height: "8px",
                  width: "8px"
                }}>
                  <span style={{
                    position: "absolute",
                    display: "inline-flex",
                    height: "100%",
                    width: "100%",
                    borderRadius: "50%",
                    backgroundColor: "#FB3640",
                    opacity: 0.75,
                    animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite"
                  }} />
                  <span style={{
                    position: "relative",
                    display: "inline-flex",
                    borderRadius: "50%",
                    height: "8px",
                    width: "8px",
                    backgroundColor: "#FB3640"
                  }} />
                </span>

                <span style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: "700",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase"
                }}>
                  2025 Academic Hub • Daily Continuity Feed
                </span>
              </div>
            </div>

            {/* High-Impact Main Title */}
            <h1 style={{
              fontSize: "clamp(2.5rem, 5.2vw, 4.3rem)",
              fontWeight: "900",
              lineHeight: "1.08",
              fontFamily: "var(--font-cyber)",
              color: "#ffffff",
              letterSpacing: "-0.01em",
              margin: 0
            }}>
              THE SMARTER WAY TO <br />
              <span style={{
                background: "linear-gradient(135deg, #ffffff 15%, #FB3640 85%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 0 35px rgba(251, 54, 64, 0.4)"
              }}>
                MASTER CURRICULUM.
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{
              color: "var(--text-secondary)",
              fontSize: "clamp(1.02rem, 1.8vw, 1.15rem)",
              lineHeight: "1.65",
              maxWidth: "580px",
              fontFamily: "var(--font-body)",
              margin: 0
            }}>
              Access lecture notes in chronological continuity, official class routine timetables, modular subject syllabi, and model practice PYQ sheets.
            </p>

            {/* Interactive Hero Quick-Search Bar */}
            <form 
              onSubmit={handleHeroSearch}
              style={{
                position: "relative",
                maxWidth: "580px",
                width: "100%",
                marginTop: "0.4rem"
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(0, 15, 8, 0.85)",
                border: "1px solid rgba(251, 54, 64, 0.35)",
                backdropFilter: "blur(16px)",
                borderRadius: "8px",
                padding: "0.35rem 0.4rem 0.35rem 1.1rem",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(251, 54, 64, 0.15)",
                transition: "all 0.25s ease"
              }}>
                <Search size={18} style={{ color: "var(--accent-orange)", marginRight: "0.75rem", flexShrink: 0 }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes, topics (e.g., Trees, React, SQL)..."
                  style={{
                    background: "transparent !important",
                    border: "none !important",
                    outline: "none !important",
                    boxShadow: "none !important",
                    color: "#ffffff !important",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.95rem",
                    width: "100%",
                    padding: "0.4rem 0 !important"
                  }}
                />
                <button
                  type="submit"
                  className="cyber-btn-orange"
                  style={{
                    padding: "0.6rem 1.3rem",
                    fontSize: "0.9rem",
                    borderRadius: "6px",
                    flexShrink: 0
                  }}
                >
                  <span>Browse</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* Quick Filter Tag Buttons */}
              <div style={{
                display: "flex",
                gap: "0.5rem",
                marginTop: "0.75rem",
                flexWrap: "wrap",
                alignItems: "center"
              }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: "600" }}>
                  Popular:
                </span>
                {[
                  { label: "DSA", q: "Data Structures & Algorithms" },
                  { label: "Web Tech", q: "Full Stack Development" },
                  { label: "DBMS", q: "Database Systems" },
                  { label: "OS", q: "Operating Systems" },
                ].map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => nav(`/notes?subject=${encodeURIComponent(tag.q)}`)}
                    style={{
                      background: "rgba(251, 54, 64, 0.07)",
                      border: "1px solid rgba(251, 54, 64, 0.2)",
                      borderRadius: "20px",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.78rem",
                      fontWeight: "600",
                      padding: "0.2rem 0.7rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "var(--accent-orange)";
                      e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "rgba(251, 54, 64, 0.2)";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </form>

            {/* Hero Secondary Actions & Key Badges */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
              marginTop: "0.4rem"
            }}>
              <button
                onClick={() => nav("/routine")}
                className="cyber-btn-wire"
                style={{
                  padding: "0.75rem 1.6rem",
                  fontSize: "0.95rem"
                }}
              >
                <Calendar size={17} />
                <span>Class Routine</span>
              </button>

              <button
                onClick={() => nav("/syllabus")}
                className="cyber-btn-wire"
                style={{
                  padding: "0.75rem 1.6rem",
                  fontSize: "0.95rem"
                }}
              >
                <Layers size={17} />
                <span>Course Syllabus</span>
              </button>
            </div>

            {/* Metric Strip with Modern Glass Panels */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
              marginTop: "1.2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(251, 54, 64, 0.12)",
              maxWidth: "580px"
            }}>
              <div style={{
                background: "rgba(251, 54, 64, 0.04)",
                border: "1px solid rgba(251, 54, 64, 0.15)",
                borderRadius: "8px",
                padding: "0.75rem 0.9rem"
              }}>
                <div style={{ fontFamily: "var(--font-cyber)", fontSize: "1.35rem", fontWeight: "900", color: "#ffffff" }}>
                  100%
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-body)", marginTop: "0.2rem" }}>
                  Open Access
                </div>
              </div>

              <div style={{
                background: "rgba(251, 54, 64, 0.04)",
                border: "1px solid rgba(251, 54, 64, 0.15)",
                borderRadius: "8px",
                padding: "0.75rem 0.9rem"
              }}>
                <div style={{ fontFamily: "var(--font-cyber)", fontSize: "1.35rem", fontWeight: "900", color: "var(--accent-orange)" }}>
                  Daily
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-body)", marginTop: "0.2rem" }}>
                  Continuity Feed
                </div>
              </div>

              <div style={{
                background: "rgba(251, 54, 64, 0.04)",
                border: "1px solid rgba(251, 54, 64, 0.15)",
                borderRadius: "8px",
                padding: "0.75rem 0.9rem"
              }}>
                <div style={{ fontFamily: "var(--font-cyber)", fontSize: "1.35rem", fontWeight: "900", color: "#ffffff" }}>
                  Instant
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-body)", marginTop: "0.2rem" }}>
                  PDF Preview
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Holographic Robot Showcase with Floating Glass Widgets */}
          <div style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "460px"
          }}>
            {/* Ambient Radial Core Light */}
            <div style={{
              position: "absolute",
              width: "360px",
              height: "360px",
              background: "radial-gradient(circle, rgba(251, 54, 64, 0.25) 0%, rgba(251, 54, 64, 0.05) 50%, transparent 75%)",
              filter: "blur(60px)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 1
            }} />

            {/* Atomic Orbit Ring Lines */}
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
              <svg width="100%" height="100%" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: "500px" }}>
                <circle cx="250" cy="250" r="80" stroke="rgba(251, 54, 64, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="190" cy="214" r="3.5" fill="#FB3640" opacity="0.8" />
                
                <circle cx="250" cy="250" r="140" stroke="rgba(251, 54, 64, 0.18)" strokeWidth="1" />
                <circle cx="350" cy="165" r="4" fill="#FB3640" opacity="0.7" />
                
                <g transform="rotate(-30 250 250)">
                  <ellipse cx="250" cy="250" rx="205" ry="95" stroke="rgba(251, 54, 64, 0.18)" strokeWidth="1" strokeDasharray="10 5" />
                </g>
                <circle cx="110" cy="180" r="4" fill="#FB3640" opacity="0.8" />
                
                <g transform="rotate(30 250 250)">
                  <ellipse cx="250" cy="250" rx="205" ry="95" stroke="rgba(251, 54, 64, 0.18)" strokeWidth="1" strokeDasharray="15 5" />
                </g>
                <circle cx="390" cy="180" r="4" fill="#FB3640" opacity="0.8" />
                
                <circle cx="250" cy="250" r="185" stroke="rgba(251, 54, 64, 0.3)" strokeWidth="1.5" strokeDasharray="40 140" />
                <circle cx="250" cy="250" r="192" stroke="rgba(251, 54, 64, 0.12)" strokeWidth="0.75" strokeDasharray="2 8" />
              </svg>
            </div>

            {/* White Futuristic Sci-Fi Robot Student Character */}
            <img 
              src="/photo1.png" 
              alt="NotesVilla Scholar" 
              style={{
                width: "100%",
                maxWidth: "460px",
                height: "auto",
                objectFit: "contain",
                zIndex: 5,
                filter: "drop-shadow(0 20px 40px rgba(251, 54, 64, 0.28)) drop-shadow(0 10px 30px rgba(0, 0, 0, 0.8))",
                display: "block",
                maskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1) 82%, rgba(0, 0, 0, 0) 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1) 82%, rgba(0, 0, 0, 0) 100%)"
              }}
            />

            {/* =========================================================
                FLOATING 3D GLASS WIDGET 1: Top Right (Latest Notes Alert)
                ========================================================= */}
            <div 
              onClick={() => nav("/notes")}
              style={{
                position: "absolute",
                top: "8%",
                right: "-4%",
                background: "rgba(0, 15, 8, 0.85)",
                border: "1px solid rgba(251, 54, 64, 0.35)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                borderRadius: "10px",
                padding: "0.75rem 1rem",
                zIndex: 8,
                display: window.innerWidth < 768 ? "none" : "flex",
                alignItems: "center",
                gap: "0.75rem",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(251, 54, 64, 0.2)",
                cursor: "pointer",
                transition: "all 0.25s ease",
                animation: "floatSlow 4s ease-in-out infinite"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
                e.currentTarget.style.borderColor = "var(--accent-orange)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.borderColor = "rgba(251, 54, 64, 0.35)";
              }}
            >
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(251, 54, 64, 0.12)",
                border: "1px solid rgba(251, 54, 64, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-orange)"
              }}>
                <FileText size={18} />
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--accent-orange)", fontFamily: "var(--font-cyber)", fontWeight: "700" }}>
                  FEED UPDATED
                </div>
                <div style={{ fontSize: "0.85rem", color: "#ffffff", fontFamily: "var(--font-body)", fontWeight: "600" }}>
                  Lecture Notes Ready
                </div>
              </div>
            </div>

            {/* =========================================================
                FLOATING 3D GLASS WIDGET 2: Bottom Left (Class Routine Alert)
                ========================================================= */}
            <div 
              onClick={() => nav("/routine")}
              style={{
                position: "absolute",
                bottom: "12%",
                left: "-6%",
                background: "rgba(0, 15, 8, 0.85)",
                border: "1px solid rgba(251, 54, 64, 0.35)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                borderRadius: "10px",
                padding: "0.75rem 1.1rem",
                zIndex: 8,
                display: window.innerWidth < 768 ? "none" : "flex",
                alignItems: "center",
                gap: "0.75rem",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(251, 54, 64, 0.2)",
                cursor: "pointer",
                transition: "all 0.25s ease",
                animation: "floatSlow 4.5s ease-in-out infinite 1s"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
                e.currentTarget.style.borderColor = "var(--accent-orange)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.borderColor = "rgba(251, 54, 64, 0.35)";
              }}
            >
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(251, 54, 64, 0.12)",
                border: "1px solid rgba(251, 54, 64, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-orange)"
              }}>
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--accent-orange)", fontFamily: "var(--font-cyber)", fontWeight: "700" }}>
                  VERIFIED SCHEDULE
                </div>
                <div style={{ fontSize: "0.85rem", color: "#ffffff", fontFamily: "var(--font-body)", fontWeight: "600" }}>
                  Official Timetable
                </div>
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
          background: radial-gradient(circle at 50% 15%, rgba(251, 54, 64, 0.09) 0%, #000F08 75%);
          overflow: hidden;
          padding: 5.5rem 1.5rem 2rem;
          box-sizing: border-box;
          width: 100%;
        }

        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}