const admin = require("firebase-admin");
const serviceAccount = require("./travelblog-e4f43-firebase-adminsdk-fbsvc-e63eb0f485.json"); // Tải từ Firebase Console

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.FIREBASE_DB_URL
});

module.exports = admin;