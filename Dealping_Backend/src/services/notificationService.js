const prisma = require("../config/prisma");
const { messaging } = require("../config/firebase");

/**
 * Gửi Push Notification qua Firebase Cloud Messaging (FCM)
 */
async function sendPushNotification(deviceToken, title, body, data = {}) {
  try {
    if (!deviceToken) {
      console.warn("⚠️ Không thể gửi Push: Bỏ qua vì không có deviceToken.");
      return;
    }

    if (!messaging) {
      console.warn("⚠️ Không thể gửi Push: Firebase Admin (messaging) chưa được khởi tạo.");
      return;
    }

    // FCM data values must be strings
    const serializedData = {};
    for (const [key, val] of Object.entries(data)) {
      serializedData[key] = typeof val === "string" ? val : JSON.stringify(val);
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: serializedData,
      token: deviceToken,
    };

    const response = await messaging.send(message);
    console.log("✅ Đã gửi thông báo FCM thành công:", response);
    return response;
  } catch (error) {
    console.error("❌ Lỗi khi gửi Push Notification:", error.message);
  }
}

/**
 * Tạo thông báo trong app (lưu vào database)
 */
async function createInAppNotification({
  userId,
  trackingItemId = null,
  title,
  message,
  productName = null,
  imageUrl = null,
  productUrl = null,
  oldPrice = null,
  newPrice = null,
  targetPrice = null,
  type = "PRICE_DROP",
}) {
  try {
    const record = await prisma.notification.create({
      data: {
        userId,
        trackingItemId,
        title,
        message,
        productName,
        imageUrl,
        productUrl,
        oldPrice: oldPrice ? Number(oldPrice) : null,
        newPrice: newPrice ? Number(newPrice) : null,
        targetPrice: targetPrice ? Number(targetPrice) : null,
        type,
      },
    });
    return record;
  } catch (error) {
    console.error("❌ Lỗi khi lưu notification vào DB:", error);
    throw error;
  }
}

/**
 * Xử lý sự kiện sập giá: lưu in-app notification & bắn FCM push
 */
async function notifyPriceDrop({
  userId,
  deviceToken,
  trackingItemId,
  productName,
  productUrl,
  imageUrl,
  oldPrice,
  newPrice,
  targetPrice,
}) {
  const formattedNew = new Intl.NumberFormat("vi-VN").format(newPrice) + "đ";
  const formattedTarget = new Intl.NumberFormat("vi-VN").format(targetPrice) + "đ";
  const savings = oldPrice && oldPrice > newPrice ? Math.round((1 - newPrice / oldPrice) * 100) : 25;

  const title = "🚨 DEALPING: BÁO ĐỘNG SẬP GIÁ!";
  const message = `"${productName || 'Sản phẩm'}" vừa sập giá còn ${formattedNew} (Mục tiêu: ${formattedTarget}, giảm -${savings}%). Vào chốt ngay!`;

  // 1. Lưu DB để hiển thị trên UI giao diện web/app
  const dbNotif = await createInAppNotification({
    userId,
    trackingItemId,
    title,
    message,
    productName,
    imageUrl,
    productUrl,
    oldPrice,
    newPrice,
    targetPrice,
    type: "PRICE_DROP",
  });

  // 2. Bắn Push Notification nếu có deviceToken
  if (deviceToken) {
    await sendPushNotification(deviceToken, title, message, {
      notificationId: dbNotif.id,
      trackingItemId: trackingItemId || "",
      productUrl: productUrl || "",
      newPrice: String(newPrice),
      oldPrice: String(oldPrice || ""),
    });
  }

  return dbNotif;
}

/**
 * Lấy danh sách thông báo của user
 */
async function listNotifications(userId) {
  if (!userId) return [];
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

/**
 * Đánh dấu thông báo đã đọc
 */
async function markAsRead(id, userId) {
  return await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

/**
 * Đánh dấu tất cả thông báo của user đã đọc
 */
async function markAllAsRead(userId) {
  return await prisma.notification.updateMany({
    where: { userId },
    data: { isRead: true },
  });
}

/**
 * Xóa thông báo
 */
async function deleteNotification(id, userId) {
  return await prisma.notification.deleteMany({
    where: { id, userId },
  });
}

module.exports = {
  sendPushNotification,
  createInAppNotification,
  notifyPriceDrop,
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
