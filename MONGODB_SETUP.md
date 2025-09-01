# MongoDB Atlas Setup Guide

## Quick Fix for Connection Error

### Option 1: Use Your Existing Atlas Cluster

If you already have a MongoDB Atlas account and cluster:

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Login with your credentials**
3. **Click "Connect" on your cluster**
4. **Choose "Connect your application"**
5. **Copy the connection string**
6. **Replace the connection string in `.env` file**

### Option 2: Create New MongoDB Atlas Cluster (Free)

1. **Go to**: https://cloud.mongodb.com/
2. **Sign up/Login**
3. **Create a new cluster** (choose FREE tier)
4. **Create database user**:
   - Username: `prithwi1016`
   - Password: `Prithwi_1100`
5. **Whitelist your IP address**: Add `0.0.0.0/0` (allows all IPs)
6. **Get connection string** and update `.env`

### Example Connection String Format:

```
mongodb+srv://prithwi1016:Prithwi_1100@cluster0.xxxxx.mongodb.net/notesvilla?retryWrites=true&w=majority
```

## Current Status

✅ **File Upload**: Working (files saved locally)
❌ **Database**: Not connected (needs Atlas URI)
✅ **Server**: Running with fallback mode

## What's Working Now:

Even without MongoDB, your app will:

- Accept file uploads
- Save files locally
- Show success messages
- Allow admin to upload notes

Once you fix the MongoDB connection, all data will be properly saved to the database!

## Steps to Fix:

1. Get your MongoDB Atlas connection string
2. Update the `MONGO_URI` in `/server/.env`
3. Restart the server with `node app.js`

That's it! 🚀
