# NotesVilla Server Setup Guide

## Prerequisites

1. Make sure you have Node.js installed
2. Make sure you have your MongoDB Atlas connection string ready

## Setup Steps

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Update the `.env` file in the server directory with your MongoDB Atlas URI:

```
PORT=5000
# Replace this with your actual MongoDB Atlas connection string
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/notesvilla?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
JWT_EXPIRES_IN=24h

# Admin credentials
ADMIN_USERNAME=prithwi1016
ADMIN_PASSWORD=Prithwi_1100

# Firebase Configuration (optional for now)
FIREBASE_BUCKET=your-project-id.appspot.com
```

### 3. Start the Server

```bash
node app.js
```

## What's Fixed

✅ **MongoDB Integration Restored**: All database operations now properly save to MongoDB Atlas
✅ **File Upload Working**: Files are saved locally and URLs stored in database
✅ **Error Handling**: Better error messages and validation
✅ **Note Model**: Properly structured with subjectName, topicName, and date fields
✅ **API Endpoints**: All CRUD operations working with MongoDB

## Database Structure

The notes are saved with this structure in MongoDB:

```javascript
{
  title: "Note Title",
  description: "Note Description",
  subjectName: "Subject Name",
  topicName: "Topic Name",
  date: "2025-08-29T00:00:00.000Z",
  fileUrl: "http://localhost:5000/uploads/filename",
  filename: "original-filename.pdf",
  uploadedBy: "admin",
  createdAt: "2025-08-29T01:48:00.000Z"
}
```

## Troubleshooting

If you get connection errors:

1. Check your MongoDB Atlas connection string
2. Make sure your IP is whitelisted in MongoDB Atlas
3. Verify your username/password are correct

The server will show detailed error messages in the console to help debug any issues.
