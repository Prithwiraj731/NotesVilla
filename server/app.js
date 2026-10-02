const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const supabase = require('./utils/supabase');
const mongoose = require('mongoose');

// Connect to MongoDB
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully!'))
    .catch(err => console.log('⚠️ MongoDB connection note:', err.message));
}

const adminRoutes = require('./routes/admin.routes');
const notesRoutes = require('./routes/notes.routes');
const syllabusRoutes = require('./routes/syllabus.routes');

const app = express();

// Configure CORS for production and development
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads if available locally, with cloud fallback
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Fallback: if static file not found locally, proxy from cloud storage
app.use('/uploads/:filename', async (req, res) => {
  const storedFilename = req.params.filename;
  console.log(`📂 /uploads fallback triggered for: ${storedFilename}`);

  let externalUrl = null;

  // Look up the Cloudinary URL from Supabase
  try {
    const supabase = require('./utils/supabase');
    const { data: notes, error } = await supabase
      .from('notes')
      .select('file_url, files, filename')
      .or(`filename.eq.${storedFilename},file_url.ilike.%${storedFilename}%`);

    // Also try a broader search if the first query returned nothing
    let allNotes = notes;
    if ((!allNotes || allNotes.length === 0) && !error) {
      const { data: recentNotes } = await supabase
        .from('notes')
        .select('file_url, files, filename')
        .order('created_at', { ascending: false })
        .limit(100);
      if (recentNotes) {
        allNotes = recentNotes.filter(n =>
          (n.file_url && n.file_url.includes(storedFilename)) ||
          (Array.isArray(n.files) && n.files.some(f =>
            f.filename === storedFilename || (f.fileUrl && f.fileUrl.includes(storedFilename))
          ))
        );
      }
    }

    if (allNotes && allNotes.length > 0) {
      for (const note of allNotes) {
        if (Array.isArray(note.files)) {
          const match = note.files.find(f =>
            f.filename === storedFilename ||
            (f.fileUrl && f.fileUrl.includes(storedFilename))
          );
          if (match && match.fileUrl) {
            externalUrl = match.fileUrl;
            break;
          }
        }
        if (note.file_url && (note.file_url.includes('cloudinary') || note.file_url.includes('supabase'))) {
          externalUrl = note.file_url;
          break;
        }
      }
    }
  } catch (e) {
    console.log('⚠️ /uploads fallback DB lookup failed:', e.message);
  }

  // Try MongoDB fallback
  if (!externalUrl) {
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        const Note = require('./models/Note');
        const note = await Note.findOne({
          $or: [
            { filename: storedFilename },
            { fileUrl: { $regex: storedFilename } },
            { 'files.filename': storedFilename }
          ]
        });
        if (note) {
          if (Array.isArray(note.files)) {
            const match = note.files.find(f => f.filename === storedFilename);
            if (match && match.fileUrl) externalUrl = match.fileUrl;
          }
          if (!externalUrl && note.fileUrl) {
            externalUrl = note.fileUrl;
          }
        }
      }
    } catch (e) {
      console.log('⚠️ MongoDB fallback lookup failed:', e.message);
    }
  }

  if (externalUrl) {
    console.log(`🔄 Proxying /uploads/${storedFilename} from: ${externalUrl}`);
    const https = require('https');
    const http = require('http');
    const fetchModule = externalUrl.startsWith('https') ? https : http;

    fetchModule.get(externalUrl, (proxyRes) => {
      if (proxyRes.statusCode === 301 || proxyRes.statusCode === 302) {
        const redirectUrl = proxyRes.headers.location;
        fetchModule.get(redirectUrl, (redirectRes) => {
          if (redirectRes.headers['content-type']) {
            res.setHeader('Content-Type', redirectRes.headers['content-type']);
          }
          if (redirectRes.headers['content-length']) {
            res.setHeader('Content-Length', redirectRes.headers['content-length']);
          }
          // Allow embedding in iframe
          res.setHeader('X-Frame-Options', 'SAMEORIGIN');
          res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://notes-villa.vercel.app");
          redirectRes.pipe(res);
        }).on('error', () => {
          res.status(500).json({ msg: 'Proxy redirect error' });
        });
        return;
      }

      if (proxyRes.statusCode !== 200) {
        return res.status(proxyRes.statusCode).json({ msg: 'External file not accessible' });
      }

      if (proxyRes.headers['content-type']) {
        res.setHeader('Content-Type', proxyRes.headers['content-type']);
      }
      if (proxyRes.headers['content-length']) {
        res.setHeader('Content-Length', proxyRes.headers['content-length']);
      }
      // Allow embedding in iframe
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://notes-villa.vercel.app");
      proxyRes.pipe(res);
    }).on('error', (err) => {
      res.status(500).json({ msg: 'Proxy error', error: err.message });
    });
  } else {
    res.status(404).json({ msg: 'File not found', file: storedFilename });
  }
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/syllabus', syllabusRoutes);

// Health check endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', database: 'Supabase PostgreSQL', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

// Verify Supabase Connection
async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('notes').select('id').limit(1);
    if (error) {
      console.error('❌ Supabase database connection error:', error.message);
    } else {
      console.log('✅ Supabase PostgreSQL database connected successfully!');
      console.log('🌐 Supabase Project URL:', process.env.SUPABASE_URL || 'https://lwkmbptvbpqxcnwarwii.supabase.co');
    }
  } catch (err) {
    console.error('❌ Supabase initial check failed:', err.message);
  }
}

app.listen(PORT, () => {
  console.log(`🚀 NotesVilla Server running on port ${PORT}`);
  console.log(`📝 Admin Portal ready: /admin`);
  console.log(`🗄️ Database: Supabase Cloud PostgreSQL`);
  checkSupabaseConnection();
});

module.exports = app;
