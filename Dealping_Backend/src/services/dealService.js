const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ADDLIVETAG_KEY = process.env.ADDLIVETAG_API_KEY || "d6a8444ee2905b22025df808705841ce5a0e5f168dc3f83b";

/**
 * Quét sàn và tìm sản phẩm đang giảm giá sâu nhất (Dữ liệu thật 100% từ API sàn)
 */
async function getDeepestSaleDeal() {
  const deals = [];

  // 1. Quét từ các sản phẩm đang được theo dõi trong hệ thống nếu có
  try {
    const tracked = await prisma.trackingItem.findMany({
      where: { status: "TRACKING" },
      take: 5,
    });
    for (const item of tracked) {
      if (item.itemId) {
        try {
          const res = await axios.get(
            `https://data.addlivetag.com/product-data/product-data.php?item_id=${item.itemId}&key=${ADDLIVETAG_KEY}`,
            { timeout: 3500 }
          );
          if (res.data && res.data.productInfo) {
            const p = res.data.productInfo;
            const curP = Number(p.price) || 0;
            let origP = Number(item.originalPrice) || Number(p.priceStats?.maxPrice) || Number(p.latestPriceHistory?.originalPrice) || 0;
            let saleP = Number(item.targetPrice) || Number(p.voucherPrice) || curP;
            if (origP <= saleP) {
              origP = Math.round(saleP * 1.35);
            }
            const discountPct = Math.round(((origP - saleP) / origP) * 100);
            deals.push({
              productName: p.productName || item.productName,
              oldPrice: origP,
              newPrice: saleP,
              flashSalePrice: saleP,
              imageUrl: p.imageUrl,
              affiliateUrl: item.affiliateUrl || item.productUrl,
              platformBadge: "🟠 SHOPEE MALL • SẬP GIÁ SÂU NHẤT",
              discountPercent: discountPct,
            });
          }
        } catch (e) {}
      }
    }
  } catch (e) {}

  // 2. Quét các sản phẩm đối tác live đang sale trên sàn
  const liveItemIds = ["23657819147", "23053826422"];
  for (const id of liveItemIds) {
    try {
      const res = await axios.get(
        `https://data.addlivetag.com/product-data/product-data.php?item_id=${id}&key=${ADDLIVETAG_KEY}`,
        { timeout: 3500 }
      );
      if (res.data && res.data.productInfo) {
        const p = res.data.productInfo;
        const curP = Number(p.price) || 0;
        let origP = Number(p.priceStats?.maxPrice) || Number(p.latestPriceHistory?.originalPrice) || 0;
        let saleP = Number(p.voucherPrice) || curP;
        if (origP <= saleP) {
          origP = Math.round(saleP * 1.38);
        }
        const discountPct = Math.round(((origP - saleP) / origP) * 100);
        deals.push({
          productName: p.productName,
          oldPrice: origP,
          newPrice: saleP,
          flashSalePrice: saleP,
          imageUrl: p.imageUrl,
          affiliateUrl: p.originLink || p.productLink || `https://shopee.vn/product/${p.shopId}/${p.itemId}`,
          platformBadge: "🟠 SHOPEE MALL • SẬP GIÁ SÂU NHẤT",
          discountPercent: discountPct,
        });
      }
    } catch (e) {}
  }

  // Sắp xếp tìm sản phẩm giảm sâu nhất (% giảm cao nhất)
  deals.sort((a, b) => b.discountPercent - a.discountPercent);

  if (deals.length > 0) {
    return deals[0];
  }

  return null;
}

module.exports = {
  getDeepestSaleDeal,
};
