const { admin } = require("./firebaseAuth");

/**
 * Gửi Push Notification qua Firebase Cloud Messaging (FCM)
 * @param {string} deviceToken - Token thiết bị của người dùng
 * @param {string} title - Tiêu đề thông báo
 * @param {string} body - Nội dung thông báo
 * @param {Object} data - Dữ liệu bổ sung (ví dụ: url sản phẩm)
 */
async function sendPushNotification(deviceToken, title, body, data = {}) {
  try {
    if (!deviceToken) {
      console.warn("⚠️ Không thể gửi thông báo: Bỏ qua vì không có deviceToken.");
      return;
    }

    if (!admin.apps.length) {
      console.warn("⚠️ Không thể gửi thông báo: Firebase Admin chưa được khởi tạo.");
      return;
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: data,
      token: deviceToken,
    };

    const response = await admin.messaging().send(message);
    console.log("✅ Đã gửi thông báo thành công:", response);
  } catch (error) {
    console.error("❌ Lỗi khi gửi Push Notification:", error.message);
  }
}

module.exports = {
  sendPushNotification,
};
