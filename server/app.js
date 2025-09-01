require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const notesRoutes = require('./routes/notes.routes');

const app = express();

// Configure CORS for production and development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://notesvilla-frontend.netlify.app', 'https://notesvilla-frontend.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static uploads if you want to allow download fallback
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Remove user auth routes - only keep admin and notes
console.log('🗺 Loading routes...');
app.use('/api/admin', adminRoutes);
console.log('✅ Admin routes loaded at /api/admin');
app.use('/api/notes', notesRoutes);
console.log('✅ Notes routes loaded at /api/notes');

// Add a test route to verify server is working
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});
console.log('✅ Test route added at /test');


const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas with improved error handling
console.log('🔗 Attempting to connect to MongoDB Atlas...');
console.log('📋 Using MONGO_URI:', process.env.MONGO_URI ? 'URI is set' : 'URI is missing');
if (process.env.MONGO_URI) {
  console.log('🌐 Connection URL preview:', process.env.MONGO_URI.substring(0, 30) + '...');
}

mongoose.connect(process.env.MONGO_URI, { 
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Connection state:', mongoose.connection.readyState);
    console.log('📋 Database name:', mongoose.connection.db.databaseName);
    console.log('🔗 Connection host:', mongoose.connection.host);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Admin credentials: ${process.env.ADMIN_USERNAME}`);
      console.log('📺 Ready to accept requests!');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:');
    console.error('Error message:', err.message);
    
    if (err.message.includes('ECONNREFUSED')) {
      console.error('\n🔧 SOLUTION: Update your MONGO_URI in the .env file');
      console.error('   Get your connection string from MongoDB Atlas:');
      console.error('   1. Go to https://cloud.mongodb.com/');
      console.error('   2. Select your cluster -> Connect -> Connect your application');
      console.error('   3. Copy the connection string and update .env file');
      console.error('   Example: mongodb+srv://username:password@cluster.mongodb.net/notesvilla');
    }
    
    console.error('\n💡 Starting server without database for testing...');
    // Start server anyway for testing frontend
    app.listen(PORT, () => {
      console.log(`⚠️  Server running on port ${PORT} (WITHOUT DATABASE)`);
      console.log('   Please fix MongoDB connection to enable full functionality');
    });
  });
