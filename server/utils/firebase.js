const admin = require('firebase-admin');
const path = require('path');

let initialized = false;
function initFirebase() {
  if (initialized) return;
  // Option A: use serviceAccountKey.json in server root (recommended for dev)
  const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_BUCKET
  });
  initialized = true;
}

exports.uploadFile = async (localFilePath, destFileName) => {
  initFirebase();
  const bucket = admin.storage().bucket();
  await bucket.upload(localFilePath, {
    destination: destFileName,
    metadata: { cacheControl: 'public, max-age=31536000' }
  });
  const file = bucket.file(destFileName);
  // make public (optional). If you want token-based download you can generate signed URL.
  await file.makePublic();
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(destFileName)}`;
  return publicUrl;
};
