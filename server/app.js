require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const supabase = require('./utils/supabase');

const adminRoutes = require('./routes/admin.routes');
const notesRoutes = require('./routes/notes.routes');

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

// Serve static uploads if fallback needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/notes', notesRoutes);

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
