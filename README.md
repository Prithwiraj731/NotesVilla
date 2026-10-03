<div align="center">

# 📚 NotesVilla (Knowledge Dock)

### *A High-Performance Academic Hub & Developer Lab Companion*

Eliminating exam-night chaos, expired links, and WhatsApp group scrambling forever.

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Vercel-ff4b4b?style=for-the-badge&logo=vercel&logoColor=white)](https://notes-villa.vercel.app)
[![API Status](https://img.shields.io/badge/API-Render%20Cloud-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://notesvilla-sige.onrender.com/test)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-Supabase%20Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<br/>

[🚀 Live Preview](https://notes-villa.vercel.app) • [📖 Features](#-key-features) • [📱 Responsive UI](#-application-showcase) • [☁️ Architecture](#️-cloud-architecture) • [🛠️ Local Setup](#️-getting-started)

</div>

---

## 🎥 Walkthrough Video

<div align="center">
  <video src="client/src/assets/notesvillaVideo.mp4" width="100%" controls autoplay loop muted>
    Your browser does not support the video tag. You can view the video file directly at <a href="client/src/assets/notesvillaVideo.mp4">client/src/assets/notesvillaVideo.mp4</a>.
  </video>
</div>

---

## 💡 The Problem & Motivation

Engineering students spend 4 years scrambling across 15+ different WhatsApp groups before exams:
- ❌ *"Link expired"* or *"Request access"* on Google Drive.
- ❌ 404s, broken links, and missing syllabus PDFs the night before a test.
- ❌ Chaotic files where theory notes, lab manuals, and previous year questions (PYQs) are completely mixed up.
- ❌ Practical exam failures because students struggle with setting up compilers and lab dependencies on Linux/Ubuntu.

**NotesVilla** solves this by centralizing all academic materials into a single, high-speed, mobile-responsive portal with in-browser previews and automated lab setup scripts.

---

## ⚡ Key Features

* **⚡ Instant In-Browser DocViewer:** Preview slides, DOCX, and multi-page PDFs with zero lag — no forced downloads or storage clutter required.
* **📂 Smart Categorization:** Every subject bifurcated into **Theory Notes**, **Lab Materials**, and **Suggestions / PYQs** with real-time counters.
* **🐧 Automated Ubuntu Lab Setup:** Integrated bash automation (`setup.sh`) and curl one-liners to install VS Code, GCC/G++, Python, and networking tools in 1-click for practical exams.
* **☁️ Resilient Multi-Cloud Engine:** Managed Supabase PostgreSQL with automated MongoDB Atlas fallback and Cloudinary CDN for fault-tolerant document delivery.
* **🛡️ Secure Admin Portal:** JWT-authenticated administrative dashboard featuring batch file drag-and-drop uploads, category assignment, and real-time management.
* **📱 100% Mobile First:** Fully optimized cyberpunk-inspired UI engineered for seamless navigation on both desktop and mobile viewports.

---

## 📱 Application Showcase

### 1. Landing Page (Desktop vs. Mobile)
Seamless cyberpunk aesthetic with fluid animations and responsive drawer navigation.

| Desktop Hero View | Mobile Viewport |
| :---: | :---: |
| <img src="client/src/assets/image1.png" alt="Desktop Landing Page" width="100%" /> | <img src="client/src/assets/image4.png" alt="Mobile Landing View" width="280px" /> |

<br/>

### 2. Course Notes Archive & Subject Directory
Organized subject directories displaying real-time counts for Theory, Lab, and Suggestion resources.

| Desktop Notes Directory | Mobile Subject Cards |
| :---: | :---: |
| <img src="client/src/assets/image2.png" alt="Desktop Course Notes Archive" width="100%" /> | <img src="client/src/assets/image5.png" alt="Mobile Course Notes" width="280px" /> |

<br/>

### 3. Automated Ubuntu CS Lab Terminal
Automated Linux developer environment installer with terminal commands and script preview.

<div align="center">
  <img src="client/src/assets/image3.png" alt="Ubuntu Lab Setup Script" width="95%" />
</div>

---

## ☁️ Cloud Architecture & Data Flow

NotesVilla utilizes a decoupled, fault-tolerant cloud architecture designed for high availability during exam-season peak traffic:

```
[ Student Clients (Desktop / Mobile) ]
                 │
                 ├── 1. Static Web Bundle ───────────► [ Vercel Global Edge CDN ]
                 │
                 └── 2. Dynamic API Requests ────────► [ Render Web Service ]
                                                            (Node.js / Express API)
                                                                 │
                          ┌──────────────────────────────────────┼────────────────────────┐
                          ▼                                      ▼                        ▼
                [ Supabase PostgreSQL ]                 [ MongoDB Atlas ]        [ Cloudinary Multi-CDN ]
               (Primary Relational DB)                 (Automated Fallback)      (Fast Binary Asset Delivery)
                          │                                                               │
                          └──────────◄── Zero-Buffer Streaming Proxy ─────────────────────┘
```

1. **Edge Tier (Vercel):** Serves cached HTML, CSS, and JS chunks across global points of presence (PoPs), offloading server bandwidth.
2. **Compute Tier (Render):** Stateless containerized Node.js REST API handling upload queues, authentication, and reverse-proxy stream forwarding.
3. **Data Tier (Supabase + Mongo):** Primary ACID-compliant PostgreSQL database with JSONB multi-file array structures, coupled with an active failover to MongoDB Atlas.
4. **Storage Tier (Cloudinary):** Multi-CDN storage network providing instant asset optimization and edge delivery for large PDF manuals and lecture slides.

---

## 🛠️ The Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 7, Tailwind CSS v4, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express 5, Multer, JSON Web Tokens (JWT), BcryptJS |
| **Database** | Supabase (PostgreSQL), MongoDB Atlas (Mongoose failover) |
| **Cloud Storage** | Cloudinary CDN, Node.js Stream Reverse-Proxy |
| **Hosting & CI/CD** | Vercel (Client Edge), Render (API Web Service), GitHub Actions |

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn
- Supabase / MongoDB credentials
- Cloudinary account credentials

### 1. Clone the Repository
```bash
git clone https://github.com/Prithwiraj731/NotesVilla.git
cd NotesVilla
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
NODE_ENV=development
BACKEND_URL=http://localhost:5000
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/notesvilla

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:
```env
VITE_API_BASE=http://localhost:5000/api
```

Start the Vite development server:
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser!

---

## 📡 API Reference

### Public Routes
* `GET /api/notes` - Fetch all notes with pagination and category filters
* `GET /api/notes/subjects` - List all unique academic subjects
* `GET /api/notes/subject/:subjectName` - Get all materials for a specific subject
* `GET /api/notes/note/:id` - Fetch single note metadata
* `GET /api/notes/download/:filename` - Stream file download with cloud fallback
* `GET /api/syllabus` - Fetch all course syllabus documents
* `GET /test` - Health check & database connection status

### Admin Routes (Protected by JWT)
* `POST /api/admin/login` - Administrator login
* `POST /api/notes/upload` - Batch upload multiple files with subject categorization
* `POST /api/notes/upload-single` - Upload single note file
* `PUT /api/notes/note/:id` - Update note title, category, or subject
* `DELETE /api/notes/note/:id` - Delete note and clean storage assets
* `POST /api/syllabus/upload` - Upload course syllabus document
* `DELETE /api/syllabus/:id` - Delete syllabus document

---

## 🤝 Contributing

Contributions make the open-source community an inspiring place to learn, inspire, and create:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  Made with ❤️ by <b>NotesVilla Team</b> for students everywhere.
</div>
