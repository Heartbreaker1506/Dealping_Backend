const admin = require("../config/firebase");

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
