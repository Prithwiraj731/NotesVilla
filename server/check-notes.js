require('dotenv').config();
const mongoose = require('mongoose');

// Note model (same as in your app)
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  subjectName: { type: String, required: true },
  topicName: { type: String, required: true },
  date: { type: Date, required: true },
  fileUrl: { type: String, required: true },
  filename: { type: String },
  uploadedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Note = mongoose.model('Note', noteSchema);

async function checkNotes() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully');
    
    console.log('\n📊 Checking notes in database...');
    const notes = await Note.find().sort({ createdAt: -1 });
    
    console.log(`📝 Total notes found: ${notes.length}`);
    
    if (notes.length > 0) {
      console.log('\n📋 Recent notes:');
      notes.slice(0, 5).forEach((note, index) => {
        console.log(`${index + 1}. ${note.title}`);
        console.log(`   Subject: ${note.subjectName} | Topic: ${note.topicName}`);
        console.log(`   File: ${note.fileUrl}`);
        console.log(`   Created: ${note.createdAt}`);
        console.log('');
      });
      
      // Check for unique subjects
      const subjects = await Note.distinct('subjectName');
      console.log(`🏫 Unique subjects: ${subjects.join(', ')}`);
      
    } else {
      console.log('❌ No notes found in database');
      console.log('💡 This means notes are not being saved properly during upload');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

checkNotes();