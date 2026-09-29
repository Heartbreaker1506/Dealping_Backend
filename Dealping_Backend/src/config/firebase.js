const admin = require('firebase-admin');

// Đọc file key JSON bạn đã bỏ vào thư mục config
const serviceAccount = require('./firebase-admin-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log("🔥 Firebase Admin đã khởi tạo thành công!");

module.exports = admin;
