const cron = require("node-cron");
const prisma = require("../config/prisma");
const { fetchCurrentPrice } = require("./shopeePriceService");
const { sendPushNotification } = require("./notificationService");

/**
 * Bắt đầu các cron jobs để lấy giá tự động.
 */
function startCronJobs() {
  // Chạy mỗi 30 phút (tương đương với việc quét định kỳ để xem có sập giá không)
  // Có thể dùng chuỗi "*/30 * * * *" hoặc kết hợp các khung giờ flash sale nếu cần
  cron.schedule("*/30 * * * *", async () => {
    console.log("[CRON] Bắt đầu quét giá các sản phẩm đang TRACKING...");
    try {
      const trackingItems = await prisma.trackingItem.findMany({
        where: { status: "TRACKING" },
        include: { user: true },
      });

      for (const item of trackingItems) {
        if (!item.itemId || !item.shopId) {
          console.warn(`[CRON] Bỏ qua sản phẩm ${item.id} vì thiếu itemId hoặc shopId`);
          continue;
        }

        try {
          const { price } = await fetchCurrentPrice(
            item.itemId.toString(),
            item.shopId.toString()
          );

          // Lưu vào lịch sử giá
          await prisma.priceHistory.create({
            data: {
              trackingItemId: item.id,
              price: price,
            },
          });

          // So sánh giá với targetPrice
          if (price <= item.targetPrice.toNumber()) {
            await prisma.trackingItem.update({
              where: { id: item.id },
              data: { status: "TARGET_HIT" },
            });
            console.log(
              `[CRON] TING TING SẬP GIÁ: Sản phẩm ${
                item.productName || item.id
              } đã đạt giá mục tiêu (${price} <= ${item.targetPrice.toNumber()})!`
            );

            // Gửi Push Notification cho người dùng
            if (item.user && item.user.deviceToken) {
              const title = `🔥 SẬP GIÁ: ${item.productName || 'Sản phẩm bạn theo dõi'}`;
              const body = `Giá đã giảm chạm đáy mục tiêu (${price}đ). Bấm vào mua ngay kẻo lỡ!`;
              const data = { 
                shopeeUrl: item.shopeeUrl || "",
                itemId: item.itemId ? item.itemId.toString() : "",
              };
              
              await sendPushNotification(item.user.deviceToken, title, body, data);
            }
          } else {
             console.log(`[CRON] Sản phẩm ${item.productName || item.id} giá hiện tại: ${price}, chưa đạt mục tiêu (${item.targetPrice.toNumber()}).`);
          }
        } catch (error) {
          console.error(`[CRON] Lỗi khi quét giá cho sản phẩm ${item.id}:`, error.message);
        }
      }
      
      console.log("[CRON] Hoàn thành quét giá.");
    } catch (err) {
      console.error("[CRON] Lỗi chung khi chạy cron job quét giá:", err);
    }
  });

  console.log("[CRON] Đã thiết lập cron job quét giá mỗi 30 phút.");
}

module.exports = { startCronJobs };
