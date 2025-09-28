import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import StarButton from "../components/StarButton";

export default function Home() {
  const nav = useNavigate();
  const handleDive = () => {
    nav("/notes");
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* Animated background gradient */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom right, #0f0f23 0%, #0a0a0a 50%, #141414 100%)",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(109, 40, 217, 0.08), transparent)",
        }}></div>
      </div>

      {/* Subtle grid pattern */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        opacity: 0.5,
      }}></div>

      {/* Floating orbs for depth - responsive */}
      <div style={{
        position: "absolute",
        top: "clamp(2rem, 8vw, 5rem)",
        left: "clamp(1rem, 8vw, 5rem)",
        width: "clamp(12rem, 40vw, 24rem)",
        height: "clamp(12rem, 40vw, 24rem)",
        background: "radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(48px)",
        animation: "pulse 4s ease-in-out infinite",
      }}></div>
      <div style={{
        position: "absolute",
        bottom: "clamp(2rem, 8vw, 5rem)",
        right: "clamp(1rem, 8vw, 5rem)",
        width: "clamp(12rem, 40vw, 24rem)",
        height: "clamp(12rem, 40vw, 24rem)",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(48px)",
        animation: "pulse 4s ease-in-out infinite",
        animationDelay: "2s",
      }}></div>

      {/* Main content */}
      <div style={{
        position: "relative",
        zIndex: 10,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "clamp(1.5rem, 6vh, 4rem) clamp(0.75rem, 3vw, 1.5rem) clamp(1rem, 4vh, 2rem)",
      }}>
        <div style={{
          textAlign: "center",
          maxWidth: "64rem",
          margin: "0 auto",
        }}>
          {/* Small accent - responsive */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            color: "#71717a",
            fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)",
            letterSpacing: "0.1em",
            marginBottom: "clamp(2rem, 6vw, 3rem)",
            flexWrap: "wrap",
          }}>
          </div>

          {/* Main title */}
          <div style={{ position: "relative", marginBottom: "clamp(1.5rem, 5vw, 2.5rem)" }}>
            <h1 style={{
              fontSize: "clamp(2rem, 10vw, 8rem)", // Better mobile scaling
              fontWeight: "900",
              letterSpacing: "-0.02em",
              lineHeight: "0.85", // Tighter for mobile
              margin: 0,
              fontFamily: "'Orbitron', 'Bebas Neue', monospace",
              textTransform: "uppercase",
              background: "linear-gradient(180deg, #ffffff 0%, #94a3b8 50%, #475569 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 40px rgba(148, 163, 184, 0.3)",
              transform: "none",
              textAlign: "center",
            }}>
              NOTES
            </h1>
            <h1 style={{
              fontSize: "clamp(2rem, 10vw, 8rem)", // Better mobile scaling
              fontWeight: "900",
              letterSpacing: "-0.02em",
              lineHeight: "0.85", // Tighter for mobile
              margin: 0,
              marginTop: "clamp(-0.2rem, -1vw, -0.8rem)",
              fontFamily: "'Orbitron', 'Bebas Neue', monospace",
              textTransform: "uppercase",
              background: "linear-gradient(135deg, #a855f7 0%, #8b5cf6 25%, #7c3aed 50%, #6366f1 75%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 60px rgba(139, 92, 246, 0.5)",
              transform: "none",
              position: "relative",
              textAlign: "center",
            }}>
              VILLA
              {/* Add a scanning line effect */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "2px",
                background: "linear-gradient(90deg, transparent, #a855f7, transparent)",
                animation: "scan 3s linear infinite",
              }}></div>
            </h1>
            {/* Subtle glow effect */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%)",
              filter: "blur(60px)",
              zIndex: -1,
            }}></div>
            {/* Additional glow layers for depth */}
            <div style={{
              position: "absolute",
              inset: "-20px",
              background: "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
              filter: "blur(80px)",
              zIndex: -2,
              animation: "glow 4s ease-in-out infinite alternate",
            }}></div>
          </div>

          {/* CSS animations */}
          <style jsx>{`
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.6;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }
  
  @keyframes scan {
    0% {
      transform: translateY(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(100px);
      opacity: 0;
    }
  }
  
  @keyframes glow {
    from {
      transform: scale(0.9);
      opacity: 0.5;
    }
    to {
      transform: scale(1.1);
      opacity: 0.8;
    }
  }

  /* Responsive enhancements without altering design */
  @media (min-width: 768px) {
    .nv-tilt-1 { transform: perspective(400px) rotateX(10deg); }
    .nv-tilt-2 { transform: perspective(400px) rotateX(10deg); }
  }
`}</style>

          {/* Tagline - responsive */}
          <p style={{
            fontSize: "clamp(0.875rem, 3.5vw, 1.125rem)",
            color: "#a1a1aa",
            maxWidth: "38rem",
            margin: "0 auto clamp(1.5rem, 5vw, 2.5rem)",
            lineHeight: "1.5",
            padding: "0 clamp(0.5rem, 3vw, 1rem)",
          }}>
            Your futuristic repository for knowledge.
            <span style={{ display: "block", marginTop: "0.375rem", color: "#71717a", fontSize: "clamp(0.75rem, 3vw, 1rem)" }}>
              Upload, explore & share notes with the world.
            </span>
          </p>

          {/* CTA Button - responsive */}
          <div style={{ paddingTop: "clamp(1rem, 4vw, 2rem)", width: "100%", display: "flex", justifyContent: "center" }}>
            <StarButton onClick={handleDive}>
              <span>Dive into NotesVilla</span>
              <ArrowRight size={20} />
            </StarButton>
          </div>

          {/* Bottom accent - responsive */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(0.75rem, 3vw, 1.5rem)",
            marginTop: "clamp(1.5rem, 6vw, 3rem)",
            color: "#52525b",
            fontSize: "clamp(0.7rem, 2.2vw, 0.8rem)",
            flexWrap: "wrap",
            padding: "0 clamp(0.5rem, 3vw, 1rem)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{
                width: "0.5rem",
                height: "0.5rem",
                background: "#8b5cf6",
                borderRadius: "50%",
                animation: "pulse 2s ease-in-out infinite",
              }}></div>
              <span>Secure</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{
                width: "0.5rem",
                height: "0.5rem",
                background: "#6366f1",
                borderRadius: "50%",
                animation: "pulse 2s ease-in-out infinite",
                animationDelay: "0.7s",
              }}></div>
              <span>Fast</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{
                width: "0.5rem",
                height: "0.5rem",
                background: "#a855f7",
                borderRadius: "50%",
                animation: "pulse 2s ease-in-out infinite",
                animationDelay: "1.4s",
              }}></div>
              <span>Intelligent</span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        /* Safe area padding for small screens */
        @media (max-width: 380px) {
          .cta-wrap { padding-top: 1.25rem !important; }
        }
      `}</style>
    </div>
  );
}