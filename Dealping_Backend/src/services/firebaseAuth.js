const admin = require("firebase-admin");

// Khởi tạo Firebase Admin SDK
// Đảm bảo không ném lỗi nếu thiếu config trong môi trường dev chưa setup xong
try {
  if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newline characters from env string
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log("Firebase Admin SDK initialized successfully");
  } else {
    console.warn("⚠️ Bỏ qua khởi tạo Firebase Admin do thiếu FIREBASE_PROJECT_ID. Tính năng xác thực sẽ không hoạt động.");
  }
} catch (error) {
  console.error("Lỗi khi khởi tạo Firebase Admin SDK:", error.message);
}

/**
 * Xác thực Firebase ID Token (được gửi từ Frontend)
 * @param {string} idToken - Token lấy từ Google/Apple Sign-In trên client
 * @returns {Promise<Object>} Decoded token chứa thông tin user (uid, email...)
 */
async function verifyFirebaseToken(idToken) {
  if (!idToken) {
    throw new Error("Token bị trống");
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Xác thực Firebase Token thất bại:", error.message);
    throw new Error("Token không hợp lệ hoặc đã hết hạn");
  }
}

module.exports = {
  admin,
  verifyFirebaseToken,
};
