import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Layers, 
  Database, 
  Code, 
  Cpu, 
  Globe, 
  CheckCircle, 
  Download, 
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function Syllabus() {
  const syllabusData = [
    {
      id: 'dsa',
      subject: 'Data Structures & Algorithms',
      code: 'CS-301',
      credits: '4 Credits',
      icon: Layers,
      description: 'Foundational algorithmic concepts, asymptotic analysis, linear & non-linear data structures, trees, graphs, dynamic programming, and complexity classes.',
      units: [
        {
          unit: 'Unit 1',
          title: 'Algorithm Analysis & Linear Structures',
          topics: ['Asymptotic notations (Big O, Omega, Theta)', 'Recurrence relations & Master theorem', 'Arrays, Dynamic Arrays & Matrix operations', 'Singly, Doubly and Circular Linked Lists', 'Stack and Queue implementations & applications (Infix to Postfix)']
        },
        {
          unit: 'Unit 2',
          title: 'Hierarchical Structures & Trees',
          topics: ['Binary Trees & Traversals (Pre, In, Post, Level-order)', 'Binary Search Trees (BST) operations & balancing', 'AVL Trees (Rotations & height analysis)', 'Red-Black Trees & B/B+ Trees introduction', 'Binary Heaps, Priority Queues & Heap Sort']
        },
        {
          unit: 'Unit 3',
          title: 'Graphs & Network Algorithms',
          topics: ['Graph representations (Adjacency Matrix & List)', 'BFS and DFS traversal algorithms & cycle detection', 'Minimum Spanning Tree (Kruskal & Prim algorithms)', 'Shortest Paths (Dijkstra, Bellman-Ford, Floyd-Warshall)', 'Topological sorting & Strongly Connected Components']
        },
        {
          unit: 'Unit 4',
          title: 'Advanced Algorithm Design Techniques',
          topics: ['Divide and Conquer (Merge Sort, Quick Sort, Closest Pair)', 'Greedy Strategies (Fractional Knapsack, Huffman Coding)', 'Dynamic Programming (0/1 Knapsack, LCS, LIS, Matrix Chain)', 'Backtracking (N-Queens, Subset Sum)']
        },
        {
          unit: 'Unit 5',
          title: 'Hashing & Complexity Theory',
          topics: ['Hash functions, Collision resolution (Chaining, Open addressing)', 'Universal hashing & Bloom filters', 'Tries & Suffix Trees', 'Introduction to NP-Completeness (P, NP, NP-Hard, NP-Complete)']
        }
      ],
      references: [
        'Introduction to Algorithms - Cormen, Leiserson, Rivest, Stein (CLRS)',
        'Data Structures and Algorithms in C++ - Adam Drozdek',
        'Algorithm Design - Jon Kleinberg & Éva Tardos'
      ]
    },
    {
      id: 'fullstack',
      subject: 'Full Stack Development',
      code: 'CS-402',
      credits: '4 Credits',
      icon: Code,
      description: 'Modern full stack engineering covering client architecture, React/Next.js components, REST & GraphQL APIs, Node/Express backends, and cloud deployment pipelines.',
      units: [
        {
          unit: 'Unit 1',
          title: 'Modern Frontend Architecture & React',
          topics: ['ES6+ Javascript mastery (Closures, Promises, Async/Await)', 'React component lifecycles, Hooks (useState, useEffect, useMemo)', 'State management (Context API, Zustand, Redux Toolkit)', 'Modern CSS tooling (Tailwind CSS, Glassmorphic UI systems)']
        },
        {
          unit: 'Unit 2',
          title: 'Backend Systems & REST API Engineering',
          topics: ['Node.js runtime, Event Loop & Streams', 'Express.js architecture, custom middlewares, error pipelines', 'RESTful API best practices & OpenAPI/Swagger specifications', 'Multer file upload streaming & multi-cloud asset pipelines']
        },
        {
          unit: 'Unit 3',
          title: 'Database Architecture & ORM/ODM',
          topics: ['MongoDB document modeling, indexing strategies & aggregation pipelines', 'PostgreSQL relational schemas, constraints & transactions (ACID)', 'Mongoose ODM & Prisma ORM integration', 'Redis caching layers & session management']
        },
        {
          unit: 'Unit 4',
          title: 'Authentication, Security & Performance',
          topics: ['JSON Web Tokens (JWT) & Refresh Token rotation', 'OAuth2 / Social authentication strategies', 'Web security essentials (CORS, CSRF, XSS, Rate limiting, Helmet)', 'Performance audits, Core Web Vitals & code splitting']
        },
        {
          unit: 'Unit 5',
          title: 'DevOps, CI/CD & Cloud Deployment',
          topics: ['Docker containerization & multi-stage builds', 'GitHub Actions workflows for automated testing & linting', 'Cloud hosting (Vercel, Render, AWS EC2/S3)', 'Monitoring, logging & health checks']
        }
      ],
      references: [
        'Full Stack Development with React and Node - Fang',
        'Web Application Security - Andrew Hoffman',
        'Designing Data-Intensive Applications - Martin Kleppmann'
      ]
    },
    {
      id: 'dbms',
      subject: 'Database Management Systems',
      code: 'CS-303',
      credits: '3 Credits',
      icon: Database,
      description: 'Relational database theory, normalization paradigms, query optimization, indexing internals, transaction concurrency protocols, and distributed NoSQL architectures.',
      units: [
        {
          unit: 'Unit 1',
          title: 'Database Architecture & ER Modeling',
          topics: ['Three-schema architecture & data independence', 'Entity-Relationship (ER) & Enhanced ER (EER) modeling', 'Mapping ER diagrams to Relational Schemas', 'Integrity constraints (Primary, Foreign, Unique, Check)']
        },
        {
          unit: 'Unit 2',
          title: 'Relational Algebra & Advanced SQL',
          topics: ['Relational algebra operations (Select, Project, Joins, Division)', 'Complex SQL queries, subqueries & CTEs', 'Window functions, aggregate operations & grouping', 'Views, triggers, stored procedures & indexing directives']
        },
        {
          unit: 'Unit 3',
          title: 'Normalization & Schema Refinement',
          topics: ['Functional dependencies & Armstrong axioms', 'First, Second & Third Normal Forms (1NF, 2NF, 3NF)', 'Boyce-Codd Normal Form (BCNF)', 'Fourth (4NF) & Fifth (5NF) Normal Forms', 'Lossless join & dependency preserving decompositions']
        },
        {
          unit: 'Unit 4',
          title: 'Transactions, Concurrency & Recovery',
          topics: ['ACID properties & Transaction states', 'Serializability (Conflict & View serializability)', 'Lock-based protocols (2PL, Strict 2PL, Deadlock handling)', 'Timestamp ordering & Multi-version concurrency control (MVCC)', 'Log-based recovery, WAL & checkpoints (ARIES)']
        },
        {
          unit: 'Unit 5',
          title: 'Storage Internals & Distributed NoSQL',
          topics: ['File organization, B-Tree and B+ Tree indexing mechanisms', 'Query processing & cost-based optimization pipelines', 'NoSQL paradigms (Key-Value, Document, Columnar, Graph)', 'CAP Theorem & distributed partitioning']
        }
      ],
      references: [
        'Database System Concepts - Silberschatz, Korth, Sudarshan',
        'Fundamentals of Database Systems - Elmasri & Navathe',
        'SQL Performance Explained - Markus Winand'
      ]
    },
    {
      id: 'os',
      subject: 'Operating Systems',
      code: 'CS-304',
      credits: '4 Credits',
      icon: Cpu,
      description: 'Process scheduling, concurrency primitives, synchronization algorithms, virtual memory hierarchies, file systems, and kernel protection mechanisms.',
      units: [
        {
          unit: 'Unit 1',
          title: 'OS Structure & Process Management',
          topics: ['Kernel architectures (Monolithic vs Microkernel)', 'Process states, PCB, Context switching & System calls', 'CPU Scheduling algorithms (FCFS, SJF, Round Robin, Multi-level queues)', 'Inter-process communication (Pipes, Shared Memory, Message Queues)']
        },
        {
          unit: 'Unit 2',
          title: 'Concurrency, Synchronization & Deadlocks',
          topics: ['Critical Section problem & Peterson algorithm', 'Hardware synchronization, Semaphores & Mutex locks', 'Classical synchronization problems (Dining Philosophers, Readers-Writers)', 'Deadlock characterization, Banker algorithm & deadlock detection']
        },
        {
          unit: 'Unit 3',
          title: 'Memory Management & Virtual Memory',
          topics: ['Contiguous memory allocation, Paging & Segmentation', 'Virtual memory, Page faults & demand paging', 'Page replacement algorithms (FIFO, LRU, Optimal, Clock)', 'Thrashing & Working set model']
        },
        {
          unit: 'Unit 4',
          title: 'File Systems & Storage Management',
          topics: ['File concepts, directory structures & access methods', 'File system mounting, allocation methods (Indexed, Linked, Contiguous)', 'Free space management & Inode internals', 'Disk scheduling (SSTF, SCAN, C-SCAN, LOOK)']
        }
      ],
      references: [
        'Operating System Concepts - Silberschatz, Galvin, Gagne',
        'Modern Operating Systems - Andrew S. Tanenbaum',
        'Operating Systems: Three Easy Pieces - Arpaci-Dusseau'
      ]
    }
  ];

  const [activeSubject, setActiveSubject] = useState(syllabusData[0]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 20%, rgba(251, 54, 64, 0.09) 0%, #000F08 75%)',
      padding: '2rem 1.5rem',
      paddingTop: '6.5rem',
      boxSizing: 'border-box'
    }}>
      {/* Header Section */}
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
          <BookOpen size={16} style={{ color: 'var(--accent-orange)' }} />
          <span style={{
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-tech)',
            fontWeight: '700',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontSize: '0.9rem'
          }}>
            Curriculum & Academic Blueprint
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
          COURSE SYLLABUS
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
          fontSize: '1.05rem',
          maxWidth: '650px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Structured unit-by-unit syllabus breakdowns, module objectives, and recommended references for every academic course.
        </p>
      </div>

      {/* Subject Selector Tabs */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 2.5rem',
        display: 'flex',
        gap: '0.75rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        scrollbarWidth: 'none'
      }}>
        {syllabusData.map((item) => {
          const isSelected = activeSubject.id === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubject(item)}
              className="cyber-panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '8px',
                border: isSelected ? '1px solid var(--accent-orange)' : '1px solid rgba(251, 54, 64, 0.15)',
                background: isSelected ? 'rgba(251, 54, 64, 0.12)' : 'rgba(0, 15, 8, 0.6)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                fontFamily: 'var(--font-tech)',
                fontSize: '1.05rem',
                fontWeight: isSelected ? '700' : '500',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.25s ease',
                boxShadow: isSelected ? '0 0 15px rgba(251, 54, 64, 0.2)' : 'none'
              }}
            >
              <Icon size={18} style={{ color: isSelected ? 'var(--accent-orange)' : 'var(--text-muted)' }} />
              <span>{item.subject}</span>
            </button>
          );
        })}
      </div>

      {/* Subject Header Banner */}
      <div 
        className="cyber-panel"
        style={{
          maxWidth: '1200px',
          margin: '0 auto 2.5rem',
          borderRadius: '12px',
          padding: '2rem',
          border: '1px solid rgba(251, 54, 64, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              background: 'var(--accent-orange)',
              color: '#000',
              fontFamily: 'var(--font-cyber)',
              fontSize: '0.85rem',
              fontWeight: '900',
              padding: '0.2rem 0.6rem',
              borderRadius: '4px'
            }}>
              {activeSubject.code}
            </span>
            <span style={{
              background: 'rgba(251, 54, 64, 0.08)',
              border: '1px solid rgba(251, 54, 64, 0.2)',
              color: 'var(--accent-orange)',
              fontFamily: 'var(--font-tech)',
              fontSize: '0.85rem',
              fontWeight: '700',
              padding: '0.2rem 0.6rem',
              borderRadius: '4px'
            }}>
              {activeSubject.credits}
            </span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-cyber)',
            fontSize: '1.8rem',
            color: '#ffffff',
            margin: '0 0 0.6rem'
          }}>
            {activeSubject.subject}
          </h2>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            maxWidth: '750px',
            lineHeight: '1.6',
            margin: 0
          }}>
            {activeSubject.description}
          </p>
        </div>

        <a
          href={`/notes?subject=${encodeURIComponent(activeSubject.subject)}`}
          className="cyber-btn-orange"
          style={{ textDecoration: 'none' }}
        >
          <BookOpen size={16} />
          <span>Explore Subject Notes</span>
        </a>
      </div>

      {/* Unit Wise Breakdown */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 3rem' }}>
        <h3 style={{
          fontFamily: 'var(--font-cyber)',
          fontSize: '1.3rem',
          color: '#ffffff',
          letterSpacing: '0.05em',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <Layers size={18} style={{ color: 'var(--accent-orange)' }} />
          Detailed Modular Units
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {activeSubject.units.map((unit, idx) => (
            <div
              key={idx}
              className="cyber-panel"
              style={{
                borderRadius: '8px',
                padding: '1.5rem',
                border: '1px solid rgba(251, 54, 64, 0.15)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-orange)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(251, 54, 64, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(251, 54, 64, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'var(--font-tech)',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: 'var(--accent-orange)',
                  background: 'rgba(251, 54, 64, 0.08)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(251, 54, 64, 0.25)'
                }}>
                  {unit.unit}
                </span>
                <h4 style={{
                  fontFamily: 'var(--font-cyber)',
                  fontSize: '1.2rem',
                  color: '#ffffff',
                  margin: 0
                }}>
                  {unit.title}
                </h4>
              </div>

              <ul style={{
                listStyleType: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '0.6rem'
              }}>
                {unit.topics.map((t, tIdx) => (
                  <li key={tIdx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    lineHeight: '1.5'
                  }}>
                    <ChevronRight size={14} style={{ color: 'var(--accent-orange)', flexShrink: 0, marginTop: '3px' }} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Textbooks & Reference Materials */}
      <div 
        className="cyber-panel"
        style={{
          maxWidth: '1200px',
          margin: '0 auto 4rem',
          borderRadius: '8px',
          padding: '1.75rem',
          border: '1px solid rgba(251, 54, 64, 0.15)'
        }}
      >
        <h4 style={{
          fontFamily: 'var(--font-cyber)',
          fontSize: '1.1rem',
          color: '#ffffff',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FileText size={16} style={{ color: 'var(--accent-orange)' }} />
          Standard Reference Textbooks
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {activeSubject.references.map((ref, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem'
            }}>
              <CheckCircle size={14} style={{ color: '#10B981', flexShrink: 0 }} />
              <span>{ref}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
