import React, { useState } from 'react';
import { 
  HelpCircle, 
  FileText, 
  Download, 
  Layers, 
  Database, 
  Code, 
  Cpu, 
  CheckCircle, 
  Award, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

export default function PracticeQuestions() {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);

  const practiceData = [
    {
      id: 'dsa-model-1',
      subject: 'Data Structures & Algorithms',
      subjectCode: 'CS-301',
      type: 'Model Paper',
      title: 'Mid-Term Model Examination Paper: Trees & Dynamic Programming',
      difficulty: 'Hard',
      questionsCount: '15 Questions',
      timeEstimate: '3 Hours',
      marks: '100 Marks',
      description: 'Comprehensive exam pattern covering AVL balancing, Graph traversal shortest paths, Matrix Chain Multiplication, and Knapsack variations.',
      sampleQuestions: [
        'Q1. Construct an AVL tree by inserting the elements: 21, 26, 30, 9, 4, 14, 28, 18, 15, 10. Show balance factors and rotations at every step.',
        'Q2. Write Dijkstra\'s Shortest Path algorithm. Analyze its time complexity using (a) Adjacency Matrix and (b) Min-Heap priority queue.',
        'Q3. Formulate the recurrence relation for the 0/1 Knapsack problem and provide the bottom-up DP table algorithm with space optimization.',
        'Q4. Prove that the height of a Red-Black tree with n internal nodes is at most 2 * log2(n + 1).'
      ]
    },
    {
      id: 'dsa-pyq-2025',
      subject: 'Data Structures & Algorithms',
      subjectCode: 'CS-301',
      type: 'PYQ',
      title: 'End-Semester University Exam Paper (2025 Session)',
      difficulty: 'Medium',
      questionsCount: '20 Questions',
      timeEstimate: '3 Hours',
      marks: '100 Marks',
      description: 'Original previous year question paper with questions on Asymptotic Notations, Binary Search Trees, Prim\'s MST, and Topological Sort.',
      sampleQuestions: [
        'Q1. Explain Master Theorem and solve: T(n) = 3T(n/4) + n log n.',
        'Q2. Implement a circular queue using an array without wasting one empty memory cell.',
        'Q3. Compare Prim\'s vs Kruskal\'s Algorithm for Minimum Spanning Trees. Which is preferred for dense graphs and why?',
        'Q4. Describe the collision resolution techniques in Hashing: Linear Probing vs Quadratic Probing vs Double Hashing.'
      ]
    },
    {
      id: 'fullstack-model-1',
      subject: 'Full Stack Development',
      subjectCode: 'CS-402',
      type: 'Model Paper',
      title: 'MERN Stack & Cloud Architecture Practical Practice Set',
      difficulty: 'Intermediate',
      questionsCount: '12 Questions',
      timeEstimate: '2.5 Hours',
      marks: '75 Marks',
      description: 'Architectural questions covering React 19 hooks, Express error pipelines, JWT security, MongoDB aggregation pipelines, and Dockerized deployments.',
      sampleQuestions: [
        'Q1. Design an authentication middleware in Express.js that validates JWT tokens and handles token expiration with refresh token rotation.',
        'Q2. Write a MongoDB aggregation pipeline to find the top 5 students with the highest average test scores grouped by department.',
        'Q3. Explain the React Reconciliation algorithm (Fiber architecture) and why using array indices as `key` prop causes rendering bugs.',
        'Q4. What is CORS and how does a browser preflight OPTIONS request work? Provide the Express middleware configuration to secure production origins.'
      ]
    },
    {
      id: 'dbms-model-1',
      subject: 'Database Management Systems',
      subjectCode: 'CS-303',
      type: 'Model Paper',
      title: 'DBMS Model Test: Relational Algebra, SQL & Normalization',
      difficulty: 'Hard',
      questionsCount: '18 Questions',
      timeEstimate: '3 Hours',
      marks: '100 Marks',
      description: 'Problem sets on BCNF decomposition, Serializability testing, ACID concurrency schedules, and complex multi-table SQL queries.',
      sampleQuestions: [
        'Q1. Given relation R(A, B, C, D, E) with FDs: { A -> BC, CD -> E, B -> D, E -> A }. Determine candidate keys and highest normal form.',
        'Q2. Construct the Precedence (Serialization) Graph for a given concurrent transaction schedule and test for conflict serializability.',
        'Q3. Write SQL queries using Window Functions (ROW_NUMBER, RANK, DENSE_RANK) to rank employees by salary within each department.',
        'Q4. Explain Two-Phase Locking (2PL) protocol. Differentiate between Strict 2PL and Rigorous 2PL with respect to cascading aborts.'
      ]
    },
    {
      id: 'os-model-1',
      subject: 'Operating Systems',
      subjectCode: 'CS-304',
      type: 'Model Paper',
      title: 'OS Problem Set: CPU Scheduling, Semaphores & Paging',
      difficulty: 'Medium',
      questionsCount: '16 Questions',
      timeEstimate: '3 Hours',
      marks: '100 Marks',
      description: 'Numerical problems on Gantt charts for Round Robin, Banker Algorithm for Deadlock Avoidance, and Page Fault calculations (FIFO, LRU, Optimal).',
      sampleQuestions: [
        'Q1. Given 5 processes with arrival and burst times, calculate average Turnaround Time and Waiting Time under Round Robin (quantum = 3ms) and SRTF.',
        'Q2. Apply Banker\'s Algorithm to determine if the system state is safe, and find the safe execution sequence.',
        'Q3. Given reference string: 7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1 with 3 page frames, calculate page faults using FIFO, LRU, and Optimal replacement.',
        'Q4. Solve the Readers-Writers problem using Semaphores and prevent reader starvation.'
      ]
    }
  ];

  const filteredData = practiceData.filter(item => {
    const matchesSubject = selectedSubject === 'all' || item.subject === selectedSubject;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesType && matchesSearch;
  });

  const toggleExpand = (id) => {
    setExpandedCard(prev => prev === id ? null : id);
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'Hard': return '#FB3640';
      default: return 'var(--accent-orange)';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 20%, rgba(251, 54, 64, 0.09) 0%, #000F08 75%)',
      padding: '2rem 1.5rem',
      paddingTop: '6.5rem',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 2.5rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(251, 54, 64, 0.08)',
          border: '1px solid rgba(251, 54, 64, 0.25)',
          borderRadius: '4px',
          padding: '0.4rem 1.2rem',
          marginBottom: '1rem'
        }}>
          <HelpCircle size={16} style={{ color: 'var(--accent-orange)' }} />
          <span style={{
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-tech)',
            fontWeight: '700',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontSize: '0.9rem'
          }}>
            Exam Preparation & Problem Archive
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
          fontWeight: '900',
          fontFamily: 'var(--font-cyber)',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          background: 'linear-gradient(135deg, #ffffff 30%, var(--accent-orange) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 1rem'
        }}>
          PRACTICE QUESTIONS
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
          fontSize: '1.05rem',
          maxWidth: '650px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Curated model papers, university PYQs, topic problem sheets, and exam-grade practice questions designed to test your mastery.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div 
        className="cyber-panel"
        style={{
          maxWidth: '1200px',
          margin: '0 auto 2.5rem',
          borderRadius: '8px',
          padding: '1.5rem'
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          gap: '1.2rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search problem sets, exam questions, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '3rem !important',
                fontFamily: 'var(--font-tech)',
                fontSize: '1.1rem'
              }}
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{
              width: window.innerWidth < 768 ? '100%' : '240px',
              fontFamily: 'var(--font-tech)',
              fontSize: '1.05rem'
            }}
          >
            <option value="all">All Subjects</option>
            <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
            <option value="Full Stack Development">Full Stack Development</option>
            <option value="Database Management Systems">Database Management Systems</option>
            <option value="Operating Systems">Operating Systems</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              width: window.innerWidth < 768 ? '100%' : '180px',
              fontFamily: 'var(--font-tech)',
              fontSize: '1.05rem'
            }}
          >
            <option value="all">All Types</option>
            <option value="Model Paper">Model Papers</option>
            <option value="PYQ">Previous Years (PYQs)</option>
          </select>
        </div>
      </div>

      {/* Problem Sets Listing */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filteredData.length === 0 ? (
          <div 
            className="cyber-panel"
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              borderRadius: '8px',
              color: 'var(--text-secondary)'
            }}
          >
            <FileText size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
            <h3 style={{ fontFamily: 'var(--font-cyber)', fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>NO PRACTICE SETS FOUND</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          filteredData.map((item) => {
            const isExpanded = expandedCard === item.id;
            return (
              <div 
                key={item.id}
                className="cyber-panel"
                style={{
                  borderRadius: '10px',
                  padding: '1.8rem',
                  border: '1px solid rgba(251, 54, 64, 0.18)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Top Meta Bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.8rem'
                }}>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{
                      background: 'var(--accent-orange)',
                      color: '#000000',
                      fontFamily: 'var(--font-cyber)',
                      fontSize: '0.8rem',
                      fontWeight: '900',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {item.type}
                    </span>
                    <span style={{
                      background: 'rgba(251, 54, 64, 0.08)',
                      border: '1px solid rgba(251, 54, 64, 0.25)',
                      color: 'var(--accent-orange)',
                      fontFamily: 'var(--font-tech)',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px'
                    }}>
                      {item.subject} ({item.subjectCode})
                    </span>
                  </div>

                  {/* Difficulty & Marks Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-tech)',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: getDifficultyColor(item.difficulty)
                    }}>
                      ● {item.difficulty}
                    </span>
                    <span style={{
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-tech)',
                      fontSize: '0.85rem'
                    }}>
                      {item.marks}
                    </span>
                  </div>
                </div>

                {/* Title and Description */}
                <h3 style={{
                  fontFamily: 'var(--font-cyber)',
                  fontSize: '1.35rem',
                  color: '#ffffff',
                  margin: '0 0 0.6rem',
                  lineHeight: '1.3'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  margin: '0 0 1.25rem'
                }}>
                  {item.description}
                </p>

                {/* Specs Pill List */}
                <div style={{
                  display: 'flex',
                  gap: '1.2rem',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-tech)',
                  fontSize: '0.95rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FileText size={15} style={{ color: 'var(--accent-orange)' }} />
                    <span>{item.questionsCount}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={15} style={{ color: 'var(--accent-orange)' }} />
                    <span>{item.timeEstimate}</span>
                  </div>
                </div>

                {/* Question Preview Expandable Drawer */}
                {isExpanded && (
                  <div style={{
                    background: 'rgba(0, 5, 2, 0.7)',
                    border: '1px solid rgba(251, 54, 64, 0.15)',
                    borderRadius: '6px',
                    padding: '1.25rem',
                    marginBottom: '1.25rem',
                    animation: 'fadeIn 0.2s ease-in'
                  }}>
                    <h4 style={{
                      fontFamily: 'var(--font-cyber)',
                      fontSize: '0.95rem',
                      color: 'var(--accent-orange)',
                      marginBottom: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Featured Problem Highlights:
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {item.sampleQuestions.map((q, qIdx) => (
                        <div key={qIdx} style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.9rem',
                          color: '#e2e8f0',
                          lineHeight: '1.5',
                          paddingLeft: '0.5rem',
                          borderLeft: '2px solid rgba(251, 54, 64, 0.4)'
                        }}>
                          {q}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(251, 54, 64, 0.1)'
                }}>
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="cyber-btn-wire"
                    style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp size={15} /> Hide Questions
                      </>
                    ) : (
                      <>
                        <ChevronDown size={15} /> Preview Problem Set
                      </>
                    )}
                  </button>

                  <a
                    href={`/notes?subject=${encodeURIComponent(item.subject)}`}
                    className="cyber-btn-orange"
                    style={{
                      padding: '0.45rem 1.2rem',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      clipPath: 'none',
                      borderRadius: '4px'
                    }}
                  >
                    <FileText size={14} />
                    <span>View Subject Notes & Solutions</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
