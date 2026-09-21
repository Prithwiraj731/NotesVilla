import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Terminal, 
  Download, 
  Code, 
  Copy, 
  Check, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Settings, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Monitor, 
  PackageCheck, 
  FileCode, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';

export default function UbuntuLabSetup({ standalone = false }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [scriptContent, setScriptContent] = useState('');
  const [loadingScript, setLoadingScript] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [activeTab, setActiveTab] = useState('download'); // 'download' | 'curl'
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowScriptModal(false);
    };
    if (showScriptModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showScriptModal]);

  // Set document title if standalone page
  useEffect(() => {
    if (standalone) {
      document.title = 'Ubuntu Lab Setup | NotesVilla';
      window.scrollTo(0, 0);
    }
  }, [standalone]);

  // Trigger bulletproof file download
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/setup.sh');
      if (!res.ok) throw new Error('File not found');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: 'text/x-shellscript;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'setup.sh';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.warn('Blob download fallback:', err);
      const a = document.createElement('a');
      a.href = '/setup.sh';
      a.download = 'setup.sh';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } finally {
      setDownloading(false);
    }
  };

  // Load script content when modal is opened
  const handleOpenScript = async () => {
    setShowScriptModal(true);
    if (!scriptContent) {
      setLoadingScript(true);
      try {
        const res = await fetch('/setup.sh');
        if (res.ok) {
          const text = await res.text();
          setScriptContent(text);
        } else {
          setScriptContent('# Error: Could not fetch setup.sh. Please try downloading it directly.');
        }
      } catch (err) {
        setScriptContent('# Error loading script preview: ' + err.message);
      } finally {
        setLoadingScript(false);
      }
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => {
      setCopiedCode('');
    }, 2200);
  };

  const whatItInstalls = [
    {
      title: 'Visual Studio Code',
      category: 'Code Editor',
      desc: 'Installs modern VS Code with classic confinement. Automatically configures snapd if missing.',
      badge: 'vLatest / Snap',
      icon: Code,
      accent: 'rgba(251, 54, 64, 0.12)'
    },
    {
      title: 'Cisco Packet Tracer',
      category: 'Network Lab',
      desc: 'Installs critical dependencies (libfuse2t64, libpcre2) and auto-installs CiscoPacketTracer*.deb from Downloads.',
      badge: 'Cisco NetAcad Ready',
      icon: Monitor,
      accent: 'rgba(251, 54, 64, 0.12)'
    },
    {
      title: 'Python 3 Environment',
      category: 'Core Runtime',
      desc: 'Installs Python 3, pip package manager, and python3-venv for isolated project virtual environments.',
      badge: 'Python 3 + Pip + Venv',
      icon: Cpu,
      accent: 'rgba(251, 54, 64, 0.12)'
    },
    {
      title: 'Git & Build Essentials',
      category: 'Developer Toolchain',
      desc: 'Includes Git version control, GCC, G++, Make, curl, wget, and unzip for compilation and repository tasks.',
      badge: 'GCC / Make / Git',
      icon: Layers,
      accent: 'rgba(251, 54, 64, 0.12)'
    },
    {
      title: 'Ubuntu APT Mirror Optimizer',
      category: 'System Performance',
      desc: 'Backs up ubuntu.sources and switches slow/unreachable regional mirrors to archive.ubuntu.com.',
      badge: 'Auto Mirror Repair',
      icon: Settings,
      accent: 'rgba(251, 54, 64, 0.12)'
    },
    {
      title: 'Debian/Ubuntu Guard',
      category: 'Compatibility',
      desc: 'Performs pre-flight validation on /etc/os-release and confirms root/sudo privileges before execution.',
      badge: 'Root/Sudo Safe',
      icon: ShieldCheck,
      accent: 'rgba(251, 54, 64, 0.12)'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Download setup.sh',
      desc: 'Save setup.sh from NotesVilla directly to your Ubuntu machine (it will typically land in ~/Downloads).',
      code: 'ls -l ~/Downloads/setup.sh',
      codeId: 'step1'
    },
    {
      number: '02',
      title: 'Open Terminal',
      desc: 'Launch your terminal (Ctrl + Alt + T) and navigate into your download directory.',
      code: 'cd ~/Downloads',
      codeId: 'step2'
    },
    {
      number: '03',
      title: 'Grant Execute Permission',
      desc: 'Allow the shell script to execute on your system using chmod.',
      code: 'chmod +x setup.sh',
      codeId: 'step3'
    },
    {
      number: '04',
      title: 'Run the Setup Script',
      desc: 'Run the script. It will ask for your sudo password once, optimize APT, and install all tools.',
      code: './setup.sh',
      codeId: 'step4'
    },
    {
      number: '05',
      title: 'Cisco Packet Tracer (Optional)',
      desc: 'If using Packet Tracer, download the .deb from Cisco NetAcad and keep it in ~/Downloads. The script detects and installs it automatically!',
      code: 'sudo apt install ~/Downloads/CiscoPacketTracer*.deb',
      codeId: 'step5'
    }
  ];

  const faqs = [
    {
      q: 'Which Ubuntu versions are supported?',
      a: 'The script is built and verified for Ubuntu 22.04 LTS and Ubuntu 24.04 LTS, as well as mainstream Debian-based distributions. It automatically checks your OS release before doing anything.'
    },
    {
      q: 'How does Cisco Packet Tracer installation work?',
      a: 'Cisco Packet Tracer cannot be distributed publicly due to licensing, but setup.sh prepares all prerequisite system libraries (including libfuse2t64 and libpcre2). When you put the CiscoPacketTracer .deb file in ~/Downloads and run setup.sh, it detects and completes the installation automatically.'
    },
    {
      q: 'Can I inspect the script before running it?',
      a: 'Yes! Transparency and security are paramount. You can click the "View Script" button right on this page to examine every single line of code, or open setup.sh in nano/gedit.'
    },
    {
      q: 'What does the repository mirror optimization do?',
      a: 'Many academic and college lab networks encounter timeouts with the default in.archive.ubuntu.com regional mirror. The script creates a safe backup (ubuntu.sources.backup) and switches to the globally reliable archive.ubuntu.com mirror.'
    }
  ];

  return (
    <section 
      id="lab-setup"
      className={`lab-setup-wrapper ${standalone ? 'standalone-page' : ''}`}
    >
      {/* Background ambient lighting */}
      <div className="lab-glow-orb lab-glow-orb-left" />
      <div className="lab-glow-orb lab-glow-orb-right" />

      <div className="lab-container">
        
        {/* Breadcrumb / Back button in standalone mode */}
        {standalone && (
          <div className="standalone-nav">
            <Link to="/" className="back-link">
              <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
              <span>Back to Home</span>
            </Link>
          </div>
        )}

        {/* =========================================================================
            SECTION HEADER
            ========================================================================= */}
        <div className="lab-header">
          <div className="lab-badge">
            <Terminal size={14} className="badge-icon" />
            <span>LINUX LAB ENVIRONMENT</span>
            <span className="badge-pill">Ubuntu 22.04 & 24.04</span>
          </div>

          <h2 className="lab-title">
            UBUNTU LAB SETUP SCRIPT
          </h2>

          <p className="lab-subtitle">
            Configure your college programming environment in 1-click. Sets up Visual Studio Code, 
            Packet Tracer dependencies, Git, and Python 3 with automated APT repository optimization.
          </p>
        </div>

        {/* =========================================================================
            PRIMARY ACTION HERO CARD
            ========================================================================= */}
        <div className="cyber-panel hero-card">
          <div className="hero-grid">
            
            {/* Left: Action and Download Details */}
            <div className="hero-info">
              <div className="script-meta-row">
                <span className="meta-tag">
                  <FileCode size={13} />
                  setup.sh
                </span>
                <span className="meta-tag">
                  <PackageCheck size={13} />
                  Bash Script • ~8.5 KB
                </span>
                <span className="meta-tag meta-verified">
                  <ShieldCheck size={13} />
                  Verified Safe
                </span>
              </div>

              <h3 className="hero-heading">
                Instant Academic Lab Environment
              </h3>
              <p className="hero-text">
                Eliminate manual installation headaches, missing libraries, and broken package repositories. 
                Run this script on a fresh or existing Ubuntu install to prepare for lab classes.
              </p>

              <div className="hero-cta-buttons">
                <button 
                  onClick={handleDownload}
                  disabled={downloading}
                  className="download-btn"
                >
                  <Download size={18} className={downloading ? 'spin-icon' : ''} />
                  <span>
                    {downloadSuccess ? 'Downloaded setup.sh!' : downloading ? 'Preparing...' : 'Download setup.sh'}
                  </span>
                </button>

                <button 
                  onClick={handleOpenScript}
                  className="view-script-btn"
                >
                  <Code size={16} />
                  <span>View Script</span>
                </button>
              </div>

              <div className="security-note">
                <ShieldCheck size={14} style={{ color: 'var(--accent-orange)', flexShrink: 0 }} />
                <span>Security Notice: Always inspect scripts before executing with sudo privileges.</span>
              </div>
            </div>

            {/* Right: Quick Terminal Execution Box */}
            <div className="terminal-box">
              <div className="terminal-topbar">
                <div className="terminal-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <div className="terminal-title">
                  <Terminal size={12} />
                  <span>bash terminal</span>
                </div>
                <div className="terminal-tabs">
                  <button 
                    onClick={() => setActiveTab('download')}
                    className={`tab-btn ${activeTab === 'download' ? 'active' : ''}`}
                  >
                    Standard
                  </button>
                  <button 
                    onClick={() => setActiveTab('curl')}
                    className={`tab-btn ${activeTab === 'curl' ? 'active' : ''}`}
                  >
                    1-Liner (curl)
                  </button>
                </div>
              </div>

              <div className="terminal-body">
                {activeTab === 'download' ? (
                  <div className="command-group">
                    <span className="comment"># 1. Move to folder where setup.sh was saved</span>
                    <div className="code-line">
                      <span className="prompt">$</span>
                      <span className="cmd">cd ~/Downloads</span>
                      <button 
                        onClick={() => copyToClipboard('cd ~/Downloads', 'cmd-cd')}
                        className="copy-snippet-btn"
                        title="Copy command"
                      >
                        {copiedCode === 'cmd-cd' ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>

                    <span className="comment"># 2. Make executable and run</span>
                    <div className="code-line highlight">
                      <span className="prompt">$</span>
                      <span className="cmd">chmod +x setup.sh && ./setup.sh</span>
                      <button 
                        onClick={() => copyToClipboard('chmod +x setup.sh && ./setup.sh', 'cmd-run')}
                        className="copy-snippet-btn"
                        title="Copy command"
                      >
                        {copiedCode === 'cmd-run' ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="command-group">
                    <span className="comment"># Download and execute directly in 1 step</span>
                    <div className="code-line highlight">
                      <span className="prompt">$</span>
                      <span className="cmd">curl -sSL https://notesvilla.vercel.app/setup.sh -o setup.sh && chmod +x setup.sh && ./setup.sh</span>
                      <button 
                        onClick={() => copyToClipboard('curl -sSL https://notesvilla.vercel.app/setup.sh -o setup.sh && chmod +x setup.sh && ./setup.sh', 'cmd-curl')}
                        className="copy-snippet-btn"
                        title="Copy command"
                      >
                        {copiedCode === 'cmd-curl' ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="terminal-footer">
                  <span className="status-indicator" />
                  <span>Ready for Ubuntu 22.04 / 24.04 LTS</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* =========================================================================
            WHAT IT INSTALLS (FEATURE CARDS)
            ========================================================================= */}
        <div className="features-section">
          <div className="section-title-wrap">
            <h3 className="section-title">
              WHAT THIS SCRIPT CONFIGURES & INSTALLS
            </h3>
            <p className="section-desc">
              Every tool and utility is configured with battle-tested flags to avoid interactive prompts.
            </p>
          </div>

          <div className="features-grid">
            {whatItInstalls.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="cyber-panel feature-card">
                  <div className="feature-top">
                    <div className="feature-icon-wrap">
                      <Icon size={20} style={{ color: 'var(--accent-orange)' }} />
                    </div>
                    <span className="feature-badge">{item.badge}</span>
                  </div>
                  <div className="feature-category">{item.category}</div>
                  <h4 className="feature-name">{item.title}</h4>
                  <p className="feature-desc">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            STEP-BY-STEP INTERACTIVE WALKTHROUGH
            ========================================================================= */}
        <div className="steps-section">
          <div className="section-title-wrap">
            <h3 className="section-title">
              STEP-BY-STEP SETUP INSTRUCTIONS
            </h3>
            <p className="section-desc">
              Follow these simple commands in your Ubuntu terminal to complete the setup.
            </p>
          </div>

          <div className="steps-list">
            {steps.map((step, idx) => (
              <div key={idx} className="cyber-panel step-item">
                <div className="step-num">{step.number}</div>
                <div className="step-content">
                  <div className="step-header">
                    <h4 className="step-title">{step.title}</h4>
                  </div>
                  <p className="step-desc">{step.desc}</p>
                  
                  <div className="step-code-box">
                    <code>{step.code}</code>
                    <button 
                      onClick={() => copyToClipboard(step.code, step.codeId)}
                      className="step-copy-btn"
                      title="Copy command"
                    >
                      {copiedCode === step.codeId ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981' }}>
                          <Check size={13} /> Copied
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Copy size={13} /> Copy
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            FAQ / TROUBLESHOOTING ACCORDION
            ========================================================================= */}
        <div className="faq-section">
          <div className="section-title-wrap">
            <h3 className="section-title">
              FREQUENTLY ASKED QUESTIONS
            </h3>
            <p className="section-desc">
              Answers to common questions regarding Packet Tracer, mirrors, and execution rights.
            </p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div 
                  key={idx} 
                  className={`cyber-panel faq-item ${isOpen ? 'open' : ''}`}
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                >
                  <div className="faq-question">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <HelpCircle size={16} style={{ color: 'var(--accent-orange)', flexShrink: 0 }} />
                      <span>{faq.q}</span>
                    </div>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  {isOpen && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* =========================================================================
          VIEW SCRIPT MODAL (Full setup.sh code display)
          ========================================================================= */}
      {showScriptModal && (
        <div className="modal-backdrop" onClick={() => setShowScriptModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <Terminal size={18} style={{ color: 'var(--accent-orange)' }} />
                <div>
                  <h3 className="modal-title">setup.sh</h3>
                  <span className="modal-subtitle">Full Source Code (341 lines)</span>
                </div>
              </div>

              <div className="modal-header-actions">
                <button 
                  onClick={() => copyToClipboard(scriptContent, 'modal-full')}
                  className="modal-action-btn"
                >
                  {copiedCode === 'modal-full' ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCode === 'modal-full' ? 'Copied!' : 'Copy Script'}</span>
                </button>

                <button 
                  onClick={handleDownload}
                  className="modal-action-btn primary"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>

                <button 
                  onClick={() => setShowScriptModal(false)}
                  className="modal-close-btn"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="modal-body">
              {loadingScript ? (
                <div className="modal-loading">
                  <span className="loader-dot" />
                  <span>Loading setup.sh source code...</span>
                </div>
              ) : (
                <pre className="script-code-block">
                  <code>{scriptContent}</code>
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Component Scoped CSS */}
      <style>{`
        .lab-setup-wrapper {
          position: relative;
          width: 100%;
          background: #000F08;
          color: #ffffff;
          overflow: hidden;
          padding: 4.5rem 1.5rem 5rem;
          box-sizing: border-box;
        }

        .lab-setup-wrapper.standalone-page {
          padding-top: 7rem;
          min-height: 100vh;
        }

        @media (max-width: 768px) {
          .lab-setup-wrapper {
            padding: 3rem 1.1rem 4rem;
          }
          .lab-setup-wrapper.standalone-page {
            padding-top: 5.8rem;
          }
        }

        .lab-container {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 5;
        }

        /* Ambient Glow Orbs */
        .lab-glow-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(100px);
          z-index: 1;
        }

        .lab-glow-orb-left {
          top: 15%;
          left: -10%;
          width: 45vw;
          height: 45vw;
          background: radial-gradient(circle, rgba(251, 54, 64, 0.12) 0%, transparent 70%);
        }

        .lab-glow-orb-right {
          top: 50%;
          right: -10%;
          width: 40vw;
          height: 40vw;
          background: radial-gradient(circle, rgba(251, 54, 64, 0.09) 0%, transparent 70%);
        }

        .standalone-nav {
          margin-bottom: 2rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-family: var(--font-body);
          font-size: 0.9rem;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          background: rgba(251, 54, 64, 0.06);
          border: 1px solid rgba(251, 54, 64, 0.18);
          transition: all 0.2s ease;
        }

        .back-link:hover {
          color: #ffffff;
          border-color: var(--accent-orange);
          background: rgba(251, 54, 64, 0.15);
        }

        /* Section Header */
        .lab-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .lab-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(251, 54, 64, 0.08);
          border: 1px solid rgba(251, 54, 64, 0.3);
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          font-family: var(--font-cyber);
          font-size: 0.8rem;
          color: var(--accent-orange);
          letter-spacing: 0.05em;
          margin-bottom: 1.2rem;
        }

        .badge-pill {
          background: rgba(251, 54, 64, 0.25);
          color: #ffffff;
          padding: 0.1rem 0.45rem;
          border-radius: 12px;
          font-size: 0.72rem;
        }

        .lab-title {
          font-family: var(--font-cyber);
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.03em;
          margin-bottom: 0.85rem;
          text-transform: uppercase;
        }

        .lab-subtitle {
          color: var(--text-secondary);
          font-family: var(--font-body);
          font-size: clamp(0.92rem, 1.8vw, 1.05rem);
          max-width: 720px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Hero Card */
        .hero-card {
          padding: 2.2rem;
          border-radius: 12px;
          border: 1px solid rgba(251, 54, 64, 0.25);
          background: rgba(0, 15, 8, 0.92);
          margin-bottom: 4rem;
        }

        @media (max-width: 768px) {
          .hero-card {
            padding: 1.4rem 1.1rem;
            margin-bottom: 2.8rem;
          }
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 2.5rem;
          align-items: center;
        }

        @media (max-width: 960px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        .script-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-bottom: 1rem;
        }

        .meta-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.25rem 0.65rem;
          border-radius: 4px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-family: var(--font-body);
        }

        .meta-tag.meta-verified {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
          color: #34d399;
        }

        .hero-heading {
          font-family: var(--font-cyber);
          font-size: clamp(1.2rem, 2.5vw, 1.55rem);
          color: #ffffff;
          margin-bottom: 0.75rem;
          line-height: 1.35;
        }

        .hero-text {
          color: var(--text-secondary);
          font-family: var(--font-body);
          font-size: 0.92rem;
          line-height: 1.6;
          margin-bottom: 1.8rem;
        }

        .hero-cta-buttons {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.4rem;
        }

        .download-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: var(--accent-orange);
          color: #000000;
          border: none;
          border-radius: 30px;
          padding: 0.85rem 1.8rem;
          font-family: var(--font-cyber);
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(251, 54, 64, 0.4);
        }

        .download-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 28px rgba(251, 54, 64, 0.6);
          background: #ffffff;
        }

        .download-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .view-script-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(251, 54, 64, 0.08);
          color: #ffffff;
          border: 1px solid rgba(251, 54, 64, 0.35);
          border-radius: 30px;
          padding: 0.85rem 1.6rem;
          font-family: var(--font-cyber);
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .view-script-btn:hover {
          background: rgba(251, 54, 64, 0.2);
          border-color: var(--accent-orange);
          color: var(--accent-orange);
          transform: translateY(-2px);
        }

        .security-note {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.45;
        }

        /* Terminal Window Box */
        .terminal-box {
          background: #020704;
          border: 1px solid rgba(251, 54, 64, 0.25);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.7);
        }

        .terminal-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(251, 54, 64, 0.15);
          padding: 0.6rem 0.9rem;
        }

        .terminal-dots {
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot-red { background: #ef4444; }
        .dot-yellow { background: #f59e0b; }
        .dot-green { background: #10b981; }

        .terminal-title {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-cyber);
          font-size: 0.75rem;
          color: var(--text-muted);
          letter-spacing: 0.04em;
        }

        .terminal-tabs {
          display: flex;
          gap: 0.3rem;
        }

        .tab-btn {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-muted);
          font-size: 0.72rem;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-body);
        }

        .tab-btn.active {
          background: rgba(251, 54, 64, 0.15);
          border-color: rgba(251, 54, 64, 0.3);
          color: var(--accent-orange);
          font-weight: 600;
        }

        .terminal-body {
          padding: 1.25rem 1.1rem;
          font-family: 'Consolas', 'Courier New', monospace;
          font-size: 0.88rem;
        }

        .command-group {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .comment {
          color: #6ee7b7;
          font-size: 0.78rem;
          opacity: 0.8;
        }

        .code-line {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0.55rem 0.75rem;
          border-radius: 6px;
          position: relative;
        }

        .code-line.highlight {
          border-color: rgba(251, 54, 64, 0.3);
          background: rgba(251, 54, 64, 0.05);
        }

        .prompt {
          color: var(--accent-orange);
          font-weight: bold;
        }

        .cmd {
          color: #f8f9fa;
          flex: 1;
          word-break: break-all;
        }

        .copy-snippet-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: var(--text-secondary);
          width: 28px;
          height: 28px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .copy-snippet-btn:hover {
          background: var(--accent-orange);
          color: #000000;
          border-color: var(--accent-orange);
        }

        .terminal-footer {
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .status-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
        }

        /* Features Section */
        .features-section,
        .steps-section,
        .faq-section {
          margin-bottom: 4.5rem;
        }

        .section-title-wrap {
          text-align: center;
          margin-bottom: 2.2rem;
        }

        .section-title {
          font-family: var(--font-cyber);
          font-size: clamp(1.2rem, 3vw, 1.6rem);
          color: #ffffff;
          margin-bottom: 0.4rem;
          letter-spacing: 0.04em;
        }

        .section-desc {
          color: var(--text-secondary);
          font-family: var(--font-body);
          font-size: 0.9rem;
          max-width: 620px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
          gap: 1.4rem;
        }

        .feature-card {
          padding: 1.6rem;
          border-radius: 10px;
          border: 1px solid rgba(251, 54, 64, 0.2);
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
        }

        .feature-card:hover {
          transform: translateY(-3px);
          border-color: var(--accent-orange);
          box-shadow: 0 8px 30px rgba(251, 54, 64, 0.15);
        }

        .feature-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .feature-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          background: rgba(251, 54, 64, 0.1);
          border: 1px solid rgba(251, 54, 64, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-badge {
          font-size: 0.75rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.04);
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .feature-category {
          font-size: 0.76rem;
          font-family: var(--font-cyber);
          color: var(--accent-orange);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 0.35rem;
        }

        .feature-name {
          font-family: var(--font-cyber);
          font-size: 1.1rem;
          color: #ffffff;
          margin-bottom: 0.6rem;
        }

        .feature-desc {
          font-family: var(--font-body);
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.55;
          margin: 0;
        }

        /* Step-by-Step List */
        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .step-item {
          display: flex;
          gap: 1.5rem;
          padding: 1.4rem 1.6rem;
          border-radius: 10px;
          border: 1px solid rgba(251, 54, 64, 0.18);
          align-items: flex-start;
          transition: all 0.2s ease;
        }

        @media (max-width: 640px) {
          .step-item {
            flex-direction: column;
            gap: 0.9rem;
            padding: 1.2rem 1rem;
          }
        }

        .step-item:hover {
          border-color: rgba(251, 54, 64, 0.4);
        }

        .step-num {
          font-family: var(--font-cyber);
          font-size: 1.6rem;
          font-weight: 900;
          color: var(--accent-orange);
          opacity: 0.9;
          min-width: 44px;
          line-height: 1;
        }

        .step-content {
          flex: 1;
          width: 100%;
        }

        .step-title {
          font-family: var(--font-cyber);
          font-size: 1.05rem;
          color: #ffffff;
          margin-bottom: 0.35rem;
        }

        .step-desc {
          font-family: var(--font-body);
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 0.8rem;
        }

        .step-code-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(0, 5, 2, 0.8);
          border: 1px solid rgba(251, 54, 64, 0.2);
          border-radius: 6px;
          padding: 0.55rem 0.9rem;
          font-family: 'Consolas', 'Courier New', monospace;
          font-size: 0.85rem;
          color: #fbbf24;
          gap: 0.8rem;
        }

        .step-code-box code {
          overflow-x: auto;
          white-space: nowrap;
        }

        .step-copy-btn {
          background: rgba(251, 54, 64, 0.12);
          border: 1px solid rgba(251, 54, 64, 0.3);
          color: var(--text-primary);
          padding: 0.25rem 0.65rem;
          border-radius: 4px;
          font-size: 0.78rem;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          font-family: var(--font-body);
        }

        .step-copy-btn:hover {
          background: var(--accent-orange);
          color: #000000;
        }

        /* FAQ Section */
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .faq-item {
          padding: 1.15rem 1.4rem;
          border-radius: 8px;
          border: 1px solid rgba(251, 54, 64, 0.18);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .faq-item:hover {
          border-color: rgba(251, 54, 64, 0.4);
        }

        .faq-question {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: var(--font-cyber);
          font-size: 0.95rem;
          color: #ffffff;
          gap: 1rem;
        }

        .faq-answer {
          margin-top: 0.85rem;
          padding-top: 0.85rem;
          border-top: 1px solid rgba(251, 54, 64, 0.12);
          font-family: var(--font-body);
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .faq-answer p {
          margin: 0;
        }

        /* Script Code Modal */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 5, 2, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-window {
          background: #000F08;
          border: 1px solid rgba(251, 54, 64, 0.35);
          border-radius: 12px;
          width: 100%;
          max-width: 960px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(251, 54, 64, 0.2);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.4rem;
          border-bottom: 1px solid rgba(251, 54, 64, 0.2);
          background: rgba(255, 255, 255, 0.02);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .modal-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .modal-title {
          font-family: var(--font-cyber);
          font-size: 1.1rem;
          color: #ffffff;
          margin: 0;
        }

        .modal-subtitle {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .modal-header-actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .modal-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          padding: 0.45rem 0.85rem;
          border-radius: 6px;
          font-size: 0.82rem;
          font-family: var(--font-body);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-action-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .modal-action-btn.primary {
          background: var(--accent-orange);
          color: #000000;
          border-color: var(--accent-orange);
          font-weight: 700;
        }

        .modal-action-btn.primary:hover {
          background: #ffffff;
        }

        .modal-close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          color: #ffffff;
          background: rgba(251, 54, 64, 0.2);
        }

        .modal-body {
          padding: 1.25rem 1.4rem;
          overflow-y: auto;
          flex: 1;
          background: #020704;
        }

        .modal-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8rem;
          min-height: 200px;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .script-code-block {
          margin: 0;
          font-family: 'Consolas', 'Courier New', monospace;
          font-size: 0.82rem;
          line-height: 1.55;
          color: #d1d5db;
          white-space: pre-wrap;
          word-break: break-all;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
