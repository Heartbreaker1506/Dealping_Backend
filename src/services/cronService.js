const cron = require("node-cron");
const prisma = require("../config/prisma");
const { fetchCurrentPrice: fetchShopeePrice } = require("./shopeePriceService");
const tiktokPriceService = require("./tiktokPriceService");

/**
 * Bắt đầu các cron jobs để lấy giá tự động.
 */
function startCronJobs() {
  // Chạy mỗi 30 phút quét giá tự động các sản phẩm đang theo dõi
  cron.schedule("*/30 * * * *", async () => {
    console.log("[CRON] Bắt đầu quét giá các sản phẩm đang TRACKING...");
    try {
      const trackingItems = await prisma.trackingItem.findMany({
        where: { status: "TRACKING" },
      });

      for (const item of trackingItems) {
        try {
          let currentPrice = null;

          if (item.shopeeUrl && /tiktok/.test(item.shopeeUrl)) {
            const tiktokInfo = await tiktokPriceService.fetchCurrentPrice(item.shopeeUrl, item.itemId?.toString());
            currentPrice = tiktokInfo.price;
          } else if (item.itemId && item.shopId) {
            const shopeeInfo = await fetchShopeePrice(
              item.itemId.toString(),
              item.shopId.toString(),
              item.shopeeUrl || ""
            );
            currentPrice = shopeeInfo.price;
          } else if (item.shopeeUrl) {
            const shopeeInfo = await fetchShopeePrice(null, null, item.shopeeUrl);
            currentPrice = shopeeInfo.price;
          }

          if (!currentPrice || currentPrice <= 0) {
            continue;
          }

          // Lưu vào lịch sử giá
          await prisma.priceHistory.create({
            data: {
              trackingItemId: item.id,
              price: currentPrice,
            },
          });

          // So sánh giá với targetPrice
          if (currentPrice <= item.targetPrice.toNumber()) {
            await prisma.trackingItem.update({
              where: { id: item.id },
              data: { status: "TARGET_HIT" },
            });
            console.log(
              `[CRON] TING TING SẬP GIÁ: Sản phẩm ${
                item.productName || item.id
              } đã đạt giá mục tiêu (${currentPrice} <= ${item.targetPrice.toNumber()})!`
            );
          } else {
            console.log(
              `[CRON] Sản phẩm ${item.productName || item.id} giá hiện tại: ${currentPrice}, chưa đạt mục tiêu (${item.targetPrice.toNumber()}).`
            );
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
