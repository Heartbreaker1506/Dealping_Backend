const { initializeApp, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const { getAuth } = require('firebase-admin/auth');

// Đọc file key JSON bạn đã bỏ vào thư mục config
const serviceAccount = require('./firebase-admin-key.json');

let app;
try {
  app = initializeApp({
    credential: cert(serviceAccount)
  });
  console.log("🔥 Firebase Admin đã khởi tạo thành công!");
} catch (err) {
  console.error("Lỗi khởi tạo Firebase Admin:", err.message);
}

const messaging = app ? getMessaging(app) : null;
const auth = app ? getAuth(app) : null;

module.exports = { app, messaging, auth };
