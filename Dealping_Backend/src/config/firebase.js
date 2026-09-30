const admin = require("firebase-admin");
const { initializeApp, cert, getApps, getApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getMessaging } = require("firebase-admin/messaging");

let app;
try {
  if (!getApps().length) {
    const serviceAccount = require("./firebase-admin-key.json");
    app = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    app = getApp();
  }

  const auth = getAuth(app);
  const messaging = getMessaging(app);

  // Giữ tương thích ngược với các file gọi admin.auth() hoặc admin.messaging()
  admin.auth = () => auth;
  admin.messaging = () => messaging;
  admin.apps = getApps();

  console.log("🔥 Firebase Admin đã khởi tạo thành công!");
} catch (error) {
  console.error("Lỗi khi khởi tạo Firebase Admin SDK:", error.message);
}

module.exports = admin;
